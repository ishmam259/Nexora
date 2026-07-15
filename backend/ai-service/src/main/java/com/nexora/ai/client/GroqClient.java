package com.nexora.ai.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class GroqClient {

    private final RestClient restClient;
    private final String model;
    private final boolean apiKeyConfigured;

    public GroqClient(
            @Value("${groq.api.key:}") String apiKey,
            @Value("${groq.api.url}") String apiUrl,
            @Value("${groq.model}") String model) {
        this.model = model;
        this.apiKeyConfigured = apiKey != null && !apiKey.isBlank();
        if (!this.apiKeyConfigured) {
            log.warn("[AI-SERVICE] Groq API key is not configured. AI responses will use a fallback mode.");
        }
        this.restClient = RestClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + (apiKey != null ? apiKey : ""))
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public record Message(String role, String content) {}

    private record GroqRequest(
            String model,
            List<Message> messages,
            double temperature
    ) {}

    private record Choice(Integer index, Message message, String finishReason) {}

    private record Usage(Integer promptTokens, Integer completionTokens, Integer totalTokens) {}

    private record GroqResponse(
            String id,
            String object,
            Long created,
            String model,
            List<Choice> choices,
            Usage usage
    ) {}

    /**
     * Send a single prompt with system context to Groq and return the response.
     */
    public String generateCompletion(String systemPrompt, String userQuery) {
        return generateCompletion(systemPrompt, List.of(), userQuery);
    }

    /**
     * Send a multi-turn request to Groq with history, system context, and user query.
     */
    public String generateCompletion(String systemPrompt, List<Message> history, String userQuery) {
        if (!apiKeyConfigured) {
            return buildFallbackResponse(userQuery);
        }

        List<Message> messages = new ArrayList<>();

        if (systemPrompt != null && !systemPrompt.isBlank()) {
            messages.add(new Message("system", systemPrompt));
        }

        if (history != null && !history.isEmpty()) {
            messages.addAll(history);
        }

        messages.add(new Message("user", userQuery));

        GroqRequest request = new GroqRequest(model, messages, 0.7);

        try {
            GroqResponse response = restClient.post()
                    .body(request)
                    .retrieve()
                    .body(GroqResponse.class);

            if (response == null || response.choices() == null || response.choices().isEmpty()) {
                log.warn("[AI-SERVICE] Empty response from Groq API, using fallback.");
                return buildFallbackResponse(userQuery);
            }

            return response.choices().get(0).message().content();
        } catch (Exception e) {
            log.error("[AI-SERVICE] Error calling Groq API: {}. Using fallback response.", e.getMessage());
            return buildFallbackResponse(userQuery);
        }
    }

    /**
     * Returns a helpful fallback response when no Groq API key is configured
     * or when the API call fails. This prevents 500 errors in development.
     */
    private String buildFallbackResponse(String userQuery) {
        return "Hello! I'm the Nexora Campus Assistant. I received your message: \"" + userQuery + "\"\n\n" +
                "Currently, the AI service is running in demo mode (no external AI key configured). " +
                "In production, I can help you with:\n" +
                "• 🛍️ Marketplace — browse and list products\n" +
                "• 🍜 Food — order from campus restaurants\n" +
                "• 👕 Laundry — book laundry slots\n" +
                "• 🖨️ Printing — submit print jobs\n" +
                "• 💊 Medical — find medicines and book appointments\n" +
                "• 🔍 Lost & Found — report or search for items\n" +
                "• 💬 Chat — message other users\n\n" +
                "To enable full AI responses, configure the GROQ_API_KEY environment variable.";
    }
}
