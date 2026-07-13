package com.nexora.lostfound.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoundItemRequestDto {
    private String title;
    private String description;
    private String category;
    private String foundLocation;
    private LocalDateTime foundDate;
    private String storageLocation;
    private String contactDetails;
}
