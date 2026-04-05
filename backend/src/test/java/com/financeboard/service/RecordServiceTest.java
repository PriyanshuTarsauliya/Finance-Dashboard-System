package com.financeboard.service;

import com.financeboard.dto.CreateRecordRequest;
import com.financeboard.dto.PageResponse;
import com.financeboard.dto.RecordResponse;
import com.financeboard.entity.FinancialRecord;
import com.financeboard.entity.User;
import com.financeboard.enums.Role;
import com.financeboard.enums.Status;
import com.financeboard.enums.TransactionType;
import com.financeboard.exception.ResourceNotFoundException;
import com.financeboard.mapper.RecordMapper;
import com.financeboard.repository.FinancialRecordRepository;
import com.financeboard.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecordService Unit Tests")
class RecordServiceTest {

    @Mock private FinancialRecordRepository recordRepository;
    @Mock private UserRepository userRepository;
    @Mock private RecordMapper recordMapper;

    @InjectMocks private RecordService recordService;

    private User testUser;
    private FinancialRecord testRecord;
    private RecordResponse testResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .name("Admin User")
                .email("admin@finance.com")
                .role(Role.ADMIN)
                .status(Status.ACTIVE)
                .build();

        testRecord = FinancialRecord.builder()
                .id(UUID.randomUUID())
                .amount(new BigDecimal("5000.00"))
                .type(TransactionType.INCOME)
                .category("Sales")
                .date(LocalDate.of(2026, 4, 1))
                .notes("Q2 sales revenue")
                .createdBy(testUser)
                .build();

        testResponse = RecordResponse.builder()
                .id(testRecord.getId())
                .amount(testRecord.getAmount())
                .type(testRecord.getType())
                .category(testRecord.getCategory())
                .date(testRecord.getDate())
                .notes(testRecord.getNotes())
                .createdById(testUser.getId())
                .createdByName(testUser.getName())
                .build();
    }

    @Nested
    @DisplayName("List Records")
    class ListRecords {

        @Test
        @DisplayName("Should return paginated records")
        void shouldReturnPaginatedRecords() {
            Page<FinancialRecord> page = new PageImpl<>(List.of(testRecord));
            when(recordRepository.findAllFiltered(any(), any(), any(), any(), any(), any(Pageable.class)))
                    .thenReturn(page);
            when(recordMapper.toResponse(testRecord)).thenReturn(testResponse);

            PageResponse<RecordResponse> result = recordService.getAllRecords(
                    null, null, null, null, null, 0, 10, "date", "desc");

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getCategory()).isEqualTo("Sales");
            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should filter by type")
        void shouldFilterByType() {
            Page<FinancialRecord> page = new PageImpl<>(List.of(testRecord));
            when(recordRepository.findAllFiltered(eq(TransactionType.INCOME), any(), any(), any(), any(), any(Pageable.class)))
                    .thenReturn(page);
            when(recordMapper.toResponse(any())).thenReturn(testResponse);

            PageResponse<RecordResponse> result = recordService.getAllRecords(
                    TransactionType.INCOME, null, null, null, null, 0, 10, "date", "desc");

            assertThat(result.getContent()).hasSize(1);
            verify(recordRepository).findAllFiltered(eq(TransactionType.INCOME), any(), any(), any(), any(), any(Pageable.class));
        }

        @Test
        @DisplayName("Should search by text query")
        void shouldSearchByTextQuery() {
            Page<FinancialRecord> page = new PageImpl<>(List.of(testRecord));
            when(recordRepository.findAllFiltered(any(), any(), any(), any(), eq("sales"), any(Pageable.class)))
                    .thenReturn(page);
            when(recordMapper.toResponse(any())).thenReturn(testResponse);

            PageResponse<RecordResponse> result = recordService.getAllRecords(
                    null, null, null, null, "sales", 0, 10, "date", "desc");

            assertThat(result.getContent()).hasSize(1);
            verify(recordRepository).findAllFiltered(any(), any(), any(), any(), eq("sales"), any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("Create Record")
    class CreateRecord {

        @Test
        @DisplayName("Should create a record with current user as owner")
        void shouldCreateRecordWithCurrentUser() {
            // Mock SecurityContext
            Authentication auth = mock(Authentication.class);
            SecurityContext securityContext = mock(SecurityContext.class);
            when(securityContext.getAuthentication()).thenReturn(auth);
            when(auth.getName()).thenReturn("admin@finance.com");
            SecurityContextHolder.setContext(securityContext);

            when(userRepository.findByEmail("admin@finance.com")).thenReturn(Optional.of(testUser));
            when(recordRepository.save(any(FinancialRecord.class))).thenReturn(testRecord);
            when(recordMapper.toResponse(testRecord)).thenReturn(testResponse);

            CreateRecordRequest request = new CreateRecordRequest();
            request.setAmount(new BigDecimal("5000.00"));
            request.setType(TransactionType.INCOME);
            request.setCategory("Sales");
            request.setDate(LocalDate.of(2026, 4, 1));
            request.setNotes("Q2 sales revenue");

            RecordResponse result = recordService.createRecord(request);

            assertThat(result.getAmount()).isEqualByComparingTo("5000.00");
            assertThat(result.getCategory()).isEqualTo("Sales");
            verify(recordRepository).save(argThat(record ->
                    record.getCreatedBy().equals(testUser) &&
                    record.getAmount().compareTo(new BigDecimal("5000.00")) == 0
            ));
        }
    }

    @Nested
    @DisplayName("Soft Delete")
    class SoftDelete {

        @Test
        @DisplayName("Should soft-delete record (set deletedAt, not remove)")
        void shouldSoftDeleteRecord() {
            when(recordRepository.findById(testRecord.getId())).thenReturn(Optional.of(testRecord));
            when(recordRepository.save(any(FinancialRecord.class))).thenReturn(testRecord);

            recordService.softDeleteRecord(testRecord.getId());

            verify(recordRepository).save(argThat(record ->
                    record.getDeletedAt() != null
            ));
            verify(recordRepository, never()).delete(any());
        }

        @Test
        @DisplayName("Should throw when record not found")
        void shouldThrowWhenRecordNotFound() {
            UUID randomId = UUID.randomUUID();
            when(recordRepository.findById(randomId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> recordService.softDeleteRecord(randomId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining(randomId.toString());
        }
    }
}
