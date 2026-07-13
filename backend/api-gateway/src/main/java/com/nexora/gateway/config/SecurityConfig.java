package com.nexora.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Reactive Spring Security configuration for the API Gateway.
 *
 * Responsibilities:
 *  1. JWT validation against Keycloak's JWKS endpoint.
 *  2. Propagating realm roles (from realm_access.roles) as Spring GrantedAuthorities.
 *  3. Enforcing authentication on all routes except actuator health checks.
 *  4. CORS policy: allows all origins/methods for development; tighten for production.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwkSetUri;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            // ── CORS ──────────────────────────────────────────────────────────
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ── CSRF disabled (stateless JWT API) ─────────────────────────────
            .csrf(ServerHttpSecurity.CsrfSpec::disable)

            // ── Authorization Rules ───────────────────────────────────────────
            .authorizeExchange(exchanges -> exchanges
                // Actuator health and info endpoints are public
                .pathMatchers("/actuator/health", "/actuator/info").permitAll()
                // All other requests require a valid JWT
                .anyExchange().authenticated()
            )

            // ── OAuth2 Resource Server (JWT) ──────────────────────────────────
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtDecoder(reactiveJwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            );

        return http.build();
    }

    /**
     * Reactive JWT decoder backed by Keycloak's JWKS endpoint.
     */
    @Bean
    public ReactiveJwtDecoder reactiveJwtDecoder() {
        return NimbusReactiveJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }

    /**
     * Converts JWT claims into Spring Security GrantedAuthorities.
     * Extracts roles from Keycloak's realm_access.roles claim and prefixes
     * each role with "ROLE_" to match Spring Security conventions.
     */
    @Bean
    public ReactiveJwtAuthenticationConverterAdapter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // Extract standard scope-based authorities
            Collection<GrantedAuthority> scopeAuthorities =
                    new org.springframework.security.oauth2.server.resource.authentication
                            .JwtGrantedAuthoritiesConverter().convert(jwt);

            // Extract Keycloak realm roles
            @SuppressWarnings("unchecked")
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            Collection<GrantedAuthority> realmRoles = Set.of();
            if (realmAccess != null) {
                @SuppressWarnings("unchecked")
                Collection<String> roles = (Collection<String>) realmAccess.get("roles");
                if (roles != null) {
                    realmRoles = roles.stream()
                            .map(role -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + role))
                            .collect(Collectors.toSet());
                }
            }

            // Merge both sets
            Collection<GrantedAuthority> merged = new java.util.HashSet<>();
            if (scopeAuthorities != null) merged.addAll(scopeAuthorities);
            merged.addAll(realmRoles);
            return merged;
        });

        // Use preferred_username as the principal name (consistent with other services)
        converter.setPrincipalClaimName("preferred_username");

        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }

    /**
     * CORS configuration. For production, replace "*" with allowed frontend origins.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        config.setExposedHeaders(List.of("X-Rate-Limit-Remaining", "X-Rate-Limit-Retry-After-Seconds"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
