package com.nexora.marketplace.controller;

import com.nexora.marketplace.dto.ReviewRequestDto;
import com.nexora.marketplace.dto.ReviewResponseDto;
import com.nexora.marketplace.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    /** Submit a review for a product */
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT')")
    public ResponseEntity<ReviewResponseDto> addReview(
            @RequestBody ReviewRequestDto request,
            Authentication authentication) {
        String reviewerId = authentication.getName();
        ReviewResponseDto response = reviewService.addReview(request, reviewerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /** Get all reviews for a specific product */
    @GetMapping("/product/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    /** Delete a review (reviewer or admin only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        reviewService.deleteReview(id, requesterId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}
