package com.financeboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financeboard.dto.LoginRequest;
import com.financeboard.dto.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@DisplayName("Integration Tests — Auth & Access Control")
class AuthIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    // ─── Helper: login and extract JWT ───
    private String loginAs(String email, String password) throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("accessToken").asText();
    }

    @Nested
    @DisplayName("Authentication Endpoints")
    class AuthEndpoints {

        @Test
        @DisplayName("POST /api/auth/login — valid credentials → 200 + JWT")
        void loginWithValidCredentials() throws Exception {
            LoginRequest request = new LoginRequest();
            request.setEmail("admin@finance.com");
            request.setPassword("Admin@123");

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.user.email").value("admin@finance.com"))
                    .andExpect(jsonPath("$.user.role").value("ADMIN"));
        }

        @Test
        @DisplayName("POST /api/auth/login — invalid password → 401")
        void loginWithInvalidPassword() throws Exception {
            LoginRequest request = new LoginRequest();
            request.setEmail("admin@finance.com");
            request.setPassword("WrongPassword");

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Invalid email or password"));
        }

        @Test
        @DisplayName("POST /api/auth/register — missing fields → 400 with validation errors")
        void registerWithMissingFields() throws Exception {
            RegisterRequest request = new RegisterRequest();
            // All fields blank

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.message").isNotEmpty());
        }
    }

    @Nested
    @DisplayName("Access Control (Role-Based)")
    class AccessControl {

        @Test
        @DisplayName("Admin can access user management endpoints")
        void adminCanAccessUserManagement() throws Exception {
            String adminToken = loginAs("admin@finance.com", "Admin@123");

            mockMvc.perform(get("/api/users")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("Viewer CANNOT access user management → 403")
        void viewerCannotAccessUserManagement() throws Exception {
            String viewerToken = loginAs("viewer@finance.com", "Viewer@123");

            mockMvc.perform(get("/api/users")
                            .header("Authorization", "Bearer " + viewerToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Analyst CANNOT create records → 403")
        void analystCannotCreateRecords() throws Exception {
            String analystToken = loginAs("analyst@finance.com", "Analyst@123");

            mockMvc.perform(post("/api/records")
                            .header("Authorization", "Bearer " + analystToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"amount\":100,\"type\":\"INCOME\",\"category\":\"Test\",\"date\":\"2026-04-01\"}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Viewer CANNOT access financial records → 403")
        void viewerCannotAccessRecords() throws Exception {
            String viewerToken = loginAs("viewer@finance.com", "Viewer@123");

            mockMvc.perform(get("/api/records")
                            .header("Authorization", "Bearer " + viewerToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Analyst CAN access financial records → 200")
        void analystCanAccessRecords() throws Exception {
            String analystToken = loginAs("analyst@finance.com", "Analyst@123");

            mockMvc.perform(get("/api/records")
                            .header("Authorization", "Bearer " + analystToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("All roles can view dashboard summary")
        void allRolesCanViewSummary() throws Exception {
            String viewerToken = loginAs("viewer@finance.com", "Viewer@123");

            mockMvc.perform(get("/api/dashboard/summary")
                            .header("Authorization", "Bearer " + viewerToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalIncome").isNumber())
                    .andExpect(jsonPath("$.totalExpenses").isNumber())
                    .andExpect(jsonPath("$.netBalance").isNumber())
                    .andExpect(jsonPath("$.totalRecords").isNumber());
        }

        @Test
        @DisplayName("Viewer CANNOT access analytics endpoints → 403")
        void viewerCannotAccessAnalytics() throws Exception {
            String viewerToken = loginAs("viewer@finance.com", "Viewer@123");

            mockMvc.perform(get("/api/dashboard/category-totals")
                            .header("Authorization", "Bearer " + viewerToken))
                    .andExpect(status().isForbidden());

            mockMvc.perform(get("/api/dashboard/monthly-trends")
                            .header("Authorization", "Bearer " + viewerToken))
                    .andExpect(status().isForbidden());

            mockMvc.perform(get("/api/dashboard/weekly-trends")
                            .header("Authorization", "Bearer " + viewerToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Unauthenticated request → 401 Unauthorized")
        void unauthenticatedRequestBlocked() throws Exception {
            mockMvc.perform(get("/api/records"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status").value(401))
                    .andExpect(jsonPath("$.error").value("Unauthorized"));
        }

        @Test
        @DisplayName("Invalid token → 401 Unauthorized")
        void invalidTokenReturns401() throws Exception {
            mockMvc.perform(get("/api/records")
                            .header("Authorization", "Bearer invalid.token.here"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value("Invalid token"));
        }
    }

    @Nested
    @DisplayName("Dashboard Endpoints")
    class DashboardEndpoints {

        @Test
        @DisplayName("Monthly trends returns all 12 months")
        void monthlyTrendsReturnsAllMonths() throws Exception {
            String analystToken = loginAs("analyst@finance.com", "Analyst@123");

            mockMvc.perform(get("/api/dashboard/monthly-trends")
                            .header("Authorization", "Bearer " + analystToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$.length()").value(12))
                    .andExpect(jsonPath("$[0].period").value(1))
                    .andExpect(jsonPath("$[11].period").value(12));
        }

        @Test
        @DisplayName("Recent records returns max 10 items")
        void recentRecordsMaxTen() throws Exception {
            String viewerToken = loginAs("viewer@finance.com", "Viewer@123");

            mockMvc.perform(get("/api/dashboard/recent")
                            .header("Authorization", "Bearer " + viewerToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$.length()", lessThanOrEqualTo(10)));
        }
    }

    @Nested
    @DisplayName("Health Check & Public Endpoints")
    class PublicEndpoints {

        @Test
        @DisplayName("GET /api/health — accessible without auth")
        void healthCheckPublic() throws Exception {
            mockMvc.perform(get("/api/health"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("UP"))
                    .andExpect(jsonPath("$.service").value("financeboard-api"));
        }
    }
}

