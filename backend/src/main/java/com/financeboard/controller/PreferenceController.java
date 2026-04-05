package com.financeboard.controller;

import com.financeboard.dto.UpdatePreferenceRequest;
import com.financeboard.dto.UserPreferenceResponse;
import com.financeboard.service.PreferenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
@Tag(name = "Preferences", description = "User settings and preferences endpoints")
public class PreferenceController {

    private final PreferenceService preferenceService;

    @GetMapping
    @Operation(summary = "Get current user preferences")
    public ResponseEntity<UserPreferenceResponse> getPreferences() {
        return ResponseEntity.ok(preferenceService.getUserPreferences());
    }

    @PutMapping
    @Operation(summary = "Update current user preferences")
    public ResponseEntity<UserPreferenceResponse> updatePreferences(@Valid @RequestBody UpdatePreferenceRequest request) {
        return ResponseEntity.ok(preferenceService.updatePreferences(request));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile (name and email)")
    public ResponseEntity<Void> updateProfile(@Valid @RequestBody com.financeboard.dto.UpdateProfileRequest request) {
        preferenceService.updateProfile(request);
        return ResponseEntity.noContent().build();
    }
}
