package com.nexora.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDto {
    private Long productId;
    private Integer quantity;
    private String buyerNote;
    // Optional reference to payment-service transaction
    private String paymentReference;
}
