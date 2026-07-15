package com.nexora.payment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a user's Nexora digital wallet.
 * Each user (identified by Keycloak userId) holds exactly one wallet.
 * The wallet acts as a pre-funded balance that can be used to pay
 * for any service on the platform without an external payment provider.
 */
@Entity
@Table(name = "wallets", uniqueConstraints = {
        @UniqueConstraint(name = "uq_wallet_user", columnNames = "user_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Keycloak subject (user ID) — one wallet per user */
    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    /** Current available balance; never goes negative */
    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    /** ISO-4217 currency code (default BDT for Bangladesh) */
    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "BDT";

    /** Whether this wallet is active and usable */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
