package com.financeboard.dto;

import com.financeboard.enums.Theme;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePreferenceRequest {
    
    @NotNull(message = "Theme is required")
    private Theme theme;
    
    private String currency;
    private boolean emailNotifications;
    private boolean budgetAlerts;
    private boolean monthlyReports;
    private boolean autoSave;
    private boolean animations;
    private String dateFormat;
}
