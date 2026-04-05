package com.financeboard.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA AttributeConverter that transparently encrypts/decrypts String fields.
 * Apply to entity fields with: @Convert(converter = EncryptedStringConverter.class)
 */
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        EncryptionUtil util = EncryptionUtil.getInstance();
        if (util == null) return attribute; // fallback during startup
        return util.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        EncryptionUtil util = EncryptionUtil.getInstance();
        if (util == null) return dbData; // fallback during startup
        return util.decrypt(dbData);
    }
}
