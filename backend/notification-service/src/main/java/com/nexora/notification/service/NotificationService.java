package com.nexora.notification.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.notification.dto.NotificationRequestDto;
import com.nexora.notification.dto.NotificationResponseDto;
import com.nexora.notification.entity.Notification;
import com.nexora.notification.entity.NotificationStatus;
import com.nexora.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public NotificationResponseDto sendNotification(NotificationRequestDto request) {
        if (request.getRecipient() == null || request.getRecipient().isBlank()) {
            throw new NexoraException("Recipient cannot be empty");
        }
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new NexoraException("Message content cannot be empty");
        }
        if (request.getType() == null) {
            throw new NexoraException("Notification type must be specified");
        }

        // Mock dispatch mechanism (simulate success)
        NotificationStatus status = NotificationStatus.SENT;

        Notification notification = Notification.builder()
                .recipient(request.getRecipient())
                .type(request.getType())
                .title(request.getTitle() != null ? request.getTitle() : "Notification")
                .message(request.getMessage())
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        return mapToResponseDto(savedNotification);
    }

    @Transactional(readOnly = true)
    public NotificationResponseDto getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification record not found with ID: " + id));
        return mapToResponseDto(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getNotificationsByRecipient(String recipient) {
        List<Notification> notifications = notificationRepository.findByRecipient(recipient);
        return notifications.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private NotificationResponseDto mapToResponseDto(Notification notification) {
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .recipient(notification.getRecipient())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .status(notification.getStatus())
                .timestamp(notification.getTimestamp())
                .build();
    }
}
