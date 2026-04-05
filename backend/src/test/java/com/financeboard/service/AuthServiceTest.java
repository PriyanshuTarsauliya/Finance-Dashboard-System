package com.financeboard.service;

import com.financeboard.dto.AuthResponse;
import com.financeboard.dto.LoginRequest;
import com.financeboard.dto.RegisterRequest;
import com.financeboard.entity.User;
import com.financeboard.enums.Role;
import com.financeboard.enums.Status;
import com.financeboard.exception.DuplicateEmailException;
import com.financeboard.mapper.UserMapper;
import com.financeboard.repository.UserRepository;
import com.financeboard.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtil jwtUtil;
    @Mock private UserMapper userMapper;

    @InjectMocks private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .name("Test User")
                .email("test@finance.com")
                .password("$2a$10$hashedPassword")
                .role(Role.VIEWER)
                .status(Status.ACTIVE)
                .build();
    }

    @Nested
    @DisplayName("Registration")
    class Registration {

        @Test
        @DisplayName("Should register a new user successfully")
        void shouldRegisterNewUser() {
            RegisterRequest request = new RegisterRequest();
            request.setName("Test User");
            request.setEmail("test@finance.com");
            request.setPassword("Password@123");

            when(userRepository.existsByEmail("test@finance.com")).thenReturn(false);
            when(passwordEncoder.encode("Password@123")).thenReturn("$2a$10$hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(jwtUtil.generateAccessToken(any(), any(), any())).thenReturn("access-token");
            when(jwtUtil.generateRefreshToken(any())).thenReturn("refresh-token");
            when(jwtUtil.getAccessExpirationMs()).thenReturn(86400000L);
            when(userMapper.toResponse(any())).thenReturn(null);

            AuthResponse response = authService.register(request);

            assertThat(response.getAccessToken()).isEqualTo("access-token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
            assertThat(response.getTokenType()).isEqualTo("Bearer");
            verify(userRepository).save(any(User.class));
            verify(passwordEncoder).encode("Password@123");
        }

        @Test
        @DisplayName("Should reject duplicate email")
        void shouldRejectDuplicateEmail() {
            RegisterRequest request = new RegisterRequest();
            request.setName("Test User");
            request.setEmail("test@finance.com");
            request.setPassword("Password@123");

            when(userRepository.existsByEmail("test@finance.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(DuplicateEmailException.class)
                    .hasMessageContaining("test@finance.com");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should default role to VIEWER when not specified")
        void shouldDefaultRoleToViewer() {
            RegisterRequest request = new RegisterRequest();
            request.setName("New User");
            request.setEmail("new@finance.com");
            request.setPassword("Password@123");
            // role is not set → should default to VIEWER

            when(userRepository.existsByEmail(any())).thenReturn(false);
            when(passwordEncoder.encode(any())).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User saved = invocation.getArgument(0);
                assertThat(saved.getRole()).isEqualTo(Role.VIEWER);
                saved.setId(UUID.randomUUID());
                return saved;
            });
            when(jwtUtil.generateAccessToken(any(), any(), any())).thenReturn("token");
            when(jwtUtil.generateRefreshToken(any())).thenReturn("refresh");
            when(jwtUtil.getAccessExpirationMs()).thenReturn(86400000L);

            authService.register(request);
            verify(userRepository).save(argThat(user -> user.getRole() == Role.VIEWER));
        }
    }

    @Nested
    @DisplayName("Login")
    class Login {

        @Test
        @DisplayName("Should login successfully with valid credentials")
        void shouldLoginWithValidCredentials() {
            LoginRequest request = new LoginRequest();
            request.setEmail("test@finance.com");
            request.setPassword("Password@123");

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken("test@finance.com", null));
            when(userRepository.findByEmail("test@finance.com")).thenReturn(Optional.of(testUser));
            when(jwtUtil.generateAccessToken(any(), any(), any())).thenReturn("access-token");
            when(jwtUtil.generateRefreshToken(any())).thenReturn("refresh-token");
            when(jwtUtil.getAccessExpirationMs()).thenReturn(86400000L);

            AuthResponse response = authService.login(request);

            assertThat(response.getAccessToken()).isNotBlank();
            verify(authenticationManager).authenticate(any());
        }

        @Test
        @DisplayName("Should reject invalid credentials")
        void shouldRejectInvalidCredentials() {
            LoginRequest request = new LoginRequest();
            request.setEmail("test@finance.com");
            request.setPassword("WrongPassword");

            when(authenticationManager.authenticate(any()))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class);
        }
    }
}
