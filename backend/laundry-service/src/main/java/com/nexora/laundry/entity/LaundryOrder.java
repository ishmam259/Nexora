package com.nexora.laundry.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "laundry_orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaundryOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Keycloak user ID of the customer placing the laundry order
    @Column(name = "customer_id", nullable = false)
    private String customerId;

    @Column(name = "slot_id", nullable = false)
    private Long slotId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LaundryOrderStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "laundry_type", nullable = false)
    private String laundryType; // e.g. "Wash & Fold", "Dry Clean"

    @Column(name = "special_instructions", length = 1000)
    private String specialInstructions;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = LaundryOrderStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
