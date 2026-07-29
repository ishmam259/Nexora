package com.nexora.marketplace.entity;

public enum OrderStatus {
    /** Winning bid accepted; waiting for buyer wallet payment. */
    AWAITING_PAYMENT,
    /** Buyer paid via wallet. */
    PAID,
    /** Seller marked handover complete. */
    COMPLETED,
    CANCELLED
}
