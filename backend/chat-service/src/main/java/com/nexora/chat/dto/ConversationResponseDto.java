package com.nexora.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponseDto {
    private Long id;
    private String participantOne;
    private String participantTwo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private MessageResponseDto lastMessage;
}
