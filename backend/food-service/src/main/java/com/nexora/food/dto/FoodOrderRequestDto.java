package com.nexora.food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOrderRequestDto {
    private Long restaurantId;
    private List<FoodOrderItemRequestDto> items;
    private String paymentReference;
    private String deliveryAddress;
    private String customerNote;
}
