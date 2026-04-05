package com.financeboard.dto;

import com.financeboard.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be 2-50 characters")
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    private Role role;
}
