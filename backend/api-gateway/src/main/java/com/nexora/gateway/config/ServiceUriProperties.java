package com.nexora.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nexora.gateway.services")
public record ServiceUriProperties(
        String marketplace,
        String payment,
        String notification,
        String ai,
        String food,
        String laundry,
        String print,
        String medical,
        String chat,
        String lostFound
) {
    public ServiceUriProperties {
        marketplace = defaultUri(marketplace, "http://localhost:8082");
        payment = defaultUri(payment, "http://localhost:8083");
        notification = defaultUri(notification, "http://localhost:8084");
        ai = defaultUri(ai, "http://localhost:8085");
        food = defaultUri(food, "http://localhost:8086");
        laundry = defaultUri(laundry, "http://localhost:8087");
        print = defaultUri(print, "http://localhost:8088");
        medical = defaultUri(medical, "http://localhost:8089");
        chat = defaultUri(chat, "http://localhost:8090");
        lostFound = defaultUri(lostFound, "http://localhost:8091");
    }

    private static String defaultUri(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }
}
