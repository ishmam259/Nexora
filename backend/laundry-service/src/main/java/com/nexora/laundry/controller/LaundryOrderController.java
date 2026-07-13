package com.nexora.laundry.controller;

import com.nexora.laundry.dto.LaundryOrderRequestDto;
import com.nexora.laundry.dto.LaundryOrderResponseDto;
import com.nexora.laundry.service.LaundryOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/laundry/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LaundryOrderController {

    private final LaundryOrderService laundryOrderService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LaundryOrderResponseDto> placeOrder(
            @RequestBody LaundryOrderRequestDto request,
            Authentication authentication) {
        String customerId = authentication.getName();
        LaundryOrderResponseDto response = laundryOrderService.placeOrder(request, customerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/customer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LaundryOrderResponseDto>> getCustomerOrders(Authentication authentication) {
        String customerId = authentication.getName();
        return ResponseEntity.ok(laundryOrderService.getCustomerOrders(customerId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MERCHANT', 'ADMIN')")
    public ResponseEntity<List<LaundryOrderResponseDto>> getAllOrders() {
        return ResponseEntity.ok(laundryOrderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LaundryOrderResponseDto> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        return ResponseEntity.ok(laundryOrderService.getOrderById(id, requesterId, isAdmin, roles));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LaundryOrderResponseDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        return ResponseEntity.ok(laundryOrderService.updateOrderStatus(id, status, requesterId, isAdmin, roles));
    }
}
