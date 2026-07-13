package com.nexora.marketplace.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.marketplace.dto.OrderRequestDto;
import com.nexora.marketplace.dto.OrderResponseDto;
import com.nexora.marketplace.entity.Order;
import com.nexora.marketplace.entity.OrderStatus;
import com.nexora.marketplace.entity.Product;
import com.nexora.marketplace.entity.ProductStatus;
import com.nexora.marketplace.repository.OrderRepository;
import com.nexora.marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponseDto placeOrder(OrderRequestDto request, String buyerId) {
        if (request.getProductId() == null) {
            throw new NexoraException("Product ID must be specified");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new NexoraException("Product is no longer available for purchase");
        }

        // A seller cannot buy their own product
        if (product.getSellerId().equals(buyerId)) {
            throw new NexoraException("You cannot purchase your own product");
        }

        int qty = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;

        if (product.getStock() < qty) {
            throw new NexoraException("Insufficient stock. Available: " + product.getStock());
        }

        // Deduct stock; mark SOLD if stock hits zero
        product.setStock(product.getStock() - qty);
        if (product.getStock() == 0) {
            product.setStatus(ProductStatus.SOLD);
        }
        productRepository.save(product);

        Order order = Order.builder()
                .productId(product.getId())
                .buyerId(buyerId)
                .sellerId(product.getSellerId())
                .amount(product.getPrice().multiply(java.math.BigDecimal.valueOf(qty)))
                .quantity(qty)
                .status(OrderStatus.PENDING)
                .paymentReference(request.getPaymentReference())
                .buyerNote(request.getBuyerNote())
                .build();

        Order saved = orderRepository.save(order);
        return mapToResponseDto(saved, product.getTitle());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMyPurchases(String buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)
                .stream()
                .map(o -> mapToResponseDtoWithLookup(o))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMySales(String sellerId) {
        return orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
                .stream()
                .map(o -> mapToResponseDtoWithLookup(o))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(Long id, String requesterId, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        if (!isAdmin && !order.getBuyerId().equals(requesterId) && !order.getSellerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to view this order");
        }

        return mapToResponseDtoWithLookup(order);
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long id, String newStatus, String requesterId, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        OrderStatus targetStatus;
        try {
            targetStatus = OrderStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new NexoraException("Invalid order status: " + newStatus + ". Valid values: PENDING, CONFIRMED, COMPLETED, CANCELLED");
        }

        // Only seller or admin can confirm/complete orders; buyer can cancel their own pending order
        boolean isSeller = order.getSellerId().equals(requesterId);
        boolean isBuyer = order.getBuyerId().equals(requesterId);

        if (!isAdmin && !isSeller && !isBuyer) {
            throw new NexoraException("You are not authorized to update this order");
        }

        if (targetStatus == OrderStatus.CANCELLED && !isAdmin && !isBuyer) {
            throw new NexoraException("Only the buyer or admin can cancel an order");
        }

        if (targetStatus == OrderStatus.CONFIRMED || targetStatus == OrderStatus.COMPLETED) {
            if (!isAdmin && !isSeller) {
                throw new NexoraException("Only the seller or admin can confirm or complete an order");
            }
        }

        // If cancelling a PENDING/CONFIRMED order, restore stock
        if (targetStatus == OrderStatus.CANCELLED
                && (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.CONFIRMED)) {
            Product product = productRepository.findById(order.getProductId()).orElse(null);
            if (product != null) {
                product.setStock(product.getStock() + order.getQuantity());
                if (product.getStatus() == ProductStatus.SOLD) {
                    product.setStatus(ProductStatus.ACTIVE);
                }
                productRepository.save(product);
            }
        }

        order.setStatus(targetStatus);
        Order saved = orderRepository.save(order);
        return mapToResponseDtoWithLookup(saved);
    }

    private OrderResponseDto mapToResponseDtoWithLookup(Order order) {
        String productTitle = productRepository.findById(order.getProductId())
                .map(Product::getTitle)
                .orElse("Deleted Product");
        return mapToResponseDto(order, productTitle);
    }

    private OrderResponseDto mapToResponseDto(Order order, String productTitle) {
        return OrderResponseDto.builder()
                .id(order.getId())
                .productId(order.getProductId())
                .productTitle(productTitle)
                .buyerId(order.getBuyerId())
                .sellerId(order.getSellerId())
                .amount(order.getAmount())
                .quantity(order.getQuantity())
                .status(order.getStatus())
                .paymentReference(order.getPaymentReference())
                .buyerNote(order.getBuyerNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
