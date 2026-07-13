package com.nexora.payment.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.payment.dto.PaymentRequestDto;
import com.nexora.payment.dto.PaymentResponseDto;
import com.nexora.payment.entity.Payment;
import com.nexora.payment.entity.PaymentStatus;
import com.nexora.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional
    public PaymentResponseDto processPayment(PaymentRequestDto request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new NexoraException("Payment amount must be greater than zero");
        }

        // Mock payment processing (simulate successful/failed state)
        PaymentStatus status = PaymentStatus.SUCCESS;
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 18).toUpperCase();

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CREDIT_CARD")
                .status(status)
                .transactionId(transactionId)
                .timestamp(LocalDateTime.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponseDto(savedPayment);
    }

    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with ID: " + id));
        return mapToResponseDto(payment);
    }

    @Transactional
    public PaymentResponseDto refundPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with ID: " + id));

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new NexoraException("Payment with ID: " + id + " has already been refunded");
        }
        if (payment.getStatus() == PaymentStatus.FAILED) {
            throw new NexoraException("Cannot refund a failed payment");
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        Payment updatedPayment = paymentRepository.save(payment);
        return mapToResponseDto(updatedPayment);
    }

    private PaymentResponseDto mapToResponseDto(Payment payment) {
        return PaymentResponseDto.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .timestamp(payment.getTimestamp())
                .build();
    }
}
