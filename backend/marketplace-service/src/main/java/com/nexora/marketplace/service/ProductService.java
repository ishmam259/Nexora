package com.nexora.marketplace.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.marketplace.dto.ProductRequestDto;
import com.nexora.marketplace.dto.ProductResponseDto;
import com.nexora.marketplace.entity.*;
import com.nexora.marketplace.repository.CategoryRepository;
import com.nexora.marketplace.repository.ProductRepository;
import com.nexora.marketplace.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllActiveProducts() {
        return productRepository.findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with ID: " + categoryId);
        }
        return productRepository.findByCategoryIdAndStatusOrderByCreatedAtDesc(categoryId, ProductStatus.ACTIVE)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> searchProducts(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllActiveProducts();
        }
        return productRepository.findByTitleContainingIgnoreCaseAndStatusOrderByCreatedAtDesc(keyword, ProductStatus.ACTIVE)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return mapToResponseDto(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getMyProducts(String sellerId) {
        return productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDto createProduct(ProductRequestDto request, String sellerId) {
        validateProductRequest(request);

        if (!categoryRepository.existsById(request.getCategoryId())) {
            throw new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId());
        }

        Product product = Product.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock() != null ? request.getStock() : 1)
                .condition(request.getCondition() != null ? request.getCondition() : ProductCondition.GOOD)
                .imageUrl(request.getImageUrl())
                .categoryId(request.getCategoryId())
                .sellerId(sellerId)
                .status(ProductStatus.ACTIVE)
                .build();

        Product saved = productRepository.save(product);
        return mapToResponseDto(saved);
    }

    @Transactional
    public ProductResponseDto updateProduct(Long id, ProductRequestDto request, String requesterId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // Only the owner can update
        if (!product.getSellerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to update this product");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            product.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getStock() != null) {
            product.setStock(request.getStock());
        }
        if (request.getCondition() != null) {
            product.setCondition(request.getCondition());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
        if (request.getCategoryId() != null) {
            if (!categoryRepository.existsById(request.getCategoryId())) {
                throw new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId());
            }
            product.setCategoryId(request.getCategoryId());
        }

        Product saved = productRepository.save(product);
        return mapToResponseDto(saved);
    }

    @Transactional
    public void deleteProduct(Long id, String requesterId, boolean isAdmin) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // Admins can always remove; owners can remove their own
        if (!isAdmin && !product.getSellerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to remove this product");
        }

        product.setStatus(ProductStatus.REMOVED);
        productRepository.save(product);
    }

    private void validateProductRequest(ProductRequestDto request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new NexoraException("Product title cannot be empty");
        }
        if (request.getPrice() == null || request.getPrice().signum() <= 0) {
            throw new NexoraException("Product price must be greater than zero");
        }
        if (request.getCategoryId() == null) {
            throw new NexoraException("Category ID must be specified");
        }
    }

    ProductResponseDto mapToResponseDto(Product product) {
        // Resolve category name
        String categoryName = categoryRepository.findById(product.getCategoryId())
                .map(Category::getName)
                .orElse("Unknown");

        // Compute review stats
        List<com.nexora.marketplace.entity.Review> reviews =
                reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        double avgRating = reviews.stream()
                .mapToInt(com.nexora.marketplace.entity.Review::getRating)
                .average()
                .orElse(0.0);

        return ProductResponseDto.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .condition(product.getCondition())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategoryId())
                .categoryName(categoryName)
                .sellerId(product.getSellerId())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .reviewCount((long) reviews.size())
                .build();
    }
}
