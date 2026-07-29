package com.nexora.marketplace.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.marketplace.dto.ProductRequestDto;
import com.nexora.marketplace.dto.ProductResponseDto;
import com.nexora.marketplace.entity.*;
import com.nexora.marketplace.repository.CategoryRepository;
import com.nexora.marketplace.repository.CommentRepository;
import com.nexora.marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CommentRepository commentRepository;

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

    @Transactional
    public ProductResponseDto getProductById(Long id) {
        Product product = requireProduct(id);
        product = refreshEndedStatus(product);
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

        int hours = request.getDurationHours() != null && request.getDurationHours() > 0
                ? Math.min(request.getDurationHours(), 24 * 30)
                : 72;

        Product product = Product.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .startingBid(request.getStartingBid())
                .price(request.getStartingBid())
                .stock(1)
                .currentBid(null)
                .currentBidderId(null)
                .bidCount(0)
                .endsAt(LocalDateTime.now().plusHours(hours))
                .condition(request.getCondition() != null ? request.getCondition() : ProductCondition.GOOD)
                .imageUrl(request.getImageUrl())
                .categoryId(request.getCategoryId())
                .sellerId(sellerId)
                .status(ProductStatus.ACTIVE)
                .build();

        return mapToResponseDto(productRepository.save(product));
    }

    @Transactional
    public ProductResponseDto updateProduct(Long id, ProductRequestDto request, String requesterId) {
        Product product = requireProduct(id);
        if (!product.getSellerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to update this listing");
        }
        if (product.getBidCount() != null && product.getBidCount() > 0) {
            throw new NexoraException("Cannot edit a listing after bids have been placed");
        }
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new NexoraException("Only active listings can be edited");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            product.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getStartingBid() != null) {
            if (request.getStartingBid().signum() <= 0) {
                throw new NexoraException("Starting bid must be greater than zero");
            }
            product.setStartingBid(request.getStartingBid());
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
        if (request.getDurationHours() != null && request.getDurationHours() > 0) {
            product.setEndsAt(LocalDateTime.now().plusHours(Math.min(request.getDurationHours(), 24 * 30)));
        }

        return mapToResponseDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id, String requesterId, boolean isAdmin) {
        Product product = requireProduct(id);
        if (!isAdmin && !product.getSellerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to remove this listing");
        }
        product.setStatus(ProductStatus.REMOVED);
        productRepository.save(product);
    }

    Product requireProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with ID: " + id));
    }

    /**
     * Lazily marks auctions ENDED when their end time has passed.
     */
    Product refreshEndedStatus(Product product) {
        if (product.getStatus() == ProductStatus.ACTIVE
                && product.getEndsAt() != null
                && !LocalDateTime.now().isBefore(product.getEndsAt())) {
            product.setStatus(ProductStatus.ENDED);
            return productRepository.save(product);
        }
        return product;
    }

    private void validateProductRequest(ProductRequestDto request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new NexoraException("Listing title cannot be empty");
        }
        if (request.getStartingBid() == null || request.getStartingBid().signum() <= 0) {
            throw new NexoraException("Starting bid must be greater than zero");
        }
        if (request.getCategoryId() == null) {
            throw new NexoraException("Category ID must be specified");
        }
    }

    ProductResponseDto mapToResponseDto(Product product) {
        String categoryName = categoryRepository.findById(product.getCategoryId())
                .map(Category::getName)
                .orElse("Unknown");

        return ProductResponseDto.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .startingBid(product.getStartingBid())
                .currentBid(product.getCurrentBid())
                .currentBidderId(product.getCurrentBidderId())
                .bidCount(product.getBidCount() != null ? product.getBidCount() : 0)
                .endsAt(product.getEndsAt())
                .biddingOpen(product.isBiddingOpen())
                .condition(product.getCondition())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategoryId())
                .categoryName(categoryName)
                .sellerId(product.getSellerId())
                .status(product.getStatus())
                .commentCount(commentRepository.countByProductId(product.getId()))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
