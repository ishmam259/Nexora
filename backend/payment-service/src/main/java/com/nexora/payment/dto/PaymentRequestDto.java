package com.nexora.payment.dto;

import com.nexora.payment.entity.PaymentMethodType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request body for initiating a payment.
 * The caller (a downstream service or the frontend via gateway) provides
 * the order reference, amount, chosen payment method, and optional details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDto {

    /** Composite order reference: "{service}:{orderId}", e.g. "marketplace:42" */
    @NotBlank(message = "orderId is required")
    private String orderId;

    @NotNull(message = "amount is required")
    @DecimalMin(value = "0.01", message = "amount must be greater than zero")
    private BigDecimal amount;

    /** ISO-4217 currency code; defaults to BDT */
    @Builder.Default
    private String currency = "BDT";

    @NotNull(message = "paymentMethod is required")
    private PaymentMethodType paymentMethod;

    /**
     * For non-wallet methods: the external transaction reference
     * (bKash TrxID, bank transfer ref, etc.) provided by the user.
     * Required when paymentMethod is BKASH, NAGAD, ROCKET, or BANK_TRANSFER.
     */
    private String externalReference;

    /** Optional note from the buyer */
    private String note;
}
