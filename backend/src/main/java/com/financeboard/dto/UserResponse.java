package com.financeboard.dto;

import com.financeboard.enums.Gender;
import com.financeboard.enums.Role;
import com.financeboard.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private Role role;
    private Status status;
    private LocalDate dateOfBirth;
    private Gender gender;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
