package com.nexora.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Global request filtering that runs before every route.
 *
 * Blocks requests that contain potentially dangerous patterns, such as:
 *  - SQL injection attempts in query parameters
 *  - Script injection in query parameters
 *  - Null bytes in the URI
 *
 * Blocked requests receive a 400 Bad Request response.
 */
@Slf4j
@Component
public class RequestFilterGlobalFilter implements GlobalFilter, Ordered {

    /** Patterns that indicate a potentially malicious request. */
    private static final List<String> BLOCKED_PATTERNS = List.of(
            // SQL injection
            "' OR '", "' OR 1=1", "--", "/*", "*/", "xp_",
            "UNION SELECT", "DROP TABLE", "INSERT INTO", "DELETE FROM",
            // Script injection
            "<script>", "</script>", "javascript:", "onerror=", "onload=",
            // Null byte
            "%00", "\u0000"
    );

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String rawQuery = exchange.getRequest().getURI().getRawQuery();
        String path = exchange.getRequest().getPath().value();

        // Check path and query string against blocked patterns
        String toCheck = (path + (rawQuery != null ? "?" + rawQuery : "")).toUpperCase();

        for (String pattern : BLOCKED_PATTERNS) {
            if (toCheck.contains(pattern.toUpperCase())) {
                log.warn("[GATEWAY] Blocked suspicious request: {} {}",
                        exchange.getRequest().getMethod(), exchange.getRequest().getURI());
                return rejectRequest(exchange, "Request contains disallowed content.");
            }
        }

        return chain.filter(exchange);
    }

    private Mono<Void> rejectRequest(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.BAD_REQUEST);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"error\":\"Bad Request\",\"message\":\"" + message + "\"}";
        DataBuffer buffer = exchange.getResponse().bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}
