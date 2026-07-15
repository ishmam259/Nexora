package com.nexora.payment.dto;

import com.nexora.payment.entity.WalletTransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransactionResponseDto {
    private Long id;
    private Long walletId;
    private WalletTransactionType type;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private Long paymentId;
    private String description;
    private String referenceId;
    private LocalDateTime createdAt;
}
