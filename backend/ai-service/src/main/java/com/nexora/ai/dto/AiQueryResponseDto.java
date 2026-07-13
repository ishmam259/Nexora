package com.nexora.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiQueryResponseDto {
    private Long id;
    private String userId;
    private String query;
    private String response;
    private String queryType;
    private LocalDateTime timestamp;
}
