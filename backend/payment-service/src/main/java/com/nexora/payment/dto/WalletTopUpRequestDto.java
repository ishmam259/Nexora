package com.nexora.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request body for topping up a Nexora Wallet.
 * The top-up is always an external funding action — the user brings money
 * in from a mobile banking service (bKash, Nagad, Rocket) or bank transfer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletTopUpRequestDto {

    @NotNull(message = "amount is required")
    @DecimalMin(value = "1.00", message = "Minimum top-up amount is 1.00")
    private BigDecimal amount;

    /** ISO-4217 currency (default BDT) */
    @Builder.Default
    private String currency = "BDT";

    /**
     * Source of the top-up funds: BKASH, NAGAD, ROCKET, BANK_TRANSFER.
     * Must not be NEXORA_WALLET (cannot fund wallet from wallet).
     */
    @NotBlank(message = "fundingSource is required")
    private String fundingSource;

    /**
     * The external transaction reference from the funding source
     * (e.g. bKash TrxID). Used for idempotency and manual verification.
     */
    @NotBlank(message = "externalReference is required")
    private String externalReference;
}
