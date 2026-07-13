package com.nexora.ai.controller;

import com.nexora.ai.dto.AiQueryRequestDto;
import com.nexora.ai.dto.AiQueryResponseDto;
import com.nexora.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @PostMapping("/query")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<AiQueryResponseDto> query(@RequestBody AiQueryRequestDto request) {
        AiQueryResponseDto response = aiService.processQuery(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/history/{userId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<List<AiQueryResponseDto>> getHistory(@PathVariable String userId) {
        List<AiQueryResponseDto> history = aiService.getQueryHistory(userId);
        return ResponseEntity.ok(history);
    }
}
