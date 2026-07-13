package com.nexora.food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantRequestDto {
    private String name;
    private String description;
    private String address;
    private String contactNumber;
    private String imageUrl;
    private Boolean active;
}
