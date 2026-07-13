package com.nexora.ai.service;

import com.nexora.ai.dto.AiQueryRequestDto;
import com.nexora.ai.dto.AiQueryResponseDto;
import com.nexora.ai.entity.AiQueryLog;
import com.nexora.ai.repository.AiQueryLogRepository;
import com.nexora.common.exception.NexoraException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiService {

    private final AiQueryLogRepository aiQueryLogRepository;

    // Mock AI recommendation responses keyed by query type
    private static final Map<String, String> MOCK_RESPONSES = Map.of(
            "RECOMMENDATION", "Based on your purchase history, we recommend: Wireless Earbuds, Laptop Stand, and USB-C Hub. These items are trending among students in your department.",
            "CHAT", "Hello! I'm Nexora AI Assistant. I can help you find products, track orders, discover food options, and more. How can I assist you today?",
            "PREFERENCES", "Your preferences have been analyzed. You tend to prefer electronics and study accessories. We've updated your recommendation profile accordingly.",
            "FOOD", "Based on your ordering patterns, you might enjoy: Chicken Biryani from Campus Kitchen, Pasta Alfredo from Italian Corner, and Mango Smoothie from Juice Bar.",
            "SEARCH", "Here are the top results matching your query: 1) Scientific Calculator (BDT 1,200), 2) Engineering Drawing Kit (BDT 850), 3) Programming Textbook (BDT 600)."
    );

    private static final String DEFAULT_RESPONSE = "Thank you for your query. Our AI engine has processed your request. Please refine your query for more specific recommendations.";

    @Transactional
    public AiQueryResponseDto processQuery(AiQueryRequestDto request) {
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new NexoraException("User ID cannot be empty");
        }
        if (request.getQuery() == null || request.getQuery().isBlank()) {
            throw new NexoraException("Query cannot be empty");
        }
        if (request.getQueryType() == null || request.getQueryType().isBlank()) {
            throw new NexoraException("Query type must be specified");
        }

        // Generate mock AI response based on query type
        String aiResponse = MOCK_RESPONSES.getOrDefault(
                request.getQueryType().toUpperCase(),
                DEFAULT_RESPONSE
        );

        AiQueryLog queryLog = AiQueryLog.builder()
                .userId(request.getUserId())
                .query(request.getQuery())
                .response(aiResponse)
                .queryType(request.getQueryType().toUpperCase())
                .timestamp(LocalDateTime.now())
                .build();

        AiQueryLog savedLog = aiQueryLogRepository.save(queryLog);
        return mapToResponseDto(savedLog);
    }

    @Transactional(readOnly = true)
    public List<AiQueryResponseDto> getQueryHistory(String userId) {
        List<AiQueryLog> logs = aiQueryLogRepository.findByUserIdOrderByTimestampDesc(userId);
        return logs.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private AiQueryResponseDto mapToResponseDto(AiQueryLog log) {
        return AiQueryResponseDto.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .query(log.getQuery())
                .response(log.getResponse())
                .queryType(log.getQueryType())
                .timestamp(log.getTimestamp())
                .build();
    }
}
