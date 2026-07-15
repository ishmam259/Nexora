package com.nexora.payment.publisher;

import com.nexora.common.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void sendNotification(String recipient, String title, String message) {
        NotificationEvent event = NotificationEvent.builder()
                .recipient(recipient)
                .type("EMAIL") // Defaulting to EMAIL for payment notifications
                .title(title)
                .message(message)
                .build();

        log.info("Publishing notification event to RabbitMQ: {}", event);
        try {
            rabbitTemplate.convertAndSend("notification.exchange", "notification.routingKey", event);
            log.info("Successfully published notification event for: {}", recipient);
        } catch (Exception e) {
            log.error("Failed to publish notification event to RabbitMQ: {}", e.getMessage(), e);
        }
    }
}
