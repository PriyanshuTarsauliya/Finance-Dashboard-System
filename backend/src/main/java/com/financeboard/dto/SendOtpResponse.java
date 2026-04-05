package com.financeboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class SendOtpResponse {
    private String message;
    private String phone;
    /** Only populated in dev/demo mode for testing */
    private String otp;
}
