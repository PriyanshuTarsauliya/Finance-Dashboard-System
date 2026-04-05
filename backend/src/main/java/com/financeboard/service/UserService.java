package com.financeboard.service;

import com.financeboard.dto.*;
import com.financeboard.entity.User;
import com.financeboard.enums.Status;
import com.financeboard.exception.DuplicateEmailException;
import com.financeboard.exception.ResourceNotFoundException;
import com.financeboard.mapper.UserMapper;
import com.financeboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public PageResponse<UserResponse> getAllUsers(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<User> pageResult = userRepository.findAll(PageRequest.of(page, size, sort));

        return PageResponse.<UserResponse>builder()
                .content(pageResult.getContent().stream().map(userMapper::toResponse).toList())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    public UserResponse getUserById(UUID id) {
        return userMapper.toResponse(findUserOrThrow(id));
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already exists: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(request.getStatus())
                .build();

        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        log.info("Updating user: {}", id);
        User user = findUserOrThrow(id);

        user.setName(request.getName());
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateEmailException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse toggleStatus(UUID id) {
        log.info("Toggling status for user: {}", id);
        User user = findUserOrThrow(id);
        user.setStatus(user.getStatus() == Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(UUID id) {
        log.info("Deleting user: {}", id);
        User user = findUserOrThrow(id);
        userRepository.delete(user);
    }

    private User findUserOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
