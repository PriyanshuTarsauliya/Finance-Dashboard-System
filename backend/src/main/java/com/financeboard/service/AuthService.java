package com.financeboard.service;

import com.financeboard.dto.*;
import com.financeboard.entity.User;
import com.financeboard.enums.Role;
import com.financeboard.exception.DuplicateEmailException;
import com.financeboard.exception.ResourceNotFoundException;
import com.financeboard.mapper.UserMapper;
import com.financeboard.repository.UserRepository;
import com.financeboard.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final GoogleOAuthService googleOAuthService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.VIEWER)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getId());

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        log.info("Login successful for user: {}", user.getId());
        return buildAuthResponse(user);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        String email = jwtUtil.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        log.info("Token refreshed for user: {}", user.getId());
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        log.info("Attempting Google login");

        com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = googleOAuthService.verifyToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid Google token. Ensure Google Client ID is configured."));

        String email = payload.getEmail();
        String name = (String) payload.get("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Creating new user from Google login: {}", email);
            User newUser = User.builder()
                    .name(name != null ? name : "Google User")
                    .email(email)
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString())) // Random password
                    .role(Role.VIEWER)
                    .build();
            return userRepository.save(newUser);
        });

        log.info("Google login successful for user: {}", user.getId());
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse loginOrRegisterByPhone(String phone, VerifyOtpRequest request) {
        log.info("OTP login/register for phone: {}", phone);

        User user = userRepository.findByPhone(phone).orElseGet(() -> {
            log.info("Creating new user from phone login: {}", phone);
            String name = request.getName();
            String displayName = (name != null && !name.isBlank()) ? name : "User " + phone.substring(phone.length() - 4);
            User newUser = User.builder()
                    .name(displayName)
                    .email(phone + "@phone.local") // Placeholder email for phone-only users
                    .phone(phone)
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .role(Role.VIEWER)
                    .dateOfBirth(request.getDateOfBirth())
                    .gender(request.getGender())
                    .build();
            return userRepository.save(newUser);
        });

        // Update phone if user exists but has no phone stored
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            user.setPhone(phone);
            userRepository.save(user);
        }

        log.info("OTP login successful for user: {}", user.getId());
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return new AuthResponse(accessToken, refreshToken, jwtUtil.getAccessExpirationMs(), userMapper.toResponse(user));
    }
}
