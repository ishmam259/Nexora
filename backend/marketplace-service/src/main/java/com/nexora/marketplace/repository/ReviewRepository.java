package com.nexora.marketplace.repository;

import com.nexora.marketplace.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // All reviews for a product
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    // Check if user already reviewed this product (enforce unique constraint at service level too)
    Optional<Review> findByProductIdAndReviewerId(Long productId, String reviewerId);

    boolean existsByProductIdAndReviewerId(Long productId, String reviewerId);
}
