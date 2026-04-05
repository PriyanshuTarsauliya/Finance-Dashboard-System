package com.financeboard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financeboard.exception.TurnstileException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Service to verify Cloudflare Turnstile tokens.
 * Calls Cloudflare's siteverify API to validate the client-side token.
 */
@Service
@Slf4j
public class TurnstileService {

    private static final String VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    @Value("${app.turnstile.secret-key}")
    private String secretKey;

    @Value("${app.turnstile.enabled:true}")
    private boolean enabled;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Verifies a Turnstile token with Cloudflare's API.
     * If Turnstile is disabled in config, this is a no-op.
     *
     * @param token The cf-turnstile-response token from the frontend
     * @throws TurnstileException if verification fails
     */
    public void verify(String token) {
        if (!enabled) {
            log.debug("Turnstile verification is disabled, skipping");
            return;
        }

        if (token == null || token.isBlank()) {
            throw new TurnstileException("Turnstile verification token is missing");
        }

        try {
            String requestBody = String.format(
                    "{\"secret\":\"%s\",\"response\":\"%s\"}",
                    secretKey, token
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(VERIFY_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode jsonNode = objectMapper.readTree(response.body());

            boolean success = jsonNode.has("success") && jsonNode.get("success").asBoolean();

            if (!success) {
                String errorCodes = jsonNode.has("error-codes")
                        ? jsonNode.get("error-codes").toString()
                        : "unknown";
                log.warn("Turnstile verification failed. Error codes: {}", errorCodes);
                throw new TurnstileException("Bot verification failed. Please try again.");
            }

            log.debug("Turnstile verification passed");
        } catch (TurnstileException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error calling Cloudflare Turnstile API", e);
            throw new TurnstileException("Bot verification service unavailable. Please try again later.");
        }
    }
}
