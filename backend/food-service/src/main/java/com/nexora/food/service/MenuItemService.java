package com.nexora.food.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.food.dto.MenuItemRequestDto;
import com.nexora.food.dto.MenuItemResponseDto;
import com.nexora.food.entity.MenuItem;
import com.nexora.food.entity.Restaurant;
import com.nexora.food.repository.MenuItemRepository;
import com.nexora.food.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional(readOnly = true)
    public List<MenuItemResponseDto> getMenuItems(Long restaurantId) {
        // Ensure restaurant exists
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId);
        }
        return menuItemRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponseDto> getAvailableMenuItems(Long restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId);
        }
        return menuItemRepository.findByRestaurantIdAndAvailable(restaurantId, true)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuItemResponseDto getMenuItemById(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + id));
        return mapToResponseDto(item);
    }

    @Transactional
    public MenuItemResponseDto createMenuItem(Long restaurantId, MenuItemRequestDto request, String ownerId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId));

        if (!restaurant.getOwnerId().equals(ownerId)) {
            throw new NexoraException("You are not the owner of this restaurant");
        }

        if (request.getName() == null || request.getName().isBlank()) {
            throw new NexoraException("Menu item name is required");
        }
        if (request.getPrice() == null || request.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new NexoraException("Menu item price must be a positive value");
        }
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            throw new NexoraException("Menu item category is required");
        }

        MenuItem item = MenuItem.builder()
                .restaurantId(restaurantId)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .category(request.getCategory())
                .build();

        MenuItem saved = menuItemRepository.save(item);
        return mapToResponseDto(saved);
    }

    @Transactional
    public MenuItemResponseDto updateMenuItem(Long id, MenuItemRequestDto request, String requesterId, boolean isAdmin) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + id));

        Restaurant restaurant = restaurantRepository.findById(item.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + item.getRestaurantId()));

        if (!isAdmin && !restaurant.getOwnerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to update menu items in this restaurant");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            item.setName(request.getName());
        }
        if (request.getDescription() != null) {
            item.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            if (request.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new NexoraException("Price must be a positive value");
            }
            item.setPrice(request.getPrice());
        }
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl());
        }
        if (request.getAvailable() != null) {
            item.setAvailable(request.getAvailable());
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            item.setCategory(request.getCategory());
        }

        MenuItem updated = menuItemRepository.save(item);
        return mapToResponseDto(updated);
    }

    @Transactional
    public void deleteMenuItem(Long id, String requesterId, boolean isAdmin) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + id));

        Restaurant restaurant = restaurantRepository.findById(item.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + item.getRestaurantId()));

        if (!isAdmin && !restaurant.getOwnerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to delete menu items in this restaurant");
        }

        menuItemRepository.delete(item);
    }

    private MenuItemResponseDto mapToResponseDto(MenuItem item) {
        return MenuItemResponseDto.builder()
                .id(item.getId())
                .restaurantId(item.getRestaurantId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .available(item.isAvailable())
                .category(item.getCategory())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
