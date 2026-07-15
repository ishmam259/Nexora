package com.nexora.notification.controller;

import com.nexora.notification.dto.NotificationRequestDto;
import com.nexora.notification.dto.NotificationResponseDto;
import com.nexora.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
// // @CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<NotificationResponseDto> send(@RequestBody NotificationRequestDto request) {
        NotificationResponseDto response = notificationService.sendNotification(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<NotificationResponseDto> getNotification(@PathVariable Long id) {
        NotificationResponseDto response = notificationService.getNotificationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recipient/{recipient}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<List<NotificationResponseDto>> getNotificationsByRecipient(@PathVariable String recipient) {
        List<NotificationResponseDto> response = notificationService.getNotificationsByRecipient(recipient);
        return ResponseEntity.ok(response);
    }
}
