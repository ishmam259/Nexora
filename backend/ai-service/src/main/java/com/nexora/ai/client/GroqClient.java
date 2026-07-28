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
        String lower = userQuery == null ? "" : userQuery.toLowerCase();
        if (lower.contains("food") || lower.contains("restaurant") || lower.contains("eat")) {
            return "You can order from campus restaurants here: [Open Food](/food)\n\n"
                    + "To track past orders: [Food orders](/food/orders)";
        }
        if (lower.contains("laundry") || lower.contains("wash")) {
            return "Book a laundry slot here: [Laundry](/laundry)";
        }
        if (lower.contains("print")) {
            return "Submit a print job here: [Print](/print)";
        }
        if (lower.contains("wallet") || lower.contains("top up") || lower.contains("topup") || lower.contains("balance")) {
            return "Check your balance or top up here: [Wallet](/wallet)";
        }
        if (lower.contains("sell") || lower.contains("marketplace") || lower.contains("bid") || lower.contains("auction")) {
            return "Browse campus auctions: [Marketplace](/marketplace)\n\n"
                    + "To list something: [List for auction](/marketplace/new)\n\n"
                    + "Won bids / sales: [Auction activity](/marketplace/orders)";
        }
        if (lower.contains("lost") || lower.contains("found")) {
            return "Open Lost & Found: [Lost & Found](/lost-found)\n\n"
                    + "To report an item: [Report item](/lost-found/new)";
        }
        if (lower.contains("medical") || lower.contains("doctor") || lower.contains("appointment") || lower.contains("medicine")) {
            return "Medical services: [Medical](/medical)\n\n"
                    + "Appointments: [Book appointment](/medical/appointments)";
        }
        if (lower.contains("chat") || lower.contains("message")) {
            return "Open your conversations: [Chat](/chat)";
        }

        return "I can help you get around Nexora. Try asking where to order food, book laundry, "
                + "top up your wallet, or sell something.\n\n"
                + "Quick links:\n"
                + "[Apps home](/) · [Food](/food) · [Marketplace](/marketplace) · [Wallet](/wallet)\n\n"
                + "(Full AI answers need GROQ_API_KEY configured on the ai-service.)";
    }
}
