package com.financeboard.repository;

import com.financeboard.entity.FinancialRecord;
import com.financeboard.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, UUID> {

    // ── Filtered + searchable paginated query ──
    @Query("SELECT r FROM FinancialRecord r WHERE " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:startDate IS NULL OR r.date >= :startDate) AND " +
           "(:endDate IS NULL OR r.date <= :endDate) AND " +
           "(:search IS NULL OR LOWER(r.category) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.notes) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<FinancialRecord> findAllFiltered(
            @Param("type") TransactionType type,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable);

    // ── Dashboard: total by type ──
    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM FinancialRecord r WHERE r.type = :type")
    BigDecimal sumByType(@Param("type") TransactionType type);

    // ── Dashboard: record count ──
    @Query("SELECT COUNT(r) FROM FinancialRecord r")
    long countAllRecords();

    // ── Dashboard: category totals ──
    @Query("SELECT r.category, r.type, SUM(r.amount) FROM FinancialRecord r GROUP BY r.category, r.type ORDER BY SUM(r.amount) DESC")
    List<Object[]> getCategoryTotals();

    // ── Dashboard: monthly trends for a given year ──
    @Query("SELECT MONTH(r.date), r.type, SUM(r.amount) FROM FinancialRecord r " +
           "WHERE YEAR(r.date) = :year GROUP BY MONTH(r.date), r.type ORDER BY MONTH(r.date)")
    List<Object[]> getMonthlyTrends(@Param("year") int year);

    // ── Dashboard: weekly trends for a given month/year ──
    @Query("SELECT DAY(r.date) / 7 + 1, r.type, SUM(r.amount) FROM FinancialRecord r " +
           "WHERE YEAR(r.date) = :year AND MONTH(r.date) = :month " +
           "GROUP BY DAY(r.date) / 7 + 1, r.type ORDER BY DAY(r.date) / 7 + 1")
    List<Object[]> getWeeklyTrends(@Param("year") int year, @Param("month") int month);

    // ── Dashboard: daily trends for a given month/year ──
    @Query("SELECT DAY(r.date), r.type, SUM(r.amount) FROM FinancialRecord r " +
           "WHERE YEAR(r.date) = :year AND MONTH(r.date) = :month " +
           "GROUP BY DAY(r.date), r.type ORDER BY DAY(r.date)")
    List<Object[]> getDailyTrends(@Param("year") int year, @Param("month") int month);

    // ── Dashboard: recent records ──
    @Query("SELECT r FROM FinancialRecord r ORDER BY r.date DESC, r.createdAt DESC")
    List<FinancialRecord> findRecentRecords(Pageable pageable);
}
