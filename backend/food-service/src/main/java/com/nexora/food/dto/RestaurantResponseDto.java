package com.nexora.food.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponseDto {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String contactNumber;
    private String imageUrl;
    private String ownerId;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
