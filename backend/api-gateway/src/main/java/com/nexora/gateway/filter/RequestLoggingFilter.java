package com.nexora.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * Global request/response logging filter applied to every route.
 *
 * Logs:
 *  - Incoming request: method, path, authenticated user
 *  - Outgoing response: status code and duration in ms
 *
 * Also injects downstream headers derived from the JWT:
 *  - X-User-Id      : Keycloak subject (UUID)
 *  - X-Username     : preferred_username claim
 *  - X-User-Email   : email claim
 *  - X-User-Roles   : comma-separated realm roles
 *  - X-Request-Time : epoch milliseconds
 */
@Slf4j
@Component
public class RequestLoggingFilter implements GatewayFilter, Ordered {

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE - 10;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        long startTime = Instant.now().toEpochMilli();

        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> java.util.Optional.ofNullable(ctx.getAuthentication()))
                .defaultIfEmpty(java.util.Optional.empty())
                .flatMap(authOpt -> proceed(exchange, chain, request, startTime, authOpt.orElse(null)));
    }

    private Mono<Void> proceed(ServerWebExchange exchange, GatewayFilterChain chain,
                               ServerHttpRequest request, long startTime,
                               org.springframework.security.core.Authentication auth) {
        ServerHttpRequest mutatedRequest = buildMutatedRequest(request, auth);
        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(mutatedRequest)
                .build();

        String username = (auth != null) ? auth.getName() : "anonymous";
        log.info("[GATEWAY] {} {} | User: {}",
                request.getMethod(), request.getPath(), username);

        return chain.filter(mutatedExchange)
                .doFinally(signalType -> {
                    ServerHttpResponse response = mutatedExchange.getResponse();
                    long duration = Instant.now().toEpochMilli() - startTime;
                    log.info("[GATEWAY] {} {} → {} | {}ms",
                            request.getMethod(), request.getPath(),
                            response.getStatusCode(), duration);
                });
    }

    /**
     * Builds a mutated request with user-identity headers derived from the JWT,
     * so downstream services can trust them without re-decoding the token.
     */
    private ServerHttpRequest buildMutatedRequest(ServerHttpRequest request,
                                                   org.springframework.security.core.Authentication auth) {
        ServerHttpRequest.Builder builder = request.mutate()
                .header("X-Request-Time", String.valueOf(Instant.now().toEpochMilli()));

        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();

            String subject = jwt.getSubject();
            String preferredUsername = jwt.getClaimAsString("preferred_username");
            String email = jwt.getClaimAsString("email");

            if (subject != null) builder.header("X-User-Id", subject);
            if (preferredUsername != null) builder.header("X-Username", preferredUsername);
            if (email != null) builder.header("X-User-Email", email);

            // Collect realm roles as comma-separated string
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess != null) {
                @SuppressWarnings("unchecked")
                java.util.Collection<String> roles =
                        (java.util.Collection<String>) realmAccess.get("roles");
                if (roles != null && !roles.isEmpty()) {
                    builder.header("X-User-Roles", String.join(",", roles));
                }
            }
        }

        return builder.build();
    }
}
