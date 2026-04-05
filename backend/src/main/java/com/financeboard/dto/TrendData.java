package com.financeboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendData {
    private int period; // month number (1-12) or week number (1-5)
    private BigDecimal income;
    private BigDecimal expense;
}
