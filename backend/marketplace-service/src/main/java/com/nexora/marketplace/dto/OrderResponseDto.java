package com.nexora.marketplace.dto;

import com.nexora.marketplace.entity.OrderStatus;
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
public class OrderResponseDto {
    private Long id;
    private Long productId;
    private String productTitle;
    private String buyerId;
    private String sellerId;
    private Long winningBidId;
    private BigDecimal amount;
    private OrderStatus status;
    private String paymentReference;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
