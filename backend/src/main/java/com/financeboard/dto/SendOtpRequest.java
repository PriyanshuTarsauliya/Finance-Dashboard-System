package com.financeboard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendOtpRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String countryCode = "+91";

    private String turnstileToken;
}
