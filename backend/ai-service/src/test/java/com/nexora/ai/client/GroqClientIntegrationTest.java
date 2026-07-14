package com.nexora.ai.client;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8081/realms/nexora",
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:8081/realms/nexora/protocol/openid-connect/certs"
})
class GroqClientIntegrationTest {

    @Autowired
    private GroqClient groqClient;

    @Test
    void testGroqApiReturnsValidResponse() {
        String response = groqClient.generateCompletion(
                "You are a helpful assistant. Reply in one sentence only.",
                "What is 2 + 2?"
        );

        assertNotNull(response, "Groq response should not be null");
        assertFalse(response.isBlank(), "Groq response should not be blank");
        System.out.println("=== GROQ RESPONSE ===");
        System.out.println(response);
        System.out.println("=====================");
    }
}
