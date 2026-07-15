package com.nexora.food.controller;

import com.nexora.food.dto.RestaurantRequestDto;
import com.nexora.food.dto.RestaurantResponseDto;
import com.nexora.food.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food/restaurants")
@RequiredArgsConstructor
// // @CrossOrigin(origins = "*")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RestaurantResponseDto>> getAllRestaurants(
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(restaurantService.searchRestaurants(search));
        }
        return ResponseEntity.ok(restaurantService.getAllActiveRestaurants());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RestaurantResponseDto> getRestaurantById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<List<RestaurantResponseDto>> getMyRestaurants(Authentication authentication) {
        String ownerId = authentication.getName();
        return ResponseEntity.ok(restaurantService.getMyRestaurants(ownerId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<RestaurantResponseDto> createRestaurant(
            @RequestBody RestaurantRequestDto request,
            Authentication authentication) {
        String ownerId = authentication.getName();
        RestaurantResponseDto created = restaurantService.createRestaurant(request, ownerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<RestaurantResponseDto> updateRestaurant(
            @PathVariable Long id,
            @RequestBody RestaurantRequestDto request,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        return ResponseEntity.ok(restaurantService.updateRestaurant(id, request, requesterId, isAdmin));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteRestaurant(
            @PathVariable Long id,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        restaurantService.deleteRestaurant(id, requesterId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}
