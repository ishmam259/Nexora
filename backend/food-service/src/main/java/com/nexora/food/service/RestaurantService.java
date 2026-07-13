package com.nexora.food.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.food.dto.RestaurantRequestDto;
import com.nexora.food.dto.RestaurantResponseDto;
import com.nexora.food.entity.Restaurant;
import com.nexora.food.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    @Transactional(readOnly = true)
    public List<RestaurantResponseDto> getAllActiveRestaurants() {
        return restaurantRepository.findByActive(true)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponseDto> searchRestaurants(String name) {
        return restaurantRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .filter(Restaurant::isActive)
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RestaurantResponseDto getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + id));
        return mapToResponseDto(restaurant);
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponseDto> getMyRestaurants(String ownerId) {
        return restaurantRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RestaurantResponseDto createRestaurant(RestaurantRequestDto request, String ownerId) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new NexoraException("Restaurant name is required");
        }
        if (request.getAddress() == null || request.getAddress().isBlank()) {
            throw new NexoraException("Restaurant address is required");
        }
        if (request.getContactNumber() == null || request.getContactNumber().isBlank()) {
            throw new NexoraException("Restaurant contact number is required");
        }

        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .contactNumber(request.getContactNumber())
                .imageUrl(request.getImageUrl())
                .ownerId(ownerId)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Restaurant saved = restaurantRepository.save(restaurant);
        return mapToResponseDto(saved);
    }

    @Transactional
    public RestaurantResponseDto updateRestaurant(Long id, RestaurantRequestDto request, String requesterId, boolean isAdmin) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + id));

        if (!isAdmin && !restaurant.getOwnerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to update this restaurant");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            restaurant.setName(request.getName());
        }
        if (request.getDescription() != null) {
            restaurant.setDescription(request.getDescription());
        }
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            restaurant.setAddress(request.getAddress());
        }
        if (request.getContactNumber() != null && !request.getContactNumber().isBlank()) {
            restaurant.setContactNumber(request.getContactNumber());
        }
        if (request.getImageUrl() != null) {
            restaurant.setImageUrl(request.getImageUrl());
        }
        if (request.getActive() != null) {
            restaurant.setActive(request.getActive());
        }

        Restaurant updated = restaurantRepository.save(restaurant);
        return mapToResponseDto(updated);
    }

    @Transactional
    public void deleteRestaurant(Long id, String requesterId, boolean isAdmin) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + id));

        if (!isAdmin && !restaurant.getOwnerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to delete this restaurant");
        }

        restaurantRepository.delete(restaurant);
    }

    private RestaurantResponseDto mapToResponseDto(Restaurant restaurant) {
        return RestaurantResponseDto.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .address(restaurant.getAddress())
                .contactNumber(restaurant.getContactNumber())
                .imageUrl(restaurant.getImageUrl())
                .ownerId(restaurant.getOwnerId())
                .active(restaurant.isActive())
                .createdAt(restaurant.getCreatedAt())
                .updatedAt(restaurant.getUpdatedAt())
                .build();
    }
}
