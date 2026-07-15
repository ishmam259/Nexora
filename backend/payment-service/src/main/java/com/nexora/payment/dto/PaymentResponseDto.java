package com.nexora.payment.dto;

import com.nexora.payment.entity.PaymentMethodType;
import com.nexora.payment.entity.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDto {
    private Long id;
    private String orderId;
    private String payerId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String transactionId;
    private PaymentMethodType paymentMethod;
    private String externalReference;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
