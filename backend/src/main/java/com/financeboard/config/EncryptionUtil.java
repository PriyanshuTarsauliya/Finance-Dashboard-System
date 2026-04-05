package com.financeboard.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM encryption utility for encrypting sensitive data at rest.
 * Uses a 256-bit key from application properties and random 12-byte IVs.
 */
@Component
public class EncryptionUtil {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128; // bits
    private static final int IV_LENGTH = 12; // bytes

    @Value("${app.encryption.secret}")
    private String base64Secret;

    private SecretKeySpec secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    private static EncryptionUtil instance;

    @PostConstruct
    public void init() {
        byte[] decodedKey = Base64.getDecoder().decode(base64Secret);
        if (decodedKey.length != 32) {
            throw new IllegalArgumentException("Encryption key must be exactly 32 bytes (256-bit) after Base64 decoding");
        }
        this.secretKey = new SecretKeySpec(decodedKey, "AES");
        instance = this;
    }

    public static EncryptionUtil getInstance() {
        return instance;
    }

    /**
     * Encrypts plaintext using AES-256-GCM.
     * Output format: Base64(IV + ciphertext + GCM-tag)
     */
    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) {
            return plaintext;
        }
        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes("UTF-8"));

            // Prepend IV to ciphertext: [IV (12 bytes) | ciphertext + tag]
            ByteBuffer byteBuffer = ByteBuffer.allocate(IV_LENGTH + ciphertext.length);
            byteBuffer.put(iv);
            byteBuffer.put(ciphertext);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypts AES-256-GCM ciphertext.
     * Input format: Base64(IV + ciphertext + GCM-tag)
     */
    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }
        try {
            byte[] decoded = Base64.getDecoder().decode(encryptedText);

            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[IV_LENGTH];
            byteBuffer.get(iv);
            byte[] ciphertext = new byte[byteBuffer.remaining()];
            byteBuffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, "UTF-8");
        } catch (Exception e) {
            // If decryption fails, return the original text (backward compatibility
            // for data that was stored before encryption was enabled)
            return encryptedText;
        }
    }
}
