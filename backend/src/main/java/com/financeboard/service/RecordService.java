package com.financeboard.service;

import com.financeboard.dto.*;
import com.financeboard.entity.FinancialRecord;
import com.financeboard.entity.User;
import com.financeboard.enums.TransactionType;
import com.financeboard.exception.ResourceNotFoundException;
import com.financeboard.mapper.RecordMapper;
import com.financeboard.repository.FinancialRecordRepository;
import com.financeboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecordService {

    private final FinancialRecordRepository recordRepository;
    private final UserRepository userRepository;
    private final RecordMapper recordMapper;
    private final NotificationService notificationService;

    public PageResponse<RecordResponse> getAllRecords(
            TransactionType type, String category,
            LocalDate startDate, LocalDate endDate,
            String search,
            int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<FinancialRecord> pageResult = recordRepository.findAllFiltered(type, category, startDate, endDate, search, PageRequest.of(page, size, sort));

        return PageResponse.<RecordResponse>builder()
                .content(pageResult.getContent().stream().map(recordMapper::toResponse).toList())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    public RecordResponse getRecordById(UUID id) {
        return recordMapper.toResponse(findRecordOrThrow(id));
    }

    @Transactional
    public RecordResponse createRecord(CreateRecordRequest request) {
        User currentUser = getCurrentUser();
        log.info("Creating record by user: {}", currentUser.getId());

        FinancialRecord record = FinancialRecord.builder()
                .amount(request.getAmount())
                .type(request.getType())
                .category(request.getCategory())
                .date(request.getDate())
                .notes(request.getNotes())
                .createdBy(currentUser)
                .build();

        FinancialRecord savedRecord = recordRepository.save(record);
        
        notificationService.createNotification(
                currentUser, 
                "New " + request.getType() + " record of amount " + request.getAmount() + " added successfully.", 
                com.financeboard.enums.NotificationType.SUCCESS
        );

        return recordMapper.toResponse(savedRecord);
    }

    @Transactional
    public RecordResponse updateRecord(UUID id, UpdateRecordRequest request) {
        log.info("Updating record: {}", id);
        FinancialRecord record = findRecordOrThrow(id);

        record.setAmount(request.getAmount());
        record.setType(request.getType());
        record.setCategory(request.getCategory());
        record.setDate(request.getDate());
        record.setNotes(request.getNotes());

        return recordMapper.toResponse(recordRepository.save(record));
    }

    @Transactional
    public void softDeleteRecord(UUID id) {
        log.info("Soft deleting record: {}", id);
        FinancialRecord record = findRecordOrThrow(id);
        record.setDeletedAt(LocalDateTime.now());
        recordRepository.save(record);
    }

    @Transactional
    public void clearAllData() {
        log.info("Soft deleting all records by Administrator: {}", getCurrentUser().getId());
        java.util.List<FinancialRecord> all = recordRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        all.forEach(r -> r.setDeletedAt(now));
        recordRepository.saveAll(all);
    }

    @Transactional(readOnly = true)
    public String exportData() {
        log.info("Exporting all records by Administrator: {}", getCurrentUser().getId());
        java.util.List<FinancialRecord> all = recordRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Amount,Type,Category,Date,Notes,CreatedBy,CreatedAt\n");
        for (FinancialRecord r : all) {
            sb.append(r.getId()).append(",");
            sb.append(r.getAmount()).append(",");
            sb.append(r.getType()).append(",");
            sb.append(escapeCsv(r.getCategory())).append(",");
            sb.append(r.getDate()).append(",");
            sb.append(escapeCsv(r.getNotes())).append(",");
            sb.append(escapeCsv(r.getCreatedBy().getName())).append(",");
            sb.append(r.getCreatedAt()).append("\n");
        }
        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private FinancialRecord findRecordOrThrow(UUID id) {
        return recordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Financial record not found with id: " + id));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
