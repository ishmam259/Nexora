package com.nexora.lostfound.dto;

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
public class LostItemRequestDto {
    private String title;
    private String description;
    private String category;
    private String lostLocation;
    private LocalDateTime lostDate;
    private BigDecimal reward;
    private String contactDetails;
}
