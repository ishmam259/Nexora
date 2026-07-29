package com.nexora.marketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    /** Minimum opening bid for the auction. */
    @Column(name = "starting_bid", nullable = false, precision = 10, scale = 2)
    private BigDecimal startingBid;

    /**
     * Legacy buy-now column kept temporarily: existing DBs still have
     * {@code price NOT NULL}. Hibernate {@code ddl-auto=update} never drops it,
     * so we mirror {@link #startingBid} into this column on write.
     */
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    /** Legacy buy-now stock column; auctions are always quantity 1. */
    @Column(name = "stock")
    private Integer stock;

    /** Highest accepted bid amount so far (null if none). */
    @Column(name = "current_bid", precision = 10, scale = 2)
    private BigDecimal currentBid;

    @Column(name = "current_bidder_id")
    private String currentBidderId;

    @Column(name = "bid_count", nullable = false)
    @Builder.Default
    private Integer bidCount = 0;

    @Column(name = "ends_at", nullable = false)
    private LocalDateTime endsAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCondition condition;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "seller_id", nullable = false)
    private String sellerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ProductStatus.ACTIVE;
        if (bidCount == null) bidCount = 0;
        syncLegacyColumns();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        syncLegacyColumns();
    }

    /** Keep obsolete price/stock columns populated for DBs that still enforce them. */
    private void syncLegacyColumns() {
        if (startingBid != null) {
            price = startingBid;
        }
        if (stock == null) {
            stock = 1;
        }
    }

    public boolean isBiddingOpen() {
        return status == ProductStatus.ACTIVE && endsAt != null && LocalDateTime.now().isBefore(endsAt);
    }
}
