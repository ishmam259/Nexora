package com.nexora.print.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "print_orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrintOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Keycloak user ID of the customer placing the printing order
    @Column(name = "customer_id", nullable = false)
    private String customerId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "page_count", nullable = false)
    private Integer pageCount;

    @Column(nullable = false)
    private boolean color;

    @Column(name = "double_sided", nullable = false)
    private boolean doubleSided;

    @Column(nullable = false)
    private Integer copies;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrintOrderStatus status;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "customer_note", length = 1000)
    private String customerNote;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = PrintOrderStatus.PENDING;
        if (copies == null) copies = 1;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
