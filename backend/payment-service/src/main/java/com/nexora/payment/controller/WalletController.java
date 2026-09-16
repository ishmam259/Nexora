package com.nexora.payment.controller;

import com.nexora.payment.dto.WalletResponseDto;
import com.nexora.payment.dto.WalletTopUpRequestDto;
import com.nexora.payment.dto.WalletTransactionResponseDto;
import com.nexora.payment.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoints for the Nexora Wallet.
 *
 * Users interact with their own wallet; admins can view any wallet by userId.
 */
@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
// // @CrossOrigin(origins = "*")
public class WalletController {

    private final WalletService walletService;

    /**
     * GET /api/wallet/me
     * Returns the authenticated user's wallet, creating it if it doesn't exist.
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<WalletResponseDto> getMyWallet(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(walletService.getOrCreateWallet(userId));
    }

    /**
     * GET /api/wallet/user/{userId}   (admin only)
     * Returns any user's wallet for admin inspection.
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WalletResponseDto> getWalletByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(walletService.getWalletByUserId(userId));
    }

    /**
     * POST /api/wallet/topup
     * Funds the authenticated user's wallet using an external reference
     * (bKash TrxID, Nagad TrxID, bank transfer ref, etc.).
     *
     * This creates a CREDIT entry on the wallet ledger. The system records
     * the external reference for idempotency and audit purposes.
     */
    @PostMapping("/topup")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<WalletTransactionResponseDto> topUp(
            Authentication authentication,
            @Valid @RequestBody WalletTopUpRequestDto request) {
        String userId = authentication.getName();
        WalletTransactionResponseDto response = walletService.topUp(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/wallet/me/transactions
     * Returns paginated transaction history for the authenticated user's wallet.
     */
    @GetMapping("/me/transactions")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<Page<WalletTransactionResponseDto>> getMyTransactions(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        String userId = authentication.getName();
        return ResponseEntity.ok(walletService.getTransactionHistory(userId, pageable));
    }
}
