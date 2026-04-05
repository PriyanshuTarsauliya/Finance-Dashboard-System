package com.financeboard.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financeboard.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * Returns 401 Unauthorized (with JSON body) for unauthenticated requests
 * instead of Spring Security's default 403.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        // Determine a helpful message based on request attribute set by JwtFilter
        String errorDetail = (String) request.getAttribute("jwt_error");
        String message = errorDetail != null ? errorDetail : "Authentication required. Please provide a valid JWT token.";

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();

        objectMapper.findAndRegisterModules(); // for LocalDateTime serialization
        objectMapper.writeValue(response.getOutputStream(), error);
    }
}
