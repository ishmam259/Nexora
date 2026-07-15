package com.nexora.chat.controller;

import com.nexora.chat.dto.ConversationRequestDto;
import com.nexora.chat.dto.ConversationResponseDto;
import com.nexora.chat.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
// // @CrossOrigin(origins = "*")
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<ConversationResponseDto> createConversation(@RequestBody ConversationRequestDto request) {
        ConversationResponseDto response = conversationService.createConversation(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<ConversationResponseDto> getConversation(@PathVariable Long id) {
        ConversationResponseDto response = conversationService.getConversationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<List<ConversationResponseDto>> getConversationsByUser(@PathVariable String userId) {
        List<ConversationResponseDto> response = conversationService.getConversationsByUser(userId);
        return ResponseEntity.ok(response);
    }
}
