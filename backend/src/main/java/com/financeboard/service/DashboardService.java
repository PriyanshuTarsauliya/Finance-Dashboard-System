package com.financeboard.service;

import com.financeboard.dto.*;
import com.financeboard.enums.TransactionType;
import com.financeboard.mapper.RecordMapper;
import com.financeboard.repository.FinancialRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final FinancialRecordRepository recordRepository;
    private final RecordMapper recordMapper;

    public DashboardSummary getSummary() {
        BigDecimal totalIncome = recordRepository.sumByType(TransactionType.INCOME);
        BigDecimal totalExpenses = recordRepository.sumByType(TransactionType.EXPENSE);
        BigDecimal netBalance = totalIncome.subtract(totalExpenses);
        long totalRecords = recordRepository.countAllRecords();

        return DashboardSummary.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netBalance(netBalance)
                .totalRecords(totalRecords)
                .build();
    }

    public List<CategoryTotal> getCategoryTotals() {
        return recordRepository.getCategoryTotals().stream()
                .map(row -> CategoryTotal.builder()
                        .category((String) row[0])
                        .type(((TransactionType) row[1]).name())
                        .total((BigDecimal) row[2])
                        .build())
                .toList();
    }

    public List<TrendData> getMonthlyTrends(Integer targetYear) {
        int year = targetYear != null ? targetYear : LocalDate.now().getYear();
        List<Object[]> rows = recordRepository.getMonthlyTrends(year);
        Map<Integer, TrendData> map = new LinkedHashMap<>();

        // Pre-fill all 12 months with zeros
        for (int m = 1; m <= 12; m++) {
            map.put(m, TrendData.builder()
                    .period(m)
                    .income(BigDecimal.ZERO)
                    .expense(BigDecimal.ZERO)
                    .build());
        }

        // Overlay actual data
        for (Object[] row : rows) {
            int month = ((Number) row[0]).intValue();
            TransactionType type = (TransactionType) row[1];
            BigDecimal sum = (BigDecimal) row[2];

            TrendData td = map.get(month);
            if (type == TransactionType.INCOME) {
                td.setIncome(sum);
            } else {
                td.setExpense(sum);
            }
        }

        return new ArrayList<>(map.values());
    }

    public List<TrendData> getWeeklyTrends(Integer targetYear, Integer targetMonth) {
        LocalDate now = LocalDate.now();
        int year = targetYear != null ? targetYear : now.getYear();
        int month = targetMonth != null ? targetMonth : now.getMonthValue();
        List<Object[]> rows = recordRepository.getWeeklyTrends(year, month);

        // Calculate number of weeks in the current month (ceil of days / 7)
        int daysInMonth = YearMonth.of(year, month).lengthOfMonth();
        int totalWeeks = (daysInMonth + 6) / 7; // ceiling division

        Map<Integer, TrendData> map = new LinkedHashMap<>();

        // Pre-fill all weeks with zeros
        for (int w = 1; w <= totalWeeks; w++) {
            map.put(w, TrendData.builder()
                    .period(w)
                    .income(BigDecimal.ZERO)
                    .expense(BigDecimal.ZERO)
                    .build());
        }

        // Overlay actual data
        for (Object[] row : rows) {
            int week = ((Number) row[0]).intValue();
            TransactionType type = (TransactionType) row[1];
            BigDecimal sum = (BigDecimal) row[2];

            TrendData td = map.get(week);
            if (td != null) {
                if (type == TransactionType.INCOME) {
                    td.setIncome(sum);
                } else {
                    td.setExpense(sum);
                }
            }
        }

        return new ArrayList<>(map.values());
    }

    public List<TrendData> getDailyTrends(Integer targetYear, Integer targetMonth) {
        LocalDate now = LocalDate.now();
        int year = targetYear != null ? targetYear : now.getYear();
        int month = targetMonth != null ? targetMonth : now.getMonthValue();
        List<Object[]> rows = recordRepository.getDailyTrends(year, month);

        int daysInMonth = YearMonth.of(year, month).lengthOfMonth();
        Map<Integer, TrendData> map = new LinkedHashMap<>();

        // Pre-fill all days with zeros
        for (int d = 1; d <= daysInMonth; d++) {
            map.put(d, TrendData.builder()
                    .period(d)
                    .income(BigDecimal.ZERO)
                    .expense(BigDecimal.ZERO)
                    .build());
        }

        // Overlay actual data
        for (Object[] row : rows) {
            int day = ((Number) row[0]).intValue();
            TransactionType type = (TransactionType) row[1];
            BigDecimal sum = (BigDecimal) row[2];

            TrendData td = map.get(day);
            if (td != null) {
                if (type == TransactionType.INCOME) {
                    td.setIncome(sum);
                } else {
                    td.setExpense(sum);
                }
            }
        }

        return new ArrayList<>(map.values());
    }

    public List<RecordResponse> getRecentRecords() {
        return recordRepository.findRecentRecords(PageRequest.of(0, 10))
                .stream()
                .map(recordMapper::toResponse)
                .toList();
    }
}

