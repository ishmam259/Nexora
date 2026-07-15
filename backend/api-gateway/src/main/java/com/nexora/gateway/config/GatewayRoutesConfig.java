package com.nexora.gateway.config;

import com.nexora.gateway.filter.RequestLoggingFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

/**
 * Configures all route definitions for the Nexora API Gateway.
 *
 * Route Strategy:
 *  - /api/marketplace/**  → marketplace-service  (port 8082)
 *  - /api/payments/**     → payment-service      (port 8083)
 *  - /api/wallet/**       → payment-service      (port 8083)
 *  - /api/notifications/**→ notification-service (port 8084)
 *  - /api/ai/**           → ai-service           (port 8085)
 *  - /api/food/**         → food-service         (port 8086)
 *  - /api/laundry/**      → laundry-service      (port 8087)
 *  - /api/print/**        → print-service        (port 8088)
 *  - /api/medical/**      → medical-service      (port 8089)
 *  - /api/chat/**         → chat-service         (port 8090)
 *  - /api/lost-found/**   → lost-found-service   (port 8091)
 *
 * Paths are forwarded as-is (no prefix stripping) because all downstream
 * service controllers are already mounted under /api/... themselves.
 * The gateway adds an X-Gateway-Service header to each forwarded request
 * for downstream traceability.
 *
 * Rate limiting is configured via YAML (application.yml) using the
 * redis-rate-limiter filter, which requires a Redis instance.
 * In development (application-dev.yml) rate limiting is disabled.
 */
@Configuration
public class GatewayRoutesConfig {

    @Autowired
    private RequestLoggingFilter requestLoggingFilter;

    // ---------------------------------------------------------------------------
    // Key Resolver: resolves the rate-limit bucket key from the JWT subject.
    // Falls back to the remote IP address for unauthenticated requests.
    // ---------------------------------------------------------------------------
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> exchange.getPrincipal()
                .map(java.security.Principal::getName)
                .switchIfEmpty(Mono.justOrEmpty(
                        exchange.getRequest().getRemoteAddress() != null
                                ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                                : "anonymous"
                ));
    }

    // ---------------------------------------------------------------------------
    // Route Definitions
    // ---------------------------------------------------------------------------
    @Bean
    public RouteLocator nexoraRoutes(RouteLocatorBuilder builder) {
        return builder.routes()

                // ── Marketplace Service ──────────────────────────────────────────
                // Handles: /api/marketplace/products, /api/marketplace/orders, etc.
                .route("marketplace-service", r -> r
                        .path("/api/marketplace/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "marketplace-service"))
                        .uri("http://localhost:8082"))

                // ── Payment Service — Payments ────────────────────────────────────
                // Handles: /api/payments/charge, /api/payments/{id}, etc.
                .route("payment-service-payments", r -> r
                        .path("/api/payments/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "payment-service"))
                        .uri("http://localhost:8083"))

                // ── Payment Service — Wallet ──────────────────────────────────────
                // Handles: /api/wallet/me, /api/wallet/topup, /api/wallet/me/transactions
                .route("payment-service-wallet", r -> r
                        .path("/api/wallet/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "payment-service"))
                        .uri("http://localhost:8083"))

                // ── Notification Service ─────────────────────────────────────────
                .route("notification-service", r -> r
                        .path("/api/notifications/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "notification-service"))
                        .uri("http://localhost:8084"))

                // ── AI Service ───────────────────────────────────────────────────
                .route("ai-service", r -> r
                        .path("/api/ai/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "ai-service"))
                        .uri("http://localhost:8085"))

                // ── Food Service ─────────────────────────────────────────────────
                .route("food-service", r -> r
                        .path("/api/food/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "food-service"))
                        .uri("http://localhost:8086"))

                // ── Laundry Service ──────────────────────────────────────────────
                .route("laundry-service", r -> r
                        .path("/api/laundry/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "laundry-service"))
                        .uri("http://localhost:8087"))

                // ── Print Service ────────────────────────────────────────────────
                .route("print-service", r -> r
                        .path("/api/print/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "print-service"))
                        .uri("http://localhost:8088"))

                // ── Medical Service ──────────────────────────────────────────────
                .route("medical-service", r -> r
                        .path("/api/medical/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "medical-service"))
                        .uri("http://localhost:8089"))

                // ── Chat Service ─────────────────────────────────────────────────
                .route("chat-service", r -> r
                        .path("/api/conversations/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "chat-service"))
                        .uri("http://localhost:8090"))

                // ── Lost & Found Service ─────────────────────────────────────────
                .route("lost-found-service", r -> r
                        .path("/api/lost-found/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "lost-found-service"))
                        .uri("http://localhost:8091"))

                .build();
    }
}
