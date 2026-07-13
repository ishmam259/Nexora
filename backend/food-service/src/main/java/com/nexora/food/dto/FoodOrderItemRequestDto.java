package com.nexora.food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOrderItemRequestDto {
    private Long menuItemId;
    private Integer quantity;
}
