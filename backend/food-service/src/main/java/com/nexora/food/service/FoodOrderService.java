package com.nexora.food.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.food.dto.FoodOrderItemRequestDto;
import com.nexora.food.dto.FoodOrderItemResponseDto;
import com.nexora.food.dto.FoodOrderRequestDto;
import com.nexora.food.dto.FoodOrderResponseDto;
import com.nexora.food.entity.FoodOrder;
import com.nexora.food.entity.FoodOrderItem;
import com.nexora.food.entity.FoodOrderStatus;
import com.nexora.food.entity.MenuItem;
import com.nexora.food.entity.Restaurant;
import com.nexora.food.repository.FoodOrderRepository;
import com.nexora.food.repository.MenuItemRepository;
import com.nexora.food.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodOrderService {

    private final FoodOrderRepository foodOrderRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @Transactional
    public FoodOrderResponseDto placeOrder(FoodOrderRequestDto request, String customerId) {
        if (request.getRestaurantId() == null) {
            throw new NexoraException("Restaurant ID is required");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new NexoraException("Order must contain at least one item");
        }
        if (request.getDeliveryAddress() == null || request.getDeliveryAddress().isBlank()) {
            throw new NexoraException("Delivery address is required");
        }

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + request.getRestaurantId()));

        if (!restaurant.isActive()) {
            throw new NexoraException("Restaurant is currently closed or inactive");
        }

        if (restaurant.getOwnerId().equals(customerId)) {
            throw new NexoraException("Restaurant owners cannot place orders from their own restaurants");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<FoodOrderItem> orderItems = new ArrayList<>();

        FoodOrder foodOrder = FoodOrder.builder()
                .restaurantId(restaurant.getId())
                .customerId(customerId)
                .deliveryAddress(request.getDeliveryAddress())
                .customerNote(request.getCustomerNote())
                .paymentReference(request.getPaymentReference())
                .status(FoodOrderStatus.PENDING)
                .build();

        for (FoodOrderItemRequestDto itemDto : request.getItems()) {
            if (itemDto.getMenuItemId() == null) {
                throw new NexoraException("Menu item ID is required");
            }
            int qty = itemDto.getQuantity() != null && itemDto.getQuantity() > 0 ? itemDto.getQuantity() : 1;

            MenuItem menuItem = menuItemRepository.findById(itemDto.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + itemDto.getMenuItemId()));

            if (!menuItem.getRestaurantId().equals(restaurant.getId())) {
                throw new NexoraException("Menu item '" + menuItem.getName() + "' does not belong to the selected restaurant");
            }

            if (!menuItem.isAvailable()) {
                throw new NexoraException("Menu item '" + menuItem.getName() + "' is currently unavailable");
            }

            BigDecimal itemTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(qty));
            totalAmount = totalAmount.add(itemTotal);

            FoodOrderItem orderItem = FoodOrderItem.builder()
                    .foodOrder(foodOrder)
                    .menuItemId(menuItem.getId())
                    .menuItemName(menuItem.getName())
                    .price(menuItem.getPrice())
                    .quantity(qty)
                    .build();

            orderItems.add(orderItem);
        }

        foodOrder.setAmount(totalAmount);
        foodOrder.setItems(orderItems);

        FoodOrder saved = foodOrderRepository.save(foodOrder);
        return mapToResponseDto(saved, restaurant.getName());
    }

    @Transactional(readOnly = true)
    public List<FoodOrderResponseDto> getCustomerOrders(String customerId) {
        return foodOrderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToResponseDtoWithLookup)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FoodOrderResponseDto> getRestaurantOrders(Long restaurantId, String requesterId, boolean isAdmin) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId));

        if (!isAdmin && !restaurant.getOwnerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to view orders for this restaurant");
        }

        return foodOrderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream()
                .map(o -> mapToResponseDto(o, restaurant.getName()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FoodOrderResponseDto getOrderById(Long id, String requesterId, boolean isAdmin, List<String> roles) {
        FoodOrder order = foodOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        Restaurant restaurant = restaurantRepository.findById(order.getRestaurantId()).orElse(null);
        String restaurantOwnerId = restaurant != null ? restaurant.getOwnerId() : "";

        boolean isCustomer = order.getCustomerId().equals(requesterId);
        boolean isRestaurantOwner = restaurantOwnerId.equals(requesterId);
        boolean isDeliveryAgent = roles.contains("ROLE_DELIVERY_AGENT");

        if (!isAdmin && !isCustomer && !isRestaurantOwner && !isDeliveryAgent) {
            throw new NexoraException("You are not authorized to view this order");
        }

        String restaurantName = restaurant != null ? restaurant.getName() : "Deleted Restaurant";
        return mapToResponseDto(order, restaurantName);
    }

    @Transactional
    public FoodOrderResponseDto updateOrderStatus(Long id, String newStatus, String requesterId, boolean isAdmin, List<String> roles) {
        FoodOrder order = foodOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        Restaurant restaurant = restaurantRepository.findById(order.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found for this order"));

        FoodOrderStatus targetStatus;
        try {
            targetStatus = FoodOrderStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new NexoraException("Invalid order status: " + newStatus);
        }

        boolean isCustomer = order.getCustomerId().equals(requesterId);
        boolean isRestaurantOwner = restaurant.getOwnerId().equals(requesterId);
        boolean isDeliveryAgent = roles.contains("ROLE_DELIVERY_AGENT");

        if (!isAdmin && !isCustomer && !isRestaurantOwner && !isDeliveryAgent) {
            throw new NexoraException("You are not authorized to update this order");
        }

        // Customer can only cancel their own pending order
        if (isCustomer && !isAdmin && !isRestaurantOwner) {
            if (targetStatus != FoodOrderStatus.CANCELLED) {
                throw new NexoraException("Customers can only cancel orders");
            }
            if (order.getStatus() != FoodOrderStatus.PENDING) {
                throw new NexoraException("Orders can only be cancelled while they are PENDING");
            }
        }

        // Restaurant owner or Admin can change PENDING -> CONFIRMED -> PREPARING -> COMPLETED
        if (isRestaurantOwner || isAdmin) {
            // Cannot modify a completed or cancelled order
            if (order.getStatus() == FoodOrderStatus.COMPLETED || order.getStatus() == FoodOrderStatus.CANCELLED) {
                throw new NexoraException("Cannot update status of an already completed or cancelled order");
            }
        }

        // Delivery Agent can update OUT_FOR_DELIVERY -> COMPLETED
        if (isDeliveryAgent && !isAdmin && !isRestaurantOwner) {
            if (targetStatus != FoodOrderStatus.OUT_FOR_DELIVERY && targetStatus != FoodOrderStatus.COMPLETED) {
                throw new NexoraException("Delivery agents can only update status to OUT_FOR_DELIVERY or COMPLETED");
            }
        }

        order.setStatus(targetStatus);
        FoodOrder saved = foodOrderRepository.save(order);
        return mapToResponseDto(saved, restaurant.getName());
    }

    private FoodOrderResponseDto mapToResponseDtoWithLookup(FoodOrder order) {
        String restaurantName = restaurantRepository.findById(order.getRestaurantId())
                .map(Restaurant::getName)
                .orElse("Deleted Restaurant");
        return mapToResponseDto(order, restaurantName);
    }

    private FoodOrderResponseDto mapToResponseDto(FoodOrder order, String restaurantName) {
        List<FoodOrderItemResponseDto> itemDtos = order.getItems().stream()
                .map(item -> FoodOrderItemResponseDto.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItemId())
                        .menuItemName(item.getMenuItemName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        return FoodOrderResponseDto.builder()
                .id(order.getId())
                .restaurantId(order.getRestaurantId())
                .restaurantName(restaurantName)
                .customerId(order.getCustomerId())
                .amount(order.getAmount())
                .status(order.getStatus())
                .paymentReference(order.getPaymentReference())
                .deliveryAddress(order.getDeliveryAddress())
                .customerNote(order.getCustomerNote())
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
