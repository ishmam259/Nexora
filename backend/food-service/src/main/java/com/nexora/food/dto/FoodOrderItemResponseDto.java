package com.nexora.food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOrderItemResponseDto {
    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private BigDecimal price;
    private Integer quantity;
}
