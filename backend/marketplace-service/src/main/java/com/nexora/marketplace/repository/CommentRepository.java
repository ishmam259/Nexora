package com.nexora.marketplace.repository;

import com.nexora.marketplace.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByProductIdOrderByCreatedAtDesc(Long productId);

    long countByProductId(Long productId);
}
