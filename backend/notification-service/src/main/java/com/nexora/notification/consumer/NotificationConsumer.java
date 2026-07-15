package com.nexora.notification.consumer;

import com.nexora.common.event.NotificationEvent;
import com.nexora.notification.dto.NotificationRequestDto;
import com.nexora.notification.entity.NotificationType;
import com.nexora.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = "notification.queue")
    public void consumeNotificationEvent(NotificationEvent event) {
        log.info("Received notification event from RabbitMQ: {}", event);
        try {
            NotificationType type;
            try {
                type = NotificationType.valueOf(event.getType().toUpperCase());
            } catch (Exception e) {
                log.warn("Invalid notification type: {}, defaulting to EMAIL", event.getType());
                type = NotificationType.EMAIL;
            }

            NotificationRequestDto requestDto = NotificationRequestDto.builder()
                    .recipient(event.getRecipient())
                    .type(type)
                    .title(event.getTitle())
                    .message(event.getMessage())
                    .build();

            notificationService.sendNotification(requestDto);
            log.info("Notification successfully processed and saved for recipient: {}", event.getRecipient());
        } catch (Exception e) {
            log.error("Failed to process notification event: {}", e.getMessage(), e);
        }
    }
}
