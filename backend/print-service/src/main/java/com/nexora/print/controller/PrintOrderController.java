package com.nexora.print.controller;

import com.nexora.print.dto.PrintOrderRequestDto;
import com.nexora.print.dto.PrintOrderResponseDto;
import com.nexora.print.service.PrintOrderService;
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
@RequestMapping("/api/print/orders")
@RequiredArgsConstructor
// // @CrossOrigin(origins = "*")
public class PrintOrderController {

    private final PrintOrderService printOrderService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PrintOrderResponseDto> placeOrder(
            @RequestBody PrintOrderRequestDto request,
            Authentication authentication) {
        String customerId = authentication.getName();
        PrintOrderResponseDto response = printOrderService.placeOrder(request, customerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/customer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PrintOrderResponseDto>> getCustomerOrders(Authentication authentication) {
        String customerId = authentication.getName();
        return ResponseEntity.ok(printOrderService.getCustomerOrders(customerId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MERCHANT', 'ADMIN')")
    public ResponseEntity<List<PrintOrderResponseDto>> getAllOrders() {
        return ResponseEntity.ok(printOrderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PrintOrderResponseDto> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        return ResponseEntity.ok(printOrderService.getOrderById(id, requesterId, isAdmin, roles));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PrintOrderResponseDto> updateOrderStatus(
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
        return ResponseEntity.ok(printOrderService.updateOrderStatus(id, status, requesterId, isAdmin, roles));
    }
}
