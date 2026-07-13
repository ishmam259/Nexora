package com.nexora.marketplace.repository;

import com.nexora.marketplace.entity.Product;
import com.nexora.marketplace.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // All active products (marketplace browse)
    List<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status);

    // All products for a specific seller
    List<Product> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    // All products in a category
    List<Product> findByCategoryIdAndStatusOrderByCreatedAtDesc(Long categoryId, ProductStatus status);

    // Search by title keyword (case-insensitive)
    List<Product> findByTitleContainingIgnoreCaseAndStatusOrderByCreatedAtDesc(String title, ProductStatus status);
}
