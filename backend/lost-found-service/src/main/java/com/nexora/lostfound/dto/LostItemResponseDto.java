package com.nexora.lostfound.dto;

import com.nexora.lostfound.entity.LostItemStatus;
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
public class LostItemResponseDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String lostLocation;
    private LocalDateTime lostDate;
    private BigDecimal reward;
    private LostItemStatus status;
    private String reportedBy;
    private String contactDetails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
