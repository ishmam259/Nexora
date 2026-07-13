package com.nexora.chat.service;

import com.nexora.chat.dto.ConversationRequestDto;
import com.nexora.chat.dto.ConversationResponseDto;
import com.nexora.chat.dto.MessageResponseDto;
import com.nexora.chat.entity.Conversation;
import com.nexora.chat.entity.Message;
import com.nexora.chat.repository.ConversationRepository;
import com.nexora.chat.repository.MessageRepository;
import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public ConversationResponseDto createConversation(ConversationRequestDto request) {
        if (request.getParticipantOne() == null || request.getParticipantOne().isBlank()) {
            throw new NexoraException("Participant one cannot be empty");
        }
        if (request.getParticipantTwo() == null || request.getParticipantTwo().isBlank()) {
            throw new NexoraException("Participant two cannot be empty");
        }
        if (request.getParticipantOne().equals(request.getParticipantTwo())) {
            throw new NexoraException("Cannot create a conversation with yourself");
        }

        // Return existing conversation if one already exists between these two participants
        Optional<Conversation> existing = conversationRepository.findByParticipants(
                request.getParticipantOne(), request.getParticipantTwo());
        if (existing.isPresent()) {
            return mapToResponseDto(existing.get());
        }

        LocalDateTime now = LocalDateTime.now();
        Conversation conversation = Conversation.builder()
                .participantOne(request.getParticipantOne())
                .participantTwo(request.getParticipantTwo())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Conversation saved = conversationRepository.save(conversation);
        return mapToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public ConversationResponseDto getConversationById(Long id) {
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with ID: " + id));
        return mapToResponseDto(conversation);
    }

    @Transactional(readOnly = true)
    public List<ConversationResponseDto> getConversationsByUser(String userId) {
        List<Conversation> conversations = conversationRepository.findByParticipant(userId);
        return conversations.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private ConversationResponseDto mapToResponseDto(Conversation conversation) {
        // Fetch the last message for this conversation
        MessageResponseDto lastMessage = messageRepository
                .findTopByConversationIdOrderBySentAtDesc(conversation.getId())
                .map(this::mapMessageToResponseDto)
                .orElse(null);

        return ConversationResponseDto.builder()
                .id(conversation.getId())
                .participantOne(conversation.getParticipantOne())
                .participantTwo(conversation.getParticipantTwo())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .lastMessage(lastMessage)
                .build();
    }

    private MessageResponseDto mapMessageToResponseDto(Message message) {
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
