package com.nexora.food.controller;

import com.nexora.food.dto.FoodOrderRequestDto;
import com.nexora.food.dto.FoodOrderResponseDto;
import com.nexora.food.service.FoodOrderService;
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
@RequestMapping("/api/food/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FoodOrderController {

    private final FoodOrderService foodOrderService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FoodOrderResponseDto> placeOrder(
            @RequestBody FoodOrderRequestDto request,
            Authentication authentication) {
        String customerId = authentication.getName();
        FoodOrderResponseDto response = foodOrderService.placeOrder(request, customerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/customer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FoodOrderResponseDto>> getCustomerOrders(Authentication authentication) {
        String customerId = authentication.getName();
        return ResponseEntity.ok(foodOrderService.getCustomerOrders(customerId));
    }

    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<List<FoodOrderResponseDto>> getRestaurantOrders(
            @PathVariable Long restaurantId,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        return ResponseEntity.ok(foodOrderService.getRestaurantOrders(restaurantId, requesterId, isAdmin));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FoodOrderResponseDto> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        return ResponseEntity.ok(foodOrderService.getOrderById(id, requesterId, isAdmin, roles));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FoodOrderResponseDto> updateOrderStatus(
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
        return ResponseEntity.ok(foodOrderService.updateOrderStatus(id, status, requesterId, isAdmin, roles));
    }
}
