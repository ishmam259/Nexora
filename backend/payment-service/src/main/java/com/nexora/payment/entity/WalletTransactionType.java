package com.nexora.payment.entity;

/**
 * Classifies each ledger entry on a wallet.
 */
public enum WalletTransactionType {
    /** Money added to the wallet (top-up / deposit) */
    CREDIT,
    /** Money deducted from the wallet (payment / withdrawal) */
    DEBIT,
    /** Refund credited back to the wallet */
    REFUND
}
