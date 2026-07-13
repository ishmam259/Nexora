package com.nexora.payment.controller;

import com.nexora.payment.dto.PaymentRequestDto;
import com.nexora.payment.dto.PaymentResponseDto;
import com.nexora.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/charge")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<PaymentResponseDto> charge(@RequestBody PaymentRequestDto request) {
        PaymentResponseDto response = paymentService.processPayment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<PaymentResponseDto> getPayment(@PathVariable Long id) {
        PaymentResponseDto response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDto> refund(@PathVariable Long id) {
        PaymentResponseDto response = paymentService.refundPayment(id);
        return ResponseEntity.ok(response);
    }
}
