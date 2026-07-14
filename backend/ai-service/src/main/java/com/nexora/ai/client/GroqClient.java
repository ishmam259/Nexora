package com.nexora.ai.client;

import com.nexora.common.exception.NexoraException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Component
public class GroqClient {

    private final RestClient restClient;
    private final String model;

    public GroqClient(
            @Value("${groq.api.key}") String apiKey,
            @Value("${groq.api.url}") String apiUrl,
            @Value("${groq.model}") String model) {
        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
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
                throw new NexoraException("Invalid response received from Groq API");
            }

            return response.choices().get(0).message().content();
        } catch (Exception e) {
            throw new NexoraException("Error interacting with Groq AI service: " + e.getMessage(), e);
        }
    }
}
