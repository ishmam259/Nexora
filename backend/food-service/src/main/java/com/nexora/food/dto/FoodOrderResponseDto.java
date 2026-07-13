package com.nexora.food.dto;

import com.nexora.food.entity.FoodOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOrderResponseDto {
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private String customerId;
    private BigDecimal amount;
    private FoodOrderStatus status;
    private String paymentReference;
    private String deliveryAddress;
    private String customerNote;
    private List<FoodOrderItemResponseDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
