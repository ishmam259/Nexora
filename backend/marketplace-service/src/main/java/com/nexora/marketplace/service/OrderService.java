package com.nexora.marketplace.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.marketplace.dto.OrderResponseDto;
import com.nexora.marketplace.dto.PayOrderRequestDto;
import com.nexora.marketplace.entity.*;
import com.nexora.marketplace.repository.BidRepository;
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
    private final BidRepository bidRepository;
    private final ProductService productService;

    /**
     * Seller accepts the current highest bid → creates an order awaiting buyer payment.
     */
    @Transactional
    public OrderResponseDto acceptHighestBid(Long productId, String sellerId) {
        Product product = productService.requireProduct(productId);
        product = productService.refreshEndedStatus(product);

        if (!product.getSellerId().equals(sellerId)) {
            throw new NexoraException("Only the seller can accept a bid");
        }
        if (product.getStatus() == ProductStatus.SOLD || product.getStatus() == ProductStatus.REMOVED) {
            throw new NexoraException("This listing is no longer available");
        }
        if (product.getCurrentBid() == null || product.getCurrentBidderId() == null) {
            throw new NexoraException("No bids to accept yet");
        }

        Bid winningBid = bidRepository.findFirstByProductIdOrderByAmountDescCreatedAtAsc(productId)
                .orElseThrow(() -> new NexoraException("No bids to accept yet"));

        Order order = Order.builder()
                .productId(product.getId())
                .buyerId(winningBid.getBidderId())
                .sellerId(product.getSellerId())
                .winningBidId(winningBid.getId())
                .amount(winningBid.getAmount())
                .status(OrderStatus.AWAITING_PAYMENT)
                .build();

        product.setStatus(ProductStatus.SOLD);
        productRepository.save(product);

        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public OrderResponseDto payOrder(Long orderId, PayOrderRequestDto request, String buyerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getBuyerId().equals(buyerId)) {
            throw new NexoraException("Only the winning bidder can pay for this order");
        }
        if (order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
            throw new NexoraException("This order is not awaiting payment");
        }
        if (request.getPaymentReference() == null || request.getPaymentReference().isBlank()) {
            throw new NexoraException("Payment reference is required");
        }

        order.setPaymentReference(request.getPaymentReference().trim());
        order.setStatus(OrderStatus.PAID);
        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public OrderResponseDto completeOrder(Long orderId, String requesterId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!isAdmin && !order.getSellerId().equals(requesterId)) {
            throw new NexoraException("Only the seller can mark the order as completed");
        }
        if (order.getStatus() != OrderStatus.PAID) {
            throw new NexoraException("Order must be paid before it can be completed");
        }

        order.setStatus(OrderStatus.COMPLETED);
        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public OrderResponseDto cancelOrder(Long orderId, String requesterId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        boolean allowed = isAdmin
                || order.getSellerId().equals(requesterId)
                || order.getBuyerId().equals(requesterId);
        if (!allowed) {
            throw new NexoraException("You are not authorized to cancel this order");
        }
        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new NexoraException("This order cannot be cancelled");
        }
        if (order.getStatus() == OrderStatus.PAID && !isAdmin && !order.getSellerId().equals(requesterId)) {
            throw new NexoraException("Paid orders can only be cancelled by the seller or an admin");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Product product = productService.requireProduct(order.getProductId());
        if (product.getStatus() == ProductStatus.SOLD) {
            product.setStatus(ProductStatus.ENDED);
            productRepository.save(product);
        }
        return mapToDto(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMyPurchases(String buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMySales(String sellerId) {
        return orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrder(Long id, String requesterId, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        if (!isAdmin && !order.getBuyerId().equals(requesterId) && !order.getSellerId().equals(requesterId)) {
            throw new NexoraException("You are not authorized to view this order");
        }
        return mapToDto(order);
    }

    private OrderResponseDto mapToDto(Order order) {
        String title = productRepository.findById(order.getProductId())
                .map(Product::getTitle)
                .orElse("Unknown listing");

        return OrderResponseDto.builder()
                .id(order.getId())
                .productId(order.getProductId())
                .productTitle(title)
                .buyerId(order.getBuyerId())
                .sellerId(order.getSellerId())
                .winningBidId(order.getWinningBidId())
                .amount(order.getAmount())
                .status(order.getStatus())
                .paymentReference(order.getPaymentReference())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
