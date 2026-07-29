package com.nexora.marketplace.controller;

import com.nexora.marketplace.dto.BidRequestDto;
import com.nexora.marketplace.dto.BidResponseDto;
import com.nexora.marketplace.service.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace/bids")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT')")
    public ResponseEntity<BidResponseDto> placeBid(
            @RequestBody BidRequestDto request,
            Authentication authentication) {
        BidResponseDto created = bidService.placeBid(request, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BidResponseDto>> getBidsForProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(bidService.getBidsForProduct(productId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<List<BidResponseDto>> getMyBids(Authentication authentication) {
        return ResponseEntity.ok(bidService.getMyBids(authentication.getName()));
    }
}
