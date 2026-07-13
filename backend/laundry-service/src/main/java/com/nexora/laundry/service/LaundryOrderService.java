package com.nexora.laundry.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.laundry.dto.LaundryOrderRequestDto;
import com.nexora.laundry.dto.LaundryOrderResponseDto;
import com.nexora.laundry.entity.LaundryOrder;
import com.nexora.laundry.entity.LaundryOrderStatus;
import com.nexora.laundry.entity.Slot;
import com.nexora.laundry.repository.LaundryOrderRepository;
import com.nexora.laundry.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LaundryOrderService {

    private final LaundryOrderRepository laundryOrderRepository;
    private final SlotRepository slotRepository;

    @Transactional
    public LaundryOrderResponseDto placeOrder(LaundryOrderRequestDto request, String customerId) {
        if (request.getSlotId() == null) {
            throw new NexoraException("Laundry slot ID is required");
        }
        if (request.getLaundryType() == null || request.getLaundryType().isBlank()) {
            throw new NexoraException("Laundry type is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new NexoraException("Laundry order amount must be a positive value");
        }

        Slot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Laundry slot not found with ID: " + request.getSlotId()));

        if (!slot.isActive()) {
            throw new NexoraException("Selected laundry slot is inactive");
        }

        if (slot.getBookedCount() >= slot.getMaxCapacity()) {
            throw new NexoraException("Selected laundry slot is fully booked");
        }

        // Increment booked count
        slot.setBookedCount(slot.getBookedCount() + 1);
        slotRepository.save(slot);

        LaundryOrder laundryOrder = LaundryOrder.builder()
                .customerId(customerId)
                .slotId(slot.getId())
                .status(LaundryOrderStatus.PENDING)
                .amount(request.getAmount())
                .paymentReference(request.getPaymentReference())
                .weightKg(request.getWeightKg() != null ? request.getWeightKg() : 0.0)
                .laundryType(request.getLaundryType())
                .specialInstructions(request.getSpecialInstructions())
                .build();

        LaundryOrder saved = laundryOrderRepository.save(laundryOrder);
        return mapToResponseDto(saved, slot.getLabel());
    }

    @Transactional(readOnly = true)
    public List<LaundryOrderResponseDto> getCustomerOrders(String customerId) {
        return laundryOrderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToResponseDtoWithLookup)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LaundryOrderResponseDto> getAllOrders() {
        return laundryOrderRepository.findAll()
                .stream()
                .map(this::mapToResponseDtoWithLookup)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LaundryOrderResponseDto getOrderById(Long id, String requesterId, boolean isAdmin, List<String> roles) {
        LaundryOrder order = laundryOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laundry order not found with ID: " + id));

        boolean isCustomer = order.getCustomerId().equals(requesterId);
        boolean isMerchantOrAdmin = isAdmin || roles.contains("ROLE_MERCHANT") || roles.contains("ROLE_ADMIN");

        if (!isCustomer && !isMerchantOrAdmin) {
            throw new NexoraException("You are not authorized to view this laundry order");
        }

        return mapToResponseDtoWithLookup(order);
    }

    @Transactional
    public LaundryOrderResponseDto updateOrderStatus(Long id, String newStatus, String requesterId, boolean isAdmin, List<String> roles) {
        LaundryOrder order = laundryOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laundry order not found with ID: " + id));

        LaundryOrderStatus targetStatus;
        try {
            targetStatus = LaundryOrderStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new NexoraException("Invalid order status: " + newStatus);
        }

        boolean isCustomer = order.getCustomerId().equals(requesterId);
        boolean isMerchantOrAdmin = isAdmin || roles.contains("ROLE_MERCHANT") || roles.contains("ROLE_ADMIN");

        if (!isCustomer && !isMerchantOrAdmin) {
            throw new NexoraException("You are not authorized to update this laundry order");
        }

        // Customer can only cancel pending order
        if (isCustomer && !isMerchantOrAdmin) {
            if (targetStatus != LaundryOrderStatus.CANCELLED) {
                throw new NexoraException("Customers can only cancel laundry orders");
            }
            if (order.getStatus() != LaundryOrderStatus.PENDING) {
                throw new NexoraException("Laundry orders can only be cancelled while they are PENDING");
            }
        }

        // Operator/Merchant/Admin validations
        if (isMerchantOrAdmin) {
            if (order.getStatus() == LaundryOrderStatus.COMPLETED || order.getStatus() == LaundryOrderStatus.CANCELLED) {
                throw new NexoraException("Cannot update status of an already completed or cancelled laundry order");
            }
        }

        // If status changes to CANCELLED and it was not previously completed/cancelled, decrement slot bookedCount
        if (targetStatus == LaundryOrderStatus.CANCELLED && order.getStatus() != LaundryOrderStatus.CANCELLED && order.getStatus() != LaundryOrderStatus.COMPLETED) {
            Slot slot = slotRepository.findById(order.getSlotId()).orElse(null);
            if (slot != null && slot.getBookedCount() > 0) {
                slot.setBookedCount(slot.getBookedCount() - 1);
                slotRepository.save(slot);
            }
        }

        order.setStatus(targetStatus);
        LaundryOrder saved = laundryOrderRepository.save(order);
        return mapToResponseDtoWithLookup(saved);
    }

    private LaundryOrderResponseDto mapToResponseDtoWithLookup(LaundryOrder order) {
        String slotLabel = slotRepository.findById(order.getSlotId())
                .map(Slot::getLabel)
                .orElse("Deleted Slot");
        return mapToResponseDto(order, slotLabel);
    }

    private LaundryOrderResponseDto mapToResponseDto(LaundryOrder order, String slotLabel) {
        return LaundryOrderResponseDto.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .slotId(order.getSlotId())
                .slotLabel(slotLabel)
                .status(order.getStatus())
                .amount(order.getAmount())
                .paymentReference(order.getPaymentReference())
                .weightKg(order.getWeightKg())
                .laundryType(order.getLaundryType())
                .specialInstructions(order.getSpecialInstructions())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
