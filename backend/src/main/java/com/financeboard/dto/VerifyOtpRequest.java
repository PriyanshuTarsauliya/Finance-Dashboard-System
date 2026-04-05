package com.financeboard.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import com.financeboard.enums.Gender;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyOtpRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String countryCode = "+91";

    @NotBlank(message = "OTP is required")
    @Size(min = 6, max = 6, message = "OTP must be 6 digits")
    private String otp;

    /** Optional: name for registration flow (if user doesn't exist yet) */
    private String name;

    private LocalDate dateOfBirth;

    private Gender gender;
}
