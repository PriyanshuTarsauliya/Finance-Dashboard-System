package com.financeboard.service;

import com.financeboard.dto.*;
import com.financeboard.entity.User;
import com.financeboard.enums.Role;
import com.financeboard.enums.Status;
import com.financeboard.exception.DuplicateEmailException;
import com.financeboard.exception.ResourceNotFoundException;
import com.financeboard.mapper.UserMapper;
import com.financeboard.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserMapper userMapper;

    @InjectMocks private UserService userService;

    private User testUser;
    private UserResponse testResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .name("Test User")
                .email("test@finance.com")
                .password("$2a$10$hashedPassword")
                .role(Role.ANALYST)
                .status(Status.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testResponse = UserResponse.builder()
                .id(testUser.getId())
                .name(testUser.getName())
                .email(testUser.getEmail())
                .role(testUser.getRole())
                .status(testUser.getStatus())
                .createdAt(testUser.getCreatedAt())
                .updatedAt(testUser.getUpdatedAt())
                .build();
    }

    @Nested
    @DisplayName("Get All Users")
    class GetAllUsers {

        @Test
        @DisplayName("Should return paginated user list")
        void shouldReturnPaginatedUsers() {
            Page<User> page = new PageImpl<>(List.of(testUser));
            when(userRepository.findAll(any(Pageable.class))).thenReturn(page);
            when(userMapper.toResponse(testUser)).thenReturn(testResponse);

            PageResponse<UserResponse> result = userService.getAllUsers(0, 10, "createdAt", "desc");

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getName()).isEqualTo("Test User");
            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should sort ascending when specified")
        void shouldSortAscending() {
            Page<User> page = new PageImpl<>(List.of(testUser));
            when(userRepository.findAll(any(Pageable.class))).thenReturn(page);
            when(userMapper.toResponse(any())).thenReturn(testResponse);

            PageResponse<UserResponse> result = userService.getAllUsers(0, 10, "name", "asc");

            assertThat(result.getContent()).hasSize(1);
            verify(userRepository).findAll(any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("Get User By ID")
    class GetUserById {

        @Test
        @DisplayName("Should return user when found")
        void shouldReturnUserWhenFound() {
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(userMapper.toResponse(testUser)).thenReturn(testResponse);

            UserResponse result = userService.getUserById(testUser.getId());

            assertThat(result.getEmail()).isEqualTo("test@finance.com");
        }

        @Test
        @DisplayName("Should throw 404 when user not found")
        void shouldThrow404WhenNotFound() {
            UUID randomId = UUID.randomUUID();
            when(userRepository.findById(randomId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserById(randomId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining(randomId.toString());
        }
    }

    @Nested
    @DisplayName("Create User")
    class CreateUser {

        @Test
        @DisplayName("Should create user successfully")
        void shouldCreateUser() {
            CreateUserRequest request = new CreateUserRequest();
            request.setName("New User");
            request.setEmail("new@finance.com");
            request.setPassword("Password@123");
            request.setRole(Role.VIEWER);
            request.setStatus(Status.ACTIVE);

            when(userRepository.existsByEmail("new@finance.com")).thenReturn(false);
            when(passwordEncoder.encode("Password@123")).thenReturn("$2a$10$encoded");
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userMapper.toResponse(testUser)).thenReturn(testResponse);

            UserResponse result = userService.createUser(request);

            assertThat(result).isNotNull();
            verify(passwordEncoder).encode("Password@123");
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should reject duplicate email")
        void shouldRejectDuplicateEmail() {
            CreateUserRequest request = new CreateUserRequest();
            request.setName("Dup User");
            request.setEmail("test@finance.com");
            request.setPassword("Password@123");
            request.setRole(Role.VIEWER);

            when(userRepository.existsByEmail("test@finance.com")).thenReturn(true);

            assertThatThrownBy(() -> userService.createUser(request))
                    .isInstanceOf(DuplicateEmailException.class)
                    .hasMessageContaining("test@finance.com");

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Update User")
    class UpdateUser {

        @Test
        @DisplayName("Should update user name and role")
        void shouldUpdateNameAndRole() {
            UpdateUserRequest request = new UpdateUserRequest();
            request.setName("Updated Name");
            request.setRole(Role.ADMIN);

            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userMapper.toResponse(any())).thenReturn(testResponse);

            userService.updateUser(testUser.getId(), request);

            verify(userRepository).save(argThat(user ->
                    user.getName().equals("Updated Name") &&
                    user.getRole() == Role.ADMIN
            ));
        }

        @Test
        @DisplayName("Should reject duplicate email on update")
        void shouldRejectDuplicateEmailOnUpdate() {
            UpdateUserRequest request = new UpdateUserRequest();
            request.setName("Test");
            request.setEmail("taken@finance.com");

            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(userRepository.existsByEmail("taken@finance.com")).thenReturn(true);

            assertThatThrownBy(() -> userService.updateUser(testUser.getId(), request))
                    .isInstanceOf(DuplicateEmailException.class);
        }
    }

    @Nested
    @DisplayName("Toggle Status")
    class ToggleStatus {

        @Test
        @DisplayName("Should toggle ACTIVE to INACTIVE")
        void shouldToggleActiveToInactive() {
            testUser.setStatus(Status.ACTIVE);
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userMapper.toResponse(any())).thenReturn(testResponse);

            userService.toggleStatus(testUser.getId());

            verify(userRepository).save(argThat(user ->
                    user.getStatus() == Status.INACTIVE
            ));
        }

        @Test
        @DisplayName("Should toggle INACTIVE to ACTIVE")
        void shouldToggleInactiveToActive() {
            testUser.setStatus(Status.INACTIVE);
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userMapper.toResponse(any())).thenReturn(testResponse);

            userService.toggleStatus(testUser.getId());

            verify(userRepository).save(argThat(user ->
                    user.getStatus() == Status.ACTIVE
            ));
        }
    }

    @Nested
    @DisplayName("Delete User")
    class DeleteUser {

        @Test
        @DisplayName("Should delete user successfully")
        void shouldDeleteUser() {
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

            userService.deleteUser(testUser.getId());

            verify(userRepository).delete(testUser);
        }

        @Test
        @DisplayName("Should throw 404 when deleting non-existent user")
        void shouldThrow404WhenDeletingNonExistent() {
            UUID randomId = UUID.randomUUID();
            when(userRepository.findById(randomId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deleteUser(randomId))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
