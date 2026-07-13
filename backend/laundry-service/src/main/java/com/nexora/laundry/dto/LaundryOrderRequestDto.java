package com.nexora.laundry.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaundryOrderRequestDto {
    private Long slotId;
    private BigDecimal amount;
    private String paymentReference;
    private Double weightKg;
    private String laundryType;
    private String specialInstructions;
}
