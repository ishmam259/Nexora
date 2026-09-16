package com.nexora.chat.service;

import com.nexora.chat.dto.MessageRequestDto;
import com.nexora.chat.dto.MessageResponseDto;
import com.nexora.chat.entity.Conversation;
import com.nexora.chat.entity.Message;
import com.nexora.chat.repository.ConversationRepository;
import com.nexora.chat.repository.MessageRepository;
import com.nexora.chat.publisher.NotificationPublisher;
import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final NotificationPublisher notificationPublisher;

    @Transactional
    public MessageResponseDto sendMessage(Long conversationId, MessageRequestDto request) {
        if (request.getSenderId() == null || request.getSenderId().isBlank()) {
            throw new NexoraException("Sender ID cannot be empty");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new NexoraException("Message content cannot be empty");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with ID: " + conversationId));

        // Verify the sender is a participant of the conversation
        if (!conversation.getParticipantOne().equals(request.getSenderId())
                && !conversation.getParticipantTwo().equals(request.getSenderId())) {
            throw new NexoraException("Sender is not a participant of this conversation");
        }

        LocalDateTime now = LocalDateTime.now();

        Message message = Message.builder()
                .conversation(conversation)
                .senderId(request.getSenderId())
                .content(request.getContent())
                .sentAt(now)
                .read(false)
                .build();

        Message saved = messageRepository.save(message);

        // Update conversation's updatedAt timestamp
        conversation.setUpdatedAt(now);
        conversationRepository.save(conversation);

        String recipient = conversation.getParticipantOne().equals(request.getSenderId())
                ? conversation.getParticipantTwo()
                : conversation.getParticipantOne();
        notificationPublisher.sendNotification(
                recipient,
                "New message from " + request.getSenderId(),
                request.getContent()
        );

        return mapToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<MessageResponseDto> getMessagesByConversation(Long conversationId) {
        // Verify conversation exists
        if (!conversationRepository.existsById(conversationId)) {
            throw new ResourceNotFoundException("Conversation not found with ID: " + conversationId);
        }

        List<Message> messages = messageRepository.findByConversationIdOrderBySentAtAsc(conversationId);
        return messages.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public int markMessagesAsRead(Long conversationId, String userId) {
        // Verify conversation exists
        if (!conversationRepository.existsById(conversationId)) {
            throw new ResourceNotFoundException("Conversation not found with ID: " + conversationId);
        }

        return messageRepository.markMessagesAsRead(conversationId, userId);
    }

    private MessageResponseDto mapToResponseDto(Message message) {
        return MessageResponseDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSenderId())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .read(message.isRead())
                .build();
    }
}
