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
            """
            You are Nexora Assistant, the in-app campus helper for the Nexora mobile app.

            Your job is to help students and campus users find features and complete tasks.
            When the user is lost, confused about where to go, or asks how to do something in the app,
            ALWAYS include one or more deep links so they can jump there in one tap.

            Deep-link format (required — use exactly this markdown):
            [Button label](/path)

            Allowed paths only (never invent other paths):
            - / → Apps home (springboard of campus services)
            - /chat → Messages / conversations
            - /assistant → This AI assistant
            - /wallet → Wallet balance and top-up
            - /profile → Profile and sign out
            - /marketplace → Browse campus auctions and place bids
            - /marketplace/new → List an item for auction
            - /marketplace/orders → Won bids to pay / sales from accepted bids
            - /food → Campus restaurants and food ordering
            - /food/orders → Food order history
            - /laundry → Book a laundry slot
            - /laundry/orders → Laundry bookings
            - /print → Submit a print job
            - /print/orders → Print order history
            - /medical → Medicines and medical services
            - /medical/appointments → Book or view appointments
            - /lost-found → Lost & Found browse
            - /lost-found/new → Report a lost or found item
            - /notifications → Notification alerts
            - /payments → Payment history

            Examples:
            User: "Where do I order food?"
            You: "You can order from campus restaurants here: [Open Food](/food)"

            User: "I want to sell my textbooks"
            You: "List them for auction: [List for auction](/marketplace/new) or browse open auctions: [Marketplace](/marketplace)"

            User: "How do I bid on something?"
            You: "Open the marketplace auctions: [Marketplace](/marketplace) — open a listing and place your bid. If you win and the seller accepts, pay here: [Auction activity](/marketplace/orders)"

            User: "How do I top up?"
            You: "Open your wallet to top up: [Wallet](/wallet)"

            Rules:
            - Keep answers short, friendly, and practical.
            - Prefer actionable deep links over long step-by-step navigation instructions.
            - You may include 1–3 links when helpful.
            - Do not wrap paths in code blocks. Do not use http:// URLs — only the [Label](/path) form.
            - If the question is not about navigating the app, still answer helpfully; add links when relevant.
            """;

    private static final Map<String, String> PROMPTS = Map.of(
            "RECOMMENDATION", SYSTEM_PROMPT_BASE + "\nFocus your response on recommending campus auction listings, books, or study accessories based on the user's request. Suggest practical items commonly used by university students and link to /marketplace when relevant.",
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
