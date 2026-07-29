package com.nexora.marketplace.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.marketplace.dto.CommentRequestDto;
import com.nexora.marketplace.dto.CommentResponseDto;
import com.nexora.marketplace.entity.Comment;
import com.nexora.marketplace.repository.CommentRepository;
import com.nexora.marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsForProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Listing not found with ID: " + productId);
        }
        return commentRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponseDto addComment(CommentRequestDto request, String authorId) {
        if (request.getProductId() == null) {
            throw new NexoraException("Product ID is required");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new NexoraException("Comment cannot be empty");
        }
        if (!productRepository.existsById(request.getProductId())) {
            throw new ResourceNotFoundException("Listing not found with ID: " + request.getProductId());
        }

        Comment comment = Comment.builder()
                .productId(request.getProductId())
                .authorId(authorId)
                .content(request.getContent().trim())
                .build();

        return mapToDto(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long id, String requesterId, boolean isAdmin) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + id));
        if (!isAdmin && !comment.getAuthorId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to delete this comment");
        }
        commentRepository.delete(comment);
    }

    private CommentResponseDto mapToDto(Comment comment) {
        return CommentResponseDto.builder()
                .id(comment.getId())
                .productId(comment.getProductId())
                .authorId(comment.getAuthorId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
