package com.nexora.marketplace.dto;

import com.nexora.marketplace.entity.ProductCondition;
import com.nexora.marketplace.entity.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private ProductCondition condition;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
    private String sellerId;
    private ProductStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Aggregate review data
    private Double averageRating;
    private Long reviewCount;
}
