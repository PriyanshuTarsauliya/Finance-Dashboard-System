package com.financeboard.service;

import com.financeboard.dto.UpdatePreferenceRequest;
import com.financeboard.dto.UserPreferenceResponse;
import com.financeboard.entity.User;
import com.financeboard.entity.UserPreference;
import com.financeboard.enums.Theme;
import com.financeboard.exception.ResourceNotFoundException;
import com.financeboard.repository.UserPreferenceRepository;
import com.financeboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreferenceService {

    private final UserPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    @Transactional
    public UserPreferenceResponse getUserPreferences() {
        User user = getCurrentUser();
        UserPreference preference = preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreference(user));
        
        return mapToResponse(preference);
    }

    @Transactional
    public UserPreferenceResponse updatePreferences(UpdatePreferenceRequest request) {
        User user = getCurrentUser();
        UserPreference preference = preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreference(user));
        
        preference.setTheme(request.getTheme());
        preference.setCurrency(request.getCurrency());
        preference.setEmailNotifications(request.isEmailNotifications());
        preference.setBudgetAlerts(request.isBudgetAlerts());
        preference.setMonthlyReports(request.isMonthlyReports());
        preference.setAutoSave(request.isAutoSave());
        preference.setAnimations(request.isAnimations());
        preference.setDateFormat(request.getDateFormat());

        preference = preferenceRepository.save(preference);
        
        return mapToResponse(preference);
    }

    @Transactional
    public void updateProfile(com.financeboard.dto.UpdateProfileRequest request) {
        User user = getCurrentUser();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        userRepository.save(user);
    }

    private UserPreferenceResponse mapToResponse(UserPreference preference) {
        return UserPreferenceResponse.builder()
                .theme(preference.getTheme())
                .currency(preference.getCurrency())
                .emailNotifications(preference.isEmailNotifications())
                .budgetAlerts(preference.isBudgetAlerts())
                .monthlyReports(preference.isMonthlyReports())
                .autoSave(preference.isAutoSave())
                .animations(preference.isAnimations())
                .dateFormat(preference.getDateFormat())
                .build();
    }

    private UserPreference createDefaultPreference(User user) {
        UserPreference pref = UserPreference.builder()
                .user(user)
                .theme(Theme.SYSTEM)
                .currency("INR")
                .emailNotifications(true)
                .budgetAlerts(true)
                .monthlyReports(true)
                .autoSave(true)
                .animations(true)
                .dateFormat("DD/MM/YYYY")
                .build();
        return preferenceRepository.save(pref);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
