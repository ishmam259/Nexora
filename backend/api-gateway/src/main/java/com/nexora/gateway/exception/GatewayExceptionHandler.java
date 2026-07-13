package com.nexora.gateway.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.server.WebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

/**
 * Global exception handler for the reactive API Gateway.
 *
 * Maps common exceptions to appropriate HTTP responses:
 *  - AccessDeniedException       → 403 Forbidden
 *  - InvalidBearerTokenException → 401 Unauthorized
 *  - ResponseStatusException     → uses the embedded status code
 *  - All others                  → 500 Internal Server Error
 */
@Slf4j
@Order(-2)
@Component
public class GatewayExceptionHandler implements WebExceptionHandler {

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        ServerHttpResponse response = exchange.getResponse();
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        HttpStatus status;
        String message;

        if (ex instanceof AccessDeniedException) {
            status = HttpStatus.FORBIDDEN;
            message = "Access Denied: You do not have permission to access this resource.";
            log.warn("[GATEWAY] Access denied: {}", ex.getMessage());

        } else if (ex instanceof InvalidBearerTokenException) {
            status = HttpStatus.UNAUTHORIZED;
            message = "Invalid or expired JWT token.";
            log.warn("[GATEWAY] Invalid bearer token: {}", ex.getMessage());

        } else if (ex instanceof org.springframework.security.core.AuthenticationException) {
            status = HttpStatus.UNAUTHORIZED;
            message = "Authentication required. Please provide a valid Bearer token.";
            log.warn("[GATEWAY] Authentication failed: {}", ex.getMessage());

        } else if (ex instanceof ResponseStatusException rse) {
            status = HttpStatus.valueOf(rse.getStatusCode().value());
            message = rse.getReason() != null ? rse.getReason() : rse.getMessage();
            log.debug("[GATEWAY] Response status exception: {}", ex.getMessage());

        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = "An unexpected gateway error occurred.";
            log.error("[GATEWAY] Unhandled exception: {}", ex.getMessage(), ex);
        }

        response.setStatusCode(status);
        String body = buildErrorBody(status, message, exchange.getRequest().getPath().value());
        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    private String buildErrorBody(HttpStatus status, String message, String path) {
        return String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                LocalDateTime.now(), status.value(), status.getReasonPhrase(),
                message.replace("\"", "'"), path
        );
    }
}
