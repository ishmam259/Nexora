package com.nexora.marketplace.dto;

import com.nexora.marketplace.entity.ProductCondition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestDto {
    private String title;
    private String description;
    private BigDecimal startingBid;
    /** Auction length in hours (default 72). */
    private Integer durationHours;
    private ProductCondition condition;
    private String imageUrl;
    private Long categoryId;
}
