package com.financeboard.service;

import com.financeboard.dto.DashboardSummary;
import com.financeboard.dto.CategoryTotal;
import com.financeboard.dto.TrendData;
import com.financeboard.dto.RecordResponse;
import com.financeboard.entity.FinancialRecord;
import com.financeboard.entity.User;
import com.financeboard.enums.TransactionType;
import com.financeboard.mapper.RecordMapper;
import com.financeboard.repository.FinancialRecordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService Unit Tests")
class DashboardServiceTest {

    @Mock private FinancialRecordRepository recordRepository;
    @Mock private RecordMapper recordMapper;

    @InjectMocks private DashboardService dashboardService;

    @Test
    @DisplayName("Should compute summary with correct net balance")
    void shouldComputeSummaryCorrectly() {
        when(recordRepository.sumByType(TransactionType.INCOME)).thenReturn(new BigDecimal("50000.00"));
        when(recordRepository.sumByType(TransactionType.EXPENSE)).thenReturn(new BigDecimal("30000.00"));
        when(recordRepository.countAllRecords()).thenReturn(25L);

        DashboardSummary summary = dashboardService.getSummary();

        assertThat(summary.getTotalIncome()).isEqualByComparingTo("50000.00");
        assertThat(summary.getTotalExpenses()).isEqualByComparingTo("30000.00");
        assertThat(summary.getNetBalance()).isEqualByComparingTo("20000.00");
        assertThat(summary.getTotalRecords()).isEqualTo(25L);
    }

    @Test
    @DisplayName("Should handle zero records gracefully")
    void shouldHandleZeroRecords() {
        when(recordRepository.sumByType(TransactionType.INCOME)).thenReturn(BigDecimal.ZERO);
        when(recordRepository.sumByType(TransactionType.EXPENSE)).thenReturn(BigDecimal.ZERO);
        when(recordRepository.countAllRecords()).thenReturn(0L);

        DashboardSummary summary = dashboardService.getSummary();

        assertThat(summary.getNetBalance()).isEqualByComparingTo("0");
        assertThat(summary.getTotalRecords()).isEqualTo(0L);
    }

    @Test
    @DisplayName("Should return category totals sorted by amount")
    void shouldReturnCategoryTotals() {
        List<Object[]> mockRows = List.of(
                new Object[]{"Office", TransactionType.EXPENSE, new BigDecimal("15000.00")},
                new Object[]{"Sales", TransactionType.INCOME, new BigDecimal("10000.00")}
        );
        when(recordRepository.getCategoryTotals()).thenReturn(mockRows);

        List<CategoryTotal> result = dashboardService.getCategoryTotals();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getCategory()).isEqualTo("Office");
        assertThat(result.get(0).getTotal()).isEqualByComparingTo("15000.00");
        assertThat(result.get(1).getCategory()).isEqualTo("Sales");
    }

    @Test
    @DisplayName("Should return all 12 months with zeros for missing months")
    void shouldReturnAll12Months() {
        int year = LocalDate.now().getYear();
        // Only provide data for months 1 and 3
        List<Object[]> mockRows = List.of(
                new Object[]{1, TransactionType.INCOME, new BigDecimal("8000.00")},
                new Object[]{1, TransactionType.EXPENSE, new BigDecimal("5000.00")},
                new Object[]{3, TransactionType.INCOME, new BigDecimal("12000.00")}
        );
        when(recordRepository.getMonthlyTrends(year)).thenReturn(mockRows);

        List<TrendData> trends = dashboardService.getMonthlyTrends(null);

        // Must return exactly 12 months
        assertThat(trends).hasSize(12);

        // Month 1: has data
        assertThat(trends.get(0).getPeriod()).isEqualTo(1);
        assertThat(trends.get(0).getIncome()).isEqualByComparingTo("8000.00");
        assertThat(trends.get(0).getExpense()).isEqualByComparingTo("5000.00");

        // Month 2: no data → zeros
        assertThat(trends.get(1).getPeriod()).isEqualTo(2);
        assertThat(trends.get(1).getIncome()).isEqualByComparingTo("0");
        assertThat(trends.get(1).getExpense()).isEqualByComparingTo("0");

        // Month 3: only income
        assertThat(trends.get(2).getPeriod()).isEqualTo(3);
        assertThat(trends.get(2).getIncome()).isEqualByComparingTo("12000.00");
        assertThat(trends.get(2).getExpense()).isEqualByComparingTo("0");

        // Month 12: no data → zeros
        assertThat(trends.get(11).getPeriod()).isEqualTo(12);
        assertThat(trends.get(11).getIncome()).isEqualByComparingTo("0");
        assertThat(trends.get(11).getExpense()).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("Should return all weeks of current month with zeros for missing weeks")
    void shouldReturnAllWeeksWithZeros() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        int daysInMonth = YearMonth.of(year, month).lengthOfMonth();
        int expectedWeeks = (daysInMonth + 6) / 7;

        // Only provide data for week 1
        List<Object[]> mockRows = List.of(
                new Object[]{1, TransactionType.INCOME, new BigDecimal("2000.00")},
                new Object[]{1, TransactionType.EXPENSE, new BigDecimal("1000.00")}
        );
        when(recordRepository.getWeeklyTrends(year, month)).thenReturn(mockRows);

        List<TrendData> trends = dashboardService.getWeeklyTrends(null, null);

        assertThat(trends).hasSize(expectedWeeks);
        // Week 1: has data
        assertThat(trends.get(0).getPeriod()).isEqualTo(1);
        assertThat(trends.get(0).getIncome()).isEqualByComparingTo("2000.00");
        assertThat(trends.get(0).getExpense()).isEqualByComparingTo("1000.00");
        // Week 2: no data → zeros
        if (expectedWeeks >= 2) {
            assertThat(trends.get(1).getPeriod()).isEqualTo(2);
            assertThat(trends.get(1).getIncome()).isEqualByComparingTo("0");
            assertThat(trends.get(1).getExpense()).isEqualByComparingTo("0");
        }
    }

    @Test
    @DisplayName("Should return recent records capped at 10")
    void shouldReturnRecentRecords() {
        User user = User.builder().id(UUID.randomUUID()).name("Test").build();
        FinancialRecord record = FinancialRecord.builder()
                .id(UUID.randomUUID()).amount(new BigDecimal("100.00"))
                .type(TransactionType.INCOME).category("Test")
                .date(LocalDate.now()).createdBy(user).build();
        RecordResponse response = RecordResponse.builder()
                .id(record.getId()).amount(record.getAmount()).build();

        when(recordRepository.findRecentRecords(any(Pageable.class))).thenReturn(List.of(record));
        when(recordMapper.toResponse(record)).thenReturn(response);

        List<RecordResponse> result = dashboardService.getRecentRecords();

        assertThat(result).hasSize(1);
        verify(recordRepository).findRecentRecords(any(Pageable.class));
    }
}

