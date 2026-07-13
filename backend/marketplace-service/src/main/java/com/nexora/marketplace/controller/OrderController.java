package com.nexora.marketplace.controller;

import com.nexora.marketplace.dto.OrderRequestDto;
import com.nexora.marketplace.dto.OrderResponseDto;
import com.nexora.marketplace.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    /** Place an order — buyer purchases a product */
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT')")
    public ResponseEntity<OrderResponseDto> placeOrder(
            @RequestBody OrderRequestDto request,
            Authentication authentication) {
        String buyerId = authentication.getName();
        OrderResponseDto response = orderService.placeOrder(request, buyerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /** Get all orders I placed as a buyer */
    @GetMapping("/my-purchases")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<List<OrderResponseDto>> getMyPurchases(Authentication authentication) {
        String buyerId = authentication.getName();
        return ResponseEntity.ok(orderService.getMyPurchases(buyerId));
    }

    /** Get all orders I received as a seller */
    @GetMapping("/my-sales")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<List<OrderResponseDto>> getMySales(Authentication authentication) {
        String sellerId = authentication.getName();
        return ResponseEntity.ok(orderService.getMySales(sellerId));
    }

    /** Get a specific order by ID (visible to buyer, seller, or admin) */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponseDto> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        return ResponseEntity.ok(orderService.getOrderById(id, requesterId, isAdmin));
    }

    /**
     * Update order status.
     * Request body: {"status": "CONFIRMED"} — one of PENDING, CONFIRMED, COMPLETED, CANCELLED
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        String newStatus = body.get("status");
        return ResponseEntity.ok(orderService.updateOrderStatus(id, newStatus, requesterId, isAdmin));
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals(role));
    }
}
