package com.financeboard.entity;

import com.financeboard.enums.Theme;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Theme theme = Theme.SYSTEM;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "email_notifications", nullable = false)
    @Builder.Default
    private boolean emailNotifications = true;

    @Column(name = "budget_alerts", nullable = false)
    @Builder.Default
    private boolean budgetAlerts = true;

    @Column(name = "monthly_reports", nullable = false)
    @Builder.Default
    private boolean monthlyReports = true;

    @Column(name = "auto_save", nullable = false)
    @Builder.Default
    private boolean autoSave = true;

    @Column(name = "animations", nullable = false)
    @Builder.Default
    private boolean animations = true;

    @Column(name = "date_format", nullable = false, length = 20)
    @Builder.Default
    private String dateFormat = "DD/MM/YYYY";
}
