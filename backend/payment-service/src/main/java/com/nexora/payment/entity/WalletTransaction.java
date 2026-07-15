package com.nexora.payment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Immutable ledger entry for every credit or debit on a Wallet.
 * Provides a full audit trail of wallet activity.
 */
@Entity
@Table(name = "wallet_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The wallet this transaction belongs to */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    /** CREDIT, DEBIT, or REFUND */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WalletTransactionType type;

    /** Positive amount transacted (always stored as absolute value) */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    /** Wallet balance after this transaction (snapshot) */
    @Column(name = "balance_after", nullable = false, precision = 15, scale = 2)
    private BigDecimal balanceAfter;

    /** Optional: the payment ID this transaction is linked to */
    @Column(name = "payment_id")
    private Long paymentId;

    /** Human-readable description (e.g. "Top-up via bKash", "Payment for order #123") */
    @Column(length = 500)
    private String description;

    /** Unique reference for idempotency (e.g. mobile banking txn ref) */
    @Column(name = "reference_id", unique = true)
    private String referenceId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
