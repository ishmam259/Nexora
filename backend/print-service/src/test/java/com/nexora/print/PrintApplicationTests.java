package com.nexora.print;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8081/realms/nexora",
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:8081/realms/nexora/protocol/openid-connect/certs"
})
class PrintApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the Spring context starts correctly
    }
}
