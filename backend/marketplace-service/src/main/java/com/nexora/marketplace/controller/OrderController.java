package com.nexora.marketplace.controller;

import com.nexora.marketplace.dto.OrderResponseDto;
import com.nexora.marketplace.dto.PayOrderRequestDto;
import com.nexora.marketplace.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** Seller accepts the highest bid on a listing. */
    @PostMapping("/accept/{productId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT')")
    public ResponseEntity<OrderResponseDto> acceptHighestBid(
            @PathVariable Long productId,
            Authentication authentication) {
        OrderResponseDto response = orderService.acceptHighestBid(productId, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /** Winning bidder pays for an accepted bid. */
    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT')")
    public ResponseEntity<OrderResponseDto> payOrder(
            @PathVariable Long id,
            @RequestBody PayOrderRequestDto request,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.payOrder(id, request, authentication.getName()));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<OrderResponseDto> completeOrder(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.completeOrder(id, authentication.getName(), hasRole(authentication, "ROLE_ADMIN")));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<OrderResponseDto> cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.cancelOrder(id, authentication.getName(), hasRole(authentication, "ROLE_ADMIN")));
    }

    @GetMapping("/my-purchases")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<List<OrderResponseDto>> getMyPurchases(Authentication authentication) {
        return ResponseEntity.ok(orderService.getMyPurchases(authentication.getName()));
    }

    @GetMapping("/my-sales")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<List<OrderResponseDto>> getMySales(Authentication authentication) {
        return ResponseEntity.ok(orderService.getMySales(authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponseDto> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrder(id, authentication.getName(), hasRole(authentication, "ROLE_ADMIN")));
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals(role));
    }
}
