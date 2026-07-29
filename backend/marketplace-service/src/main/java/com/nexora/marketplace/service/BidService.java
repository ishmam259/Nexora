package com.nexora.marketplace.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.marketplace.dto.BidRequestDto;
import com.nexora.marketplace.dto.BidResponseDto;
import com.nexora.marketplace.entity.Bid;
import com.nexora.marketplace.entity.Product;
import com.nexora.marketplace.entity.ProductStatus;
import com.nexora.marketplace.repository.BidRepository;
import com.nexora.marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public List<BidResponseDto> getBidsForProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Listing not found with ID: " + productId);
        }
        return bidRepository.findByProductIdOrderByAmountDescCreatedAtAsc(productId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BidResponseDto> getMyBids(String bidderId) {
        return bidRepository.findByBidderIdOrderByCreatedAtDesc(bidderId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BidResponseDto placeBid(BidRequestDto request, String bidderId) {
        if (request.getProductId() == null) {
            throw new NexoraException("Product ID is required");
        }
        if (request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new NexoraException("Bid amount must be greater than zero");
        }

        Product product = productService.requireProduct(request.getProductId());
        product = productService.refreshEndedStatus(product);

        if (product.getSellerId().equals(bidderId)) {
            throw new NexoraException("You cannot bid on your own listing");
        }
        if (!product.isBiddingOpen()) {
            throw new NexoraException("Bidding is closed for this listing");
        }

        BigDecimal minimum = product.getCurrentBid() != null
                ? product.getCurrentBid().add(new BigDecimal("1.00"))
                : product.getStartingBid();

        if (request.getAmount().compareTo(minimum) < 0) {
            throw new NexoraException("Bid must be at least " + minimum);
        }

        Bid bid = Bid.builder()
                .productId(product.getId())
                .bidderId(bidderId)
                .amount(request.getAmount())
                .build();
        Bid saved = bidRepository.save(bid);

        product.setCurrentBid(saved.getAmount());
        product.setCurrentBidderId(bidderId);
        product.setBidCount((product.getBidCount() != null ? product.getBidCount() : 0) + 1);
        productRepository.save(product);

        return mapToDto(saved);
    }

    private BidResponseDto mapToDto(Bid bid) {
        return BidResponseDto.builder()
                .id(bid.getId())
                .productId(bid.getProductId())
                .bidderId(bid.getBidderId())
                .amount(bid.getAmount())
                .createdAt(bid.getCreatedAt())
                .build();
    }
}
