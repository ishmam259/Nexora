package com.nexora.marketplace.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.marketplace.dto.ReviewRequestDto;
import com.nexora.marketplace.dto.ReviewResponseDto;
import com.nexora.marketplace.entity.Review;
import com.nexora.marketplace.repository.ProductRepository;
import com.nexora.marketplace.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @Transactional
    public ReviewResponseDto addReview(ReviewRequestDto request, String reviewerId) {
        if (request.getProductId() == null) {
            throw new NexoraException("Product ID must be specified");
        }
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new NexoraException("Rating must be between 1 and 5");
        }

        if (!productRepository.existsById(request.getProductId())) {
            throw new ResourceNotFoundException("Product not found with ID: " + request.getProductId());
        }

        if (reviewRepository.existsByProductIdAndReviewerId(request.getProductId(), reviewerId)) {
            throw new NexoraException("You have already reviewed this product");
        }

        // Prevent seller from reviewing their own product
        productRepository.findById(request.getProductId()).ifPresent(product -> {
            if (product.getSellerId().equals(reviewerId)) {
                throw new NexoraException("You cannot review your own product");
            }
        });

        Review review = Review.builder()
                .productId(request.getProductId())
                .reviewerId(reviewerId)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsByProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with ID: " + productId);
        }
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteReview(Long reviewId, String requesterId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));

        if (!isAdmin && !review.getReviewerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to delete this review");
        }

        reviewRepository.deleteById(reviewId);
    }

    private ReviewResponseDto mapToDto(Review review) {
        return ReviewResponseDto.builder()
                .id(review.getId())
                .productId(review.getProductId())
                .reviewerId(review.getReviewerId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
