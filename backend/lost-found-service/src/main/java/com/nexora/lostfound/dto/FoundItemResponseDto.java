package com.nexora.lostfound.dto;

import com.nexora.lostfound.entity.FoundItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoundItemResponseDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String foundLocation;
    private LocalDateTime foundDate;
    private FoundItemStatus status;
    private String reportedBy;
    private String storageLocation;
    private String contactDetails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
