package com.nexora.notification.dto;

import com.nexora.notification.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDto {
    private String recipient;
    private NotificationType type;
    private String title;
    private String message;
}
