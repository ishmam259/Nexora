package com.nexora.print.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.print.dto.PrintOrderRequestDto;
import com.nexora.print.dto.PrintOrderResponseDto;
import com.nexora.print.entity.PrintOrder;
import com.nexora.print.entity.PrintOrderStatus;
import com.nexora.print.repository.PrintOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrintOrderService {

    private final PrintOrderRepository printOrderRepository;

    @Transactional
    public PrintOrderResponseDto placeOrder(PrintOrderRequestDto request, String customerId) {
        if (request.getFileName() == null || request.getFileName().isBlank()) {
            throw new NexoraException("File name is required");
        }
        if (request.getFileUrl() == null || request.getFileUrl().isBlank()) {
            throw new NexoraException("File URL is required");
        }
        if (request.getPageCount() == null || request.getPageCount() <= 0) {
            throw new NexoraException("Page count must be greater than zero");
        }

        int copies = request.getCopies() != null && request.getCopies() > 0 ? request.getCopies() : 1;
        boolean color = request.getColor() != null && request.getColor();
        boolean doubleSided = request.getDoubleSided() != null && request.getDoubleSided();

        // Calculate amount dynamically
        BigDecimal ratePerPage = color ? BigDecimal.valueOf(0.50) : BigDecimal.valueOf(0.10);
        BigDecimal pageMultiplier = doubleSided ? BigDecimal.valueOf(0.80) : BigDecimal.valueOf(1.00);
        BigDecimal basePrice = BigDecimal.valueOf(1.00); // base service fee

        BigDecimal calculatedAmount = ratePerPage
                .multiply(BigDecimal.valueOf(request.getPageCount()))
                .multiply(pageMultiplier)
                .multiply(BigDecimal.valueOf(copies))
                .add(basePrice)
                .setScale(2, RoundingMode.HALF_UP);

        PrintOrder printOrder = PrintOrder.builder()
                .customerId(customerId)
                .fileName(request.getFileName())
                .fileUrl(request.getFileUrl())
                .pageCount(request.getPageCount())
                .color(color)
                .doubleSided(doubleSided)
                .copies(copies)
                .amount(calculatedAmount)
                .status(PrintOrderStatus.PENDING)
                .paymentReference(request.getPaymentReference())
                .customerNote(request.getCustomerNote())
                .build();

        PrintOrder saved = printOrderRepository.save(printOrder);
        return mapToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PrintOrderResponseDto> getCustomerOrders(String customerId) {
        return printOrderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PrintOrderResponseDto> getAllOrders() {
        return printOrderRepository.findAll()
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PrintOrderResponseDto getOrderById(Long id, String requesterId, boolean isAdmin, List<String> roles) {
        PrintOrder order = printOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Print order not found with ID: " + id));

        boolean isCustomer = order.getCustomerId().equals(requesterId);
        boolean isMerchantOrAdmin = isAdmin || roles.contains("ROLE_MERCHANT") || roles.contains("ROLE_ADMIN");

        if (!isCustomer && !isMerchantOrAdmin) {
            throw new NexoraException("You are not authorized to view this print order");
        }

        return mapToResponseDto(order);
    }

    @Transactional
    public PrintOrderResponseDto updateOrderStatus(Long id, String newStatus, String requesterId, boolean isAdmin, List<String> roles) {
        PrintOrder order = printOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Print order not found with ID: " + id));

        PrintOrderStatus targetStatus;
        try {
            targetStatus = PrintOrderStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new NexoraException("Invalid order status: " + newStatus);
        }

        boolean isCustomer = order.getCustomerId().equals(requesterId);
        boolean isMerchantOrAdmin = isAdmin || roles.contains("ROLE_MERCHANT") || roles.contains("ROLE_ADMIN");

        if (!isCustomer && !isMerchantOrAdmin) {
            throw new NexoraException("You are not authorized to update this print order");
        }

        // Customer can only cancel pending order
        if (isCustomer && !isMerchantOrAdmin) {
            if (targetStatus != PrintOrderStatus.CANCELLED) {
                throw new NexoraException("Customers can only cancel print orders");
            }
            if (order.getStatus() != PrintOrderStatus.PENDING) {
                throw new NexoraException("Print orders can only be cancelled while they are PENDING");
            }
        }

        // Merchant or Admin validations
        if (isMerchantOrAdmin) {
            if (order.getStatus() == PrintOrderStatus.COMPLETED || order.getStatus() == PrintOrderStatus.CANCELLED) {
                throw new NexoraException("Cannot update status of an already completed or cancelled print order");
            }
        }

        order.setStatus(targetStatus);
        PrintOrder saved = printOrderRepository.save(order);
        return mapToResponseDto(saved);
    }

    private PrintOrderResponseDto mapToResponseDto(PrintOrder order) {
        return PrintOrderResponseDto.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .fileName(order.getFileName())
                .fileUrl(order.getFileUrl())
                .pageCount(order.getPageCount())
                .color(order.isColor())
                .doubleSided(order.isDoubleSided())
                .copies(order.getCopies())
                .amount(order.getAmount())
                .status(order.getStatus())
                .paymentReference(order.getPaymentReference())
                .customerNote(order.getCustomerNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
