package com.nexora.laundry.dto;

import com.nexora.laundry.entity.LaundryOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaundryOrderResponseDto {
    private Long id;
    private String customerId;
    private Long slotId;
    private String slotLabel;
    private LaundryOrderStatus status;
    private BigDecimal amount;
    private String paymentReference;
    private Double weightKg;
    private String laundryType;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
