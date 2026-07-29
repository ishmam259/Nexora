package com.nexora.marketplace.repository;

import com.nexora.marketplace.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByProductIdOrderByAmountDescCreatedAtAsc(Long productId);

    List<Bid> findByBidderIdOrderByCreatedAtDesc(String bidderId);

    Optional<Bid> findFirstByProductIdOrderByAmountDescCreatedAtAsc(Long productId);

    long countByProductId(Long productId);
}
