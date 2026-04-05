package com.financeboard.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
@Slf4j
public class GoogleOAuthService {

    private final String clientId;

    public GoogleOAuthService(@Value("${app.google.client-id}") String clientId) {
        this.clientId = clientId;
    }

    public Optional<GoogleIdToken.Payload> verifyToken(String idTokenString) {
        // If the client ID is the placeholder, we shouldn't attempt actual verification.
        // We will just return empty or throw to indicate it is not configured.
        if ("YOUR_GOOGLE_CLIENT_ID".equals(clientId)) {
            log.warn("Google Client ID is not configured. Cannot verify token.");
            return Optional.empty();
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                return Optional.of(idToken.getPayload());
            } else {
                log.warn("Invalid Google ID token.");
            }
        } catch (Exception e) {
            log.error("Error verifying Google ID token", e);
        }
        return Optional.empty();
    }
}
