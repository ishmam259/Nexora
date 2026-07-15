package com.nexora.payment.entity;

/**
 * Supported internal payment methods in the Nexora payment gateway.
 * No third-party processors — all methods are handled internally.
 */
public enum PaymentMethodType {
    /** User's pre-funded Nexora digital wallet */
    NEXORA_WALLET,
    /** Direct bank transfer (manual confirmation flow) */
    BANK_TRANSFER,
    /** bKash mobile banking */
    BKASH,
    /** Nagad mobile banking */
    NAGAD,
    /** Rocket (Dutch-Bangla) mobile banking */
    ROCKET,
    /** Cash on delivery / in-person payment */
    CASH
}
