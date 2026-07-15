package com.nexora.marketplace.controller;

import com.nexora.marketplace.dto.ProductRequestDto;
import com.nexora.marketplace.dto.ProductResponseDto;
import com.nexora.marketplace.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace/products")
@RequiredArgsConstructor
// // @CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    /** Browse all active listings */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProductResponseDto>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId) {

        if (categoryId != null) {
            return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
        }
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(productService.searchProducts(search));
        }
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    /** Get single product details */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProductResponseDto> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /** Get the authenticated user's own listings */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<List<ProductResponseDto>> getMyProducts(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(productService.getMyProducts(userId));
    }

    /** Create a new product listing */
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT')")
    public ResponseEntity<ProductResponseDto> createProduct(
            @RequestBody ProductRequestDto request,
            Authentication authentication) {
        String sellerId = authentication.getName();
        ProductResponseDto created = productService.createProduct(request, sellerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /** Update an existing listing (owner only) */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<ProductResponseDto> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequestDto request,
            Authentication authentication) {
        String requesterId = authentication.getName();
        return ResponseEntity.ok(productService.updateProduct(id, request, requesterId));
    }

    /** Soft-delete a product (owner or admin) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        productService.deleteProduct(id, requesterId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}
