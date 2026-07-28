package com.nexora.marketplace.controller;

import com.nexora.marketplace.dto.CommentRequestDto;
import com.nexora.marketplace.dto.CommentResponseDto;
import com.nexora.marketplace.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/product/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CommentResponseDto>> getComments(@PathVariable Long productId) {
        return ResponseEntity.ok(commentService.getCommentsForProduct(productId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<CommentResponseDto> addComment(
            @RequestBody CommentRequestDto request,
            Authentication authentication) {
        CommentResponseDto created = commentService.addComment(request, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        commentService.deleteComment(id, authentication.getName(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
