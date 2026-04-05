package com.financeboard.controller;

import com.financeboard.dto.*;
import com.financeboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard analytics endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','VIEWER')")
    @Operation(summary = "Get dashboard summary (income, expenses, net balance, record count)")
    public ResponseEntity<DashboardSummary> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/category-totals")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "Get expense/income breakdown by category")
    public ResponseEntity<List<CategoryTotal>> getCategoryTotals() {
        return ResponseEntity.ok(dashboardService.getCategoryTotals());
    }

    @GetMapping("/monthly-trends")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "Get monthly income vs expense trends for given year")
    public ResponseEntity<List<TrendData>> getMonthlyTrends(@RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(dashboardService.getMonthlyTrends(year));
    }

    @GetMapping("/weekly-trends")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "Get weekly breakdown for given month")
    public ResponseEntity<List<TrendData>> getWeeklyTrends(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(dashboardService.getWeeklyTrends(year, month));
    }

    @GetMapping("/daily-trends")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "Get daily breakdown for given month")
    public ResponseEntity<List<TrendData>> getDailyTrends(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(dashboardService.getDailyTrends(year, month));
    }

    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','VIEWER')")
    @Operation(summary = "Get last 10 transactions")
    public ResponseEntity<List<RecordResponse>> getRecentRecords() {
        return ResponseEntity.ok(dashboardService.getRecentRecords());
    }
}
