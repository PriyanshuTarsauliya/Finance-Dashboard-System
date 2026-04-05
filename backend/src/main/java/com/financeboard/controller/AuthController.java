package com.financeboard.controller;

import com.financeboard.dto.*;
import com.financeboard.service.AuthService;
import com.financeboard.service.OtpService;
import com.financeboard.service.TurnstileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication endpoints")
public class AuthController {

    private final AuthService authService;
    private final TurnstileService turnstileService;
    private final OtpService otpService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        turnstileService.verify(request.getTurnstileToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        turnstileService.verify(request.getTurnstileToken());
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/google")
    @Operation(summary = "Login with Google OAuth token")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request));
    }

    @PostMapping("/send-otp")
    @Operation(summary = "Send a 6-digit OTP to the given phone number")
    public ResponseEntity<SendOtpResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        turnstileService.verify(request.getTurnstileToken());
        String fullPhone = request.getCountryCode() + request.getPhone();
        String otp = otpService.generateOtp(fullPhone);

        return ResponseEntity.ok(SendOtpResponse.builder()
                .message("OTP sent successfully")
                .phone(fullPhone)
                .otp(otp) // Included for dev/demo — remove in production
                .build());
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and login/register the user")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String fullPhone = request.getCountryCode() + request.getPhone();
        boolean valid = otpService.verifyOtp(fullPhone, request.getOtp());

        if (!valid) {
            throw new RuntimeException("Invalid or expired OTP. Please request a new one.");
        }

        return ResponseEntity.ok(authService.loginOrRegisterByPhone(fullPhone, request));
    }
}
