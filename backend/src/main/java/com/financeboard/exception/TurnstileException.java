package com.financeboard.exception;

/**
 * Thrown when Cloudflare Turnstile bot verification fails.
 */
public class TurnstileException extends RuntimeException {
    public TurnstileException(String message) {
        super(message);
    }
}
