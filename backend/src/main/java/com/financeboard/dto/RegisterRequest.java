package com.financeboard.dto;

import java.time.LocalDate;

import com.financeboard.enums.Role;
import com.financeboard.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be 2-50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private LocalDate dateOfBirth;

    private Gender gender;

    private Role role = Role.VIEWER;

    private String turnstileToken;
}
