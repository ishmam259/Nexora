package com.nexora.food.controller;

import com.nexora.food.dto.MenuItemRequestDto;
import com.nexora.food.dto.MenuItemResponseDto;
import com.nexora.food.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
// // @CrossOrigin(origins = "*")
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping("/restaurants/{restaurantId}/menu")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MenuItemResponseDto>> getMenu(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) Boolean availableOnly) {
        if (availableOnly != null && availableOnly) {
            return ResponseEntity.ok(menuItemService.getAvailableMenuItems(restaurantId));
        }
        return ResponseEntity.ok(menuItemService.getMenuItems(restaurantId));
    }

    @PostMapping("/restaurants/{restaurantId}/menu")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<MenuItemResponseDto> createMenuItem(
            @PathVariable Long restaurantId,
            @RequestBody MenuItemRequestDto request,
            Authentication authentication) {
        String ownerId = authentication.getName();
        MenuItemResponseDto created = menuItemService.createMenuItem(restaurantId, request, ownerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/menu-items/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<MenuItemResponseDto> updateMenuItem(
            @PathVariable Long id,
            @RequestBody MenuItemRequestDto request,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        return ResponseEntity.ok(menuItemService.updateMenuItem(id, request, requesterId, isAdmin));
    }

    @DeleteMapping("/menu-items/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable Long id,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        menuItemService.deleteMenuItem(id, requesterId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}
