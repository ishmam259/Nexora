package com.nexora.ai.service;

import com.nexora.ai.client.GroqClient;
import com.nexora.ai.dto.AiQueryRequestDto;
import com.nexora.ai.dto.AiQueryResponseDto;
import com.nexora.ai.entity.AiQueryLog;
import com.nexora.ai.repository.AiQueryLogRepository;
import com.nexora.common.exception.NexoraException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiService {

    private final AiQueryLogRepository aiQueryLogRepository;
    private final GroqClient groqClient;

    private static final String SYSTEM_PROMPT_BASE = 
            "You are Nexora Assistant, a helpful and premium virtual campus assistant designed for university students, administrators, merchants, restaurant owners, and delivery agents.\n" +
            "Nexora offers the following services:\n" +
            "- Marketplace: for buying/selling products, categories, reviews.\n" +
            "- Food: ordering from restaurants, menu browsing.\n" +
            "- Laundry: slot booking and scheduling.\n" +
            "- Printing: document uploading and print orders.\n" +
            "- Medical: medicine search and doctor appointments.\n" +
            "- Lost & Found: reporting and searching for lost or found items.\n" +
            "- Chat: direct user-to-user messaging.\n" +
            "Provide concise, useful, friendly, and structured responses to help campus users navigate these services. Make sure your tone is polite and professional.";

    private static final Map<String, String> PROMPTS = Map.of(
            "RECOMMENDATION", SYSTEM_PROMPT_BASE + "\nFocus your response on recommending products, books, or study accessories based on the user's request. Suggest practical items commonly used by university students.",
            "PREFERENCES", SYSTEM_PROMPT_BASE + "\nFocus on analyzing the user's expressed preferences and habits, summarizing their taste, and advising them on how they can customize their campus experience.",
            "FOOD", SYSTEM_PROMPT_BASE + "\nFocus on dining recommendations, campus cafe schedules, meal options, or campus restaurant highlights based on the user's dining interest.",
            "SEARCH", SYSTEM_PROMPT_BASE + "\nFocus on helping the user locate specific listings, resources, or services on campus. Provide search tips and clear itemized lists.",
            "CHAT", SYSTEM_PROMPT_BASE + "\nYou are engaging in a continuous chat conversation. Help the user with any campus-life queries, instructions, or tasks they ask about."
    );

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

        String queryType = request.getQueryType().toUpperCase();
        String systemPrompt = PROMPTS.getOrDefault(queryType, SYSTEM_PROMPT_BASE);

        String aiResponse;
        if ("CHAT".equals(queryType)) {
            // Load conversation history (last 5 exchanges = 10 messages)
            List<AiQueryLog> recentLogs = aiQueryLogRepository.findByUserIdOrderByTimestampDesc(request.getUserId());
            List<GroqClient.Message> history = new ArrayList<>();
            int limit = Math.min(recentLogs.size(), 5);
            List<AiQueryLog> sublist = new ArrayList<>(recentLogs.subList(0, limit));
            
            // Reverse to chronological order (oldest first)
            Collections.reverse(sublist);
            
            for (AiQueryLog log : sublist) {
                history.add(new GroqClient.Message("user", log.getQuery()));
                history.add(new GroqClient.Message("assistant", log.getResponse()));
            }
            
            aiResponse = groqClient.generateCompletion(systemPrompt, history, request.getQuery());
        } else {
            aiResponse = groqClient.generateCompletion(systemPrompt, request.getQuery());
        }

        AiQueryLog queryLog = AiQueryLog.builder()
                .userId(request.getUserId())
                .query(request.getQuery())
                .response(aiResponse)
                .queryType(queryType)
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

    @Transactional
    public void deleteQueryHistory(String userId) {
        List<AiQueryLog> logs = aiQueryLogRepository.findByUserIdOrderByTimestampDesc(userId);
        if (!logs.isEmpty()) {
            aiQueryLogRepository.deleteAll(logs);
        }
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
