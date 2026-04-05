package com.financeboard.controller;

import com.financeboard.dto.*;
import com.financeboard.enums.TransactionType;
import com.financeboard.service.RecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
@Tag(name = "Records", description = "Financial record endpoints")
public class RecordController {

    private final RecordService recordService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "List financial records (paginated, filterable, searchable)")
    public ResponseEntity<PageResponse<RecordResponse>> getAllRecords(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        page = Math.max(page, 0);
        size = Math.max(1, Math.min(size, 50));
        return ResponseEntity.ok(recordService.getAllRecords(type, category, startDate, endDate, search, page, size, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @Operation(summary = "Get a single financial record")
    public ResponseEntity<RecordResponse> getRecordById(@PathVariable UUID id) {
        return ResponseEntity.ok(recordService.getRecordById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a financial record (Admin only)")
    public ResponseEntity<RecordResponse> createRecord(@Valid @RequestBody CreateRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recordService.createRecord(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a financial record (Admin only)")
    public ResponseEntity<RecordResponse> updateRecord(@PathVariable UUID id, @Valid @RequestBody UpdateRecordRequest request) {
        return ResponseEntity.ok(recordService.updateRecord(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft-delete a financial record (Admin only)")
    public ResponseEntity<Void> deleteRecord(@PathVariable UUID id) {
        recordService.softDeleteRecord(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear-all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Clear all financial data")
    public ResponseEntity<Void> clearAllData() {
        recordService.clearAllData();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export all financial data as CSV")
    public ResponseEntity<String> exportData() {
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"transactions.csv\"")
                .header("Content-Type", "text/csv")
                .body(recordService.exportData());
    }
}
