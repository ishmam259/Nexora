package com.nexora.payment.controller;

import com.nexora.payment.dto.PaymentRequestDto;
import com.nexora.payment.dto.PaymentResponseDto;
import com.nexora.payment.service.PaymentService;
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

import java.util.List;

/**
 * REST controller for the Nexora internal payment gateway.
 *
 * Payment flows:
 * - POST /api/payments/charge         — initiate a payment (any authenticated user)
 * - GET  /api/payments/{id}           — get a specific payment
 * - GET  /api/payments/my             — get current user's payment history
 * - POST /api/payments/{id}/confirm   — confirm a pending payment (admin only)
 * - POST /api/payments/{id}/refund    — refund a payment (admin only)
 * - POST /api/payments/{id}/fail      — mark a pending payment as failed (admin only)
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
// // @CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * POST /api/payments/charge
     * Initiates a payment for the currently authenticated user.
     *
     * - NEXORA_WALLET: instant debit → returns SUCCESS immediately.
     * - Others (bKash, Nagad, bank): recorded as PENDING, requires admin confirmation.
     */
    @PostMapping("/charge")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<PaymentResponseDto> charge(
            Authentication authentication,
            @Valid @RequestBody PaymentRequestDto request) {
        String payerId = authentication.getName();
        PaymentResponseDto response = paymentService.processPayment(request, payerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/payments/{id}
     * Retrieves a payment by its internal database ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<PaymentResponseDto> getPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    /**
     * GET /api/payments/txn/{transactionId}
     * Retrieves a payment by its unique NXR-xxxx transaction ID.
     */
    @GetMapping("/txn/{transactionId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<PaymentResponseDto> getByTransactionId(@PathVariable String transactionId) {
        return ResponseEntity.ok(paymentService.getPaymentByTransactionId(transactionId));
    }

    /**
     * GET /api/payments/my
     * Returns the authenticated user's full payment history.
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<List<PaymentResponseDto>> getMyPayments(Authentication authentication) {
        String payerId = authentication.getName();
        return ResponseEntity.ok(paymentService.getPaymentsByPayer(payerId));
    }

    /**
     * GET /api/payments/my/paged
     * Paginated version of the user's payment history.
     */
    @GetMapping("/my/paged")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_AGENT')")
    public ResponseEntity<Page<PaymentResponseDto>> getMyPaymentsPaged(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable) {
        String payerId = authentication.getName();
        return ResponseEntity.ok(paymentService.getPaymentsByPayerPaged(payerId, pageable));
    }

    /**
     * POST /api/payments/{id}/confirm   (admin only)
     * Manually confirms a PENDING payment after verifying the external reference.
     */
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDto> confirmPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.confirmPayment(id));
    }

    /**
     * POST /api/payments/{id}/refund   (admin only)
     * Refunds a SUCCESS payment. Amount is credited to payer's Nexora Wallet.
     */
    @PostMapping("/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDto> refundPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.refundPayment(id));
    }

    /**
     * POST /api/payments/{id}/fail   (admin only)
     * Marks a PENDING payment as FAILED (e.g. external reference was invalid).
     */
    @PostMapping("/{id}/fail")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDto> failPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.failPayment(id));
    }
}
