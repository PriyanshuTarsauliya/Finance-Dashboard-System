package com.financeboard.dto;

import com.financeboard.enums.Theme;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferenceResponse {
    private Theme theme;
    private String currency;
    private boolean emailNotifications;
    private boolean budgetAlerts;
    private boolean monthlyReports;
    private boolean autoSave;
    private boolean animations;
    private String dateFormat;
}
