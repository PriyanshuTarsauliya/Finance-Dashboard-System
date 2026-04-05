package com.financeboard.service;

import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OTP service for mobile phone verification.
 * Uses Twilio Verify API when enabled, falls back to in-memory OTP for dev mode.
 */
@Service
@Slf4j
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final long OTP_VALIDITY_SECONDS = 300; // 5 minutes

    private final SecureRandom random = new SecureRandom();

    // Fallback in-memory store for dev mode
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    @Value("${app.twilio.enabled:false}")
    private boolean twilioEnabled;

    @Value("${app.twilio.account-sid:}")
    private String accountSid;

    @Value("${app.twilio.auth-token:}")
    private String authToken;

    @Value("${app.twilio.verify-service-sid:}")
    private String verifyServiceSid;

    @PostConstruct
    public void initTwilio() {
        if (twilioEnabled && isValidConfig()) {
            Twilio.init(accountSid, authToken);
            log.info("🟢 Twilio Verify API is ENABLED. Real SMS will be sent.");
        } else {
            log.warn("🟡 Twilio is DISABLED. OTPs will only be printed to console (dev mode).");
        }
    }

    /**
     * Send an OTP to the given phone number.
     * Uses Twilio Verify API if enabled, otherwise generates locally.
     *
     * @return the OTP string (only in dev mode; null when Twilio sends it)
     */
    public String generateOtp(String phone) {
        String normalizedPhone = normalizePhone(phone);

        if (twilioEnabled && isValidConfig()) {
            return sendViaTwilioVerify(normalizedPhone);
        } else {
            return sendViaDevMode(normalizedPhone);
        }
    }

    /**
     * Verify the OTP for the given phone number.
     */
    public boolean verifyOtp(String phone, String otp) {
        String normalizedPhone = normalizePhone(phone);

        if (twilioEnabled && isValidConfig()) {
            return verifyViaTwilioVerify(normalizedPhone, otp);
        } else {
            return verifyViaDevMode(normalizedPhone, otp);
        }
    }

    // ─── Twilio Verify API ────────────────────────────────────────

    private String sendViaTwilioVerify(String phone) {
        try {
            Verification verification = Verification.creator(verifyServiceSid, phone, "sms").create();
            log.info("═══════════════════════════════════════════");
            log.info("  📱 Twilio Verify SMS sent to {}", phone);
            log.info("  📋 Status: {}", verification.getStatus());
            log.info("═══════════════════════════════════════════");
            // Twilio Verify generates & sends the OTP itself — we don't know the code
            return null;
        } catch (Exception e) {
            log.error("❌ Twilio Verify failed for {}: {}", phone, e.getMessage());
            // Fall back to dev mode so the user isn't locked out
            log.warn("⚠️ Falling back to dev-mode OTP");
            return sendViaDevMode(phone);
        }
    }

    private boolean verifyViaTwilioVerify(String phone, String otp) {
        try {
            VerificationCheck check = VerificationCheck.creator(verifyServiceSid)
                    .setTo(phone)
                    .setCode(otp)
                    .create();
            boolean approved = "approved".equals(check.getStatus());
            log.info("Twilio Verify check for {}: status={}", phone, check.getStatus());
            return approved;
        } catch (Exception e) {
            log.error("❌ Twilio Verify check failed for {}: {}", phone, e.getMessage());
            // Fall back to dev mode verification
            return verifyViaDevMode(phone, otp);
        }
    }

    // ─── Dev-mode (in-memory) ─────────────────────────────────────

    private String sendViaDevMode(String phone) {
        String otp = generateRandomOtp();
        otpStore.put(phone, new OtpEntry(otp, Instant.now()));
        log.info("═══════════════════════════════════════════");
        log.info("  📱 [DEV] OTP for {} → {}", phone, otp);
        log.info("  ⏰ Valid for {} seconds", OTP_VALIDITY_SECONDS);
        log.info("═══════════════════════════════════════════");
        return otp;
    }

    private boolean verifyViaDevMode(String phone, String otp) {
        OtpEntry entry = otpStore.get(phone);
        if (entry == null) {
            log.warn("No OTP found for phone: {}", phone);
            return false;
        }
        long elapsed = Instant.now().getEpochSecond() - entry.createdAt().getEpochSecond();
        if (elapsed > OTP_VALIDITY_SECONDS) {
            log.warn("OTP expired for phone: {} (elapsed: {}s)", phone, elapsed);
            otpStore.remove(phone);
            return false;
        }
        if (!entry.code().equals(otp)) {
            log.warn("Invalid OTP for phone: {}", phone);
            return false;
        }
        otpStore.remove(phone);
        log.info("OTP verified successfully for phone: {}", phone);
        return true;
    }

    // ─── Helpers ──────────────────────────────────────────────────

    private String generateRandomOtp() {
        int bound = (int) Math.pow(10, OTP_LENGTH);
        int code = random.nextInt(bound);
        return String.format("%0" + OTP_LENGTH + "d", code);
    }

    private String normalizePhone(String phone) {
        return phone.replaceAll("[^+\\d]", "");
    }

    private boolean isValidConfig() {
        return accountSid != null && !accountSid.isBlank()
                && !accountSid.contains("your_account_sid")
                && verifyServiceSid != null && !verifyServiceSid.isBlank();
    }

    private record OtpEntry(String code, Instant createdAt) {}
}
