package com.nexora.marketplace.repository;

import com.nexora.marketplace.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Orders placed by a buyer ("my purchases")
    List<Order> findByBuyerIdOrderByCreatedAtDesc(String buyerId);

    // Orders received by a seller ("my sales")
    List<Order> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    // All orders for a specific product
    List<Order> findByProductIdOrderByCreatedAtDesc(Long productId);
}
