package com.nexora.chat.controller;

import com.nexora.chat.dto.MessageRequestDto;
import com.nexora.chat.dto.MessageResponseDto;
import com.nexora.chat.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations/{conversationId}/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<MessageResponseDto> sendMessage(
            @PathVariable Long conversationId,
            @RequestBody MessageRequestDto request) {
        MessageResponseDto response = messageService.sendMessage(conversationId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<List<MessageResponseDto>> getMessages(@PathVariable Long conversationId) {
        List<MessageResponseDto> response = messageService.getMessagesByConversation(conversationId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/read")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long conversationId,
            @RequestParam String userId) {
        int updatedCount = messageService.markMessagesAsRead(conversationId, userId);
        return ResponseEntity.ok(Map.of(
                "conversationId", conversationId,
                "userId", userId,
                "messagesMarkedAsRead", updatedCount
        ));
    }
}
