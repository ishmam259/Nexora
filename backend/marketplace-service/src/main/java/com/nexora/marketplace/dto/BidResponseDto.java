package com.nexora.marketplace.dto;

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
public class BidResponseDto {
    private Long id;
    private Long productId;
    private String bidderId;
    private BigDecimal amount;
    private LocalDateTime createdAt;
}
