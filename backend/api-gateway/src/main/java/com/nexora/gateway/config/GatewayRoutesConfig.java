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
 * Downstream URIs are configurable via {@code nexora.gateway.services.*} properties
 * (or {@code NEXORA_SERVICE_*_URI} environment variables) so the gateway works
 * both on localhost during development and inside Docker Compose.
 */
@Configuration
public class GatewayRoutesConfig {

    @Autowired
    private RequestLoggingFilter requestLoggingFilter;

    @Autowired
    private ServiceUriProperties serviceUris;

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

    @Bean
    public RouteLocator nexoraRoutes(RouteLocatorBuilder builder) {
        return builder.routes()

                .route("marketplace-service", r -> r
                        .path("/api/marketplace/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "marketplace-service"))
                        .uri(serviceUris.marketplace()))

                .route("payment-service-payments", r -> r
                        .path("/api/payments/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "payment-service"))
                        .uri(serviceUris.payment()))

                .route("payment-service-wallet", r -> r
                        .path("/api/wallet/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "payment-service"))
                        .uri(serviceUris.payment()))

                .route("notification-service", r -> r
                        .path("/api/notifications/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "notification-service"))
                        .uri(serviceUris.notification()))

                .route("ai-service", r -> r
                        .path("/api/ai/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "ai-service"))
                        .uri(serviceUris.ai()))

                .route("food-service", r -> r
                        .path("/api/food/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "food-service"))
                        .uri(serviceUris.food()))

                .route("laundry-service", r -> r
                        .path("/api/laundry/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "laundry-service"))
                        .uri(serviceUris.laundry()))

                .route("print-service", r -> r
                        .path("/api/print/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "print-service"))
                        .uri(serviceUris.print()))

                .route("medical-service", r -> r
                        .path("/api/medical/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "medical-service"))
                        .uri(serviceUris.medical()))

                .route("chat-service", r -> r
                        .path("/api/conversations/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "chat-service"))
                        .uri(serviceUris.chat()))

                .route("lost-found-service", r -> r
                        .path("/api/lost-found/**")
                        .filters(f -> f
                                .filter(requestLoggingFilter)
                                .addRequestHeader("X-Gateway-Service", "lost-found-service"))
                        .uri(serviceUris.lostFound()))

                .build();
    }
}
