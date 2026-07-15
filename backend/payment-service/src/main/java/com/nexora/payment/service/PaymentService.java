package com.nexora.payment.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.payment.dto.PaymentRequestDto;
import com.nexora.payment.dto.PaymentResponseDto;
import com.nexora.payment.entity.Payment;
import com.nexora.payment.entity.PaymentMethodType;
import com.nexora.payment.entity.PaymentStatus;
import com.nexora.payment.entity.WalletTransaction;
import com.nexora.payment.repository.PaymentRepository;
import com.nexora.payment.publisher.NotificationPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Core payment processing service for the Nexora internal payment gateway.
 *
 * Supported flows:
 * 1. NEXORA_WALLET  — deduct from pre-funded wallet; instant, atomic.
 * 2. BKASH / NAGAD / ROCKET — user provides external txn reference;
 *    recorded as PENDING, an admin or async job verifies and marks SUCCESS.
 * 3. BANK_TRANSFER  — same pending-then-confirm flow as mobile banking.
 * 4. CASH           — recorded as PENDING; fulfilled in-person.
 *
 * Refunds always credit back to the payer's Nexora Wallet regardless
 * of the original payment method.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final WalletService walletService;
    private final NotificationPublisher notificationPublisher;

    // ─── Process payment ──────────────────────────────────────────────────────────

    @Transactional
    public PaymentResponseDto processPayment(PaymentRequestDto request, String payerId) {
        validateAmount(request.getAmount());

        String transactionId = generateTransactionId();
        PaymentStatus initialStatus;
        Long walletTxnId = null;

        if (request.getPaymentMethod() == PaymentMethodType.NEXORA_WALLET) {
            // Debit wallet atomically (pessimistic lock inside WalletService)
            // We save a preliminary payment first to get the ID, then debit
            Payment preliminary = buildPendingPayment(request, payerId, transactionId);
            Payment saved = paymentRepository.save(preliminary);

            WalletTransaction walletTxn = walletService.debitWallet(
                    payerId,
                    request.getAmount(),
                    saved.getId(),
                    "Payment for order " + request.getOrderId()
            );

            saved.setStatus(PaymentStatus.SUCCESS);
            saved.setWalletTransactionId(walletTxn.getId());
            paymentRepository.save(saved);

            log.info("Wallet payment {} processed successfully for order {}",
                    transactionId, request.getOrderId());

            notificationPublisher.sendNotification(
                    payerId,
                    "Payment Successful",
                    String.format("Your payment of %s %s for order %s was successful. Transaction ID: %s.",
                            saved.getCurrency(), saved.getAmount(), saved.getOrderId(), saved.getTransactionId())
            );

            return toDto(saved);

        } else {
            // Non-wallet methods: validate that external reference is present
            if (isExternalReferenceRequired(request.getPaymentMethod())
                    && (request.getExternalReference() == null || request.getExternalReference().isBlank())) {
                throw new NexoraException(
                        "externalReference is required for payment method: " + request.getPaymentMethod());
            }
            initialStatus = PaymentStatus.PENDING;

            Payment payment = buildPendingPayment(request, payerId, transactionId);
            payment.setStatus(initialStatus);
            Payment saved = paymentRepository.save(payment);

            log.info("Payment {} created with PENDING status for method {}",
                    transactionId, request.getPaymentMethod());

            notificationPublisher.sendNotification(
                    payerId,
                    "Payment Pending",
                    String.format("Your payment request of %s %s for order %s is pending confirmation.",
                            saved.getCurrency(), saved.getAmount(), saved.getOrderId())
            );

            return toDto(saved);
        }
    }

    // ─── Confirm a pending payment (admin/verification action) ────────────────────

    /**
     * Moves a PENDING payment to SUCCESS after manual or automated verification.
     * Only admins can call this endpoint.
     */
    @Transactional
    public PaymentResponseDto confirmPayment(Long paymentId) {
        Payment payment = findPaymentById(paymentId);

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new NexoraException(
                    "Cannot confirm payment in status: " + payment.getStatus() +
                    ". Only PENDING payments can be confirmed.");
        }
        payment.setStatus(PaymentStatus.SUCCESS);
        Payment saved = paymentRepository.save(payment);
        log.info("Payment {} confirmed by admin", paymentId);

        notificationPublisher.sendNotification(
                saved.getPayerId(),
                "Payment Confirmed",
                String.format("Your pending payment of %s %s for order %s has been confirmed. Transaction ID: %s.",
                        saved.getCurrency(), saved.getAmount(), saved.getOrderId(), saved.getTransactionId())
        );

        return toDto(saved);
    }

    // ─── Get a single payment ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentById(Long id) {
        return toDto(findPaymentById(id));
    }

    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found with transactionId: " + transactionId));
        return toDto(payment);
    }

    // ─── Payment history ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getPaymentsByPayer(String payerId) {
        return paymentRepository.findByPayerIdOrderByCreatedAtDesc(payerId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponseDto> getPaymentsByPayerPaged(String payerId, Pageable pageable) {
        return paymentRepository.findByPayerIdOrderByCreatedAtDesc(payerId, pageable)
                .map(this::toDto);
    }

    // ─── Refund ───────────────────────────────────────────────────────────────────

    /**
     * Refunds a payment. The amount is always credited back to the payer's
     * Nexora Wallet, regardless of the original payment method.
     * Only admins can initiate refunds.
     */
    @Transactional
    public PaymentResponseDto refundPayment(Long id) {
        Payment payment = findPaymentById(id);

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new NexoraException("Payment #" + id + " has already been refunded");
        }
        if (payment.getStatus() == PaymentStatus.FAILED) {
            throw new NexoraException("Cannot refund a FAILED payment");
        }
        if (payment.getStatus() == PaymentStatus.PENDING) {
            throw new NexoraException("Cannot refund a PENDING payment. Confirm or cancel it first.");
        }

        // Credit refund to payer's wallet (auto-creates wallet if missing)
        walletService.getOrCreateWallet(payment.getPayerId());
        walletService.refundToWallet(payment.getPayerId(), payment.getAmount(), payment.getId());

        payment.setStatus(PaymentStatus.REFUNDED);
        Payment saved = paymentRepository.save(payment);
        log.info("Payment {} refunded. Amount {} credited to wallet of user {}",
                id, payment.getAmount(), payment.getPayerId());

        notificationPublisher.sendNotification(
                saved.getPayerId(),
                "Payment Refunded",
                String.format("Your payment of %s %s for order %s has been refunded to your wallet.",
                        saved.getCurrency(), saved.getAmount(), saved.getOrderId())
        );

        return toDto(saved);
    }

    // ─── Fail a pending payment ───────────────────────────────────────────────────

    @Transactional
    public PaymentResponseDto failPayment(Long id) {
        Payment payment = findPaymentById(id);
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new NexoraException("Only PENDING payments can be marked as FAILED");
        }
        payment.setStatus(PaymentStatus.FAILED);
        Payment saved = paymentRepository.save(payment);

        notificationPublisher.sendNotification(
                saved.getPayerId(),
                "Payment Failed",
                String.format("Your payment request of %s %s for order %s has failed.",
                        saved.getCurrency(), saved.getAmount(), saved.getOrderId())
        );

        return toDto(saved);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    private Payment findPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new NexoraException("Payment amount must be greater than zero");
        }
    }

    private boolean isExternalReferenceRequired(PaymentMethodType method) {
        return method == PaymentMethodType.BKASH
                || method == PaymentMethodType.NAGAD
                || method == PaymentMethodType.ROCKET
                || method == PaymentMethodType.BANK_TRANSFER;
    }

    private String generateTransactionId() {
        return "NXR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    private Payment buildPendingPayment(PaymentRequestDto request, String payerId, String transactionId) {
        return Payment.builder()
                .orderId(request.getOrderId())
                .payerId(payerId)
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "BDT")
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .transactionId(transactionId)
                .externalReference(request.getExternalReference())
                .note(request.getNote())
                .build();
    }

    private PaymentResponseDto toDto(Payment p) {
        return PaymentResponseDto.builder()
                .id(p.getId())
                .orderId(p.getOrderId())
                .payerId(p.getPayerId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .transactionId(p.getTransactionId())
                .paymentMethod(p.getPaymentMethod())
                .externalReference(p.getExternalReference())
                .note(p.getNote())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
