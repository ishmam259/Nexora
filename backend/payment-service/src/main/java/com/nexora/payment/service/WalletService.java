package com.nexora.payment.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.payment.dto.WalletResponseDto;
import com.nexora.payment.dto.WalletTopUpRequestDto;
import com.nexora.payment.dto.WalletTransactionResponseDto;
import com.nexora.payment.entity.Wallet;
import com.nexora.payment.entity.WalletTransaction;
import com.nexora.payment.entity.WalletTransactionType;
import com.nexora.payment.repository.WalletRepository;
import com.nexora.payment.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Manages the Nexora internal wallet system.
 * All balance mutations are performed within a single DB transaction
 * using a pessimistic write lock to prevent race conditions.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    // ─── Wallet creation ────────────────────────────────────────────────────────

    /**
     * Creates a new wallet for a user. Called automatically on first payment
     * if the user does not yet have one.
     */
    @Transactional
    public WalletResponseDto createWallet(String userId) {
        if (walletRepository.findByUserId(userId).isPresent()) {
            throw new NexoraException("Wallet already exists for user: " + userId);
        }
        Wallet wallet = Wallet.builder()
                .userId(userId)
                .balance(BigDecimal.ZERO)
                .currency("BDT")
                .active(true)
                .build();
        Wallet saved = walletRepository.save(wallet);
        log.info("Created wallet {} for user {}", saved.getId(), userId);
        return toDto(saved);
    }

    /**
     * Returns the wallet for a user, creating one if it doesn't exist yet.
     */
    @Transactional
    public WalletResponseDto getOrCreateWallet(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId).orElseGet(() -> {
            Wallet w = Wallet.builder()
                    .userId(userId)
                    .balance(BigDecimal.ZERO)
                    .currency("BDT")
                    .active(true)
                    .build();
            return walletRepository.save(w);
        });
        return toDto(wallet);
    }

    // ─── Balance inquiry ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public WalletResponseDto getWalletByUserId(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));
        return toDto(wallet);
    }

    // ─── Top-up (credit) ─────────────────────────────────────────────────────────

    /**
     * Credits the wallet after the user funds it via an external channel
     * (bKash, Nagad, Rocket, or bank transfer).
     *
     * Idempotency: if the same externalReference has already been processed,
     * we return the existing transaction without creating a duplicate.
     */
    @Transactional
    public WalletTransactionResponseDto topUp(String userId, WalletTopUpRequestDto request) {
        // Idempotency check
        if (walletTransactionRepository.findByReferenceId(request.getExternalReference()).isPresent()) {
            log.warn("Duplicate top-up request for reference {}", request.getExternalReference());
            return walletTransactionRepository
                    .findByReferenceId(request.getExternalReference())
                    .map(this::toTransactionDto)
                    .orElseThrow();
        }

        // Pessimistic lock to prevent concurrent top-ups from racing
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseGet(() -> walletRepository.save(
                        Wallet.builder()
                                .userId(userId)
                                .balance(BigDecimal.ZERO)
                                .currency("BDT")
                                .active(true)
                                .build()
                ));

        if (!wallet.getActive()) {
            throw new NexoraException("Wallet is suspended for user: " + userId);
        }

        BigDecimal newBalance = wallet.getBalance().add(request.getAmount());
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        WalletTransaction txn = WalletTransaction.builder()
                .wallet(wallet)
                .type(WalletTransactionType.CREDIT)
                .amount(request.getAmount())
                .balanceAfter(newBalance)
                .description("Top-up via " + request.getFundingSource())
                .referenceId(request.getExternalReference())
                .build();
        WalletTransaction saved = walletTransactionRepository.save(txn);

        log.info("Wallet {} topped up by {} {}. New balance: {}",
                wallet.getId(), request.getAmount(), request.getCurrency(), newBalance);
        return toTransactionDto(saved);
    }

    // ─── Debit (internal — called by PaymentService) ─────────────────────────────

    /**
     * Debits the wallet for a payment. Must be called inside an outer transaction.
     *
     * @param userId       payer's Keycloak userId
     * @param amount       amount to debit
     * @param paymentId    the payment ID this debit is associated with
     * @param description  human-readable reason
     * @return the created WalletTransaction
     */
    @Transactional
    public WalletTransaction debitWallet(String userId, BigDecimal amount, Long paymentId, String description) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        if (!wallet.getActive()) {
            throw new NexoraException("Wallet is suspended for user: " + userId);
        }
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new NexoraException(
                    String.format("Insufficient wallet balance. Available: %.2f, Required: %.2f",
                            wallet.getBalance(), amount));
        }

        BigDecimal newBalance = wallet.getBalance().subtract(amount);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        WalletTransaction txn = WalletTransaction.builder()
                .wallet(wallet)
                .type(WalletTransactionType.DEBIT)
                .amount(amount)
                .balanceAfter(newBalance)
                .paymentId(paymentId)
                .description(description)
                .referenceId("PAY-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .build();
        return walletTransactionRepository.save(txn);
    }

    // ─── Refund (credit back) ─────────────────────────────────────────────────────

    /**
     * Credits the wallet back when a payment is refunded.
     *
     * @param userId    payer's Keycloak userId
     * @param amount    amount to refund
     * @param paymentId the payment being refunded
     */
    @Transactional
    public WalletTransaction refundToWallet(String userId, BigDecimal amount, Long paymentId) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        WalletTransaction txn = WalletTransaction.builder()
                .wallet(wallet)
                .type(WalletTransactionType.REFUND)
                .amount(amount)
                .balanceAfter(newBalance)
                .paymentId(paymentId)
                .description("Refund for payment #" + paymentId)
                .referenceId("REF-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .build();
        return walletTransactionRepository.save(txn);
    }

    // ─── Transaction history ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<WalletTransactionResponseDto> getTransactionHistory(String userId, Pageable pageable) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));
        return walletTransactionRepository
                .findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable)
                .map(this::toTransactionDto);
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────────

    public WalletResponseDto toDto(Wallet wallet) {
        return WalletResponseDto.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .active(wallet.getActive())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }

    public WalletTransactionResponseDto toTransactionDto(WalletTransaction txn) {
        return WalletTransactionResponseDto.builder()
                .id(txn.getId())
                .walletId(txn.getWallet().getId())
                .type(txn.getType())
                .amount(txn.getAmount())
                .balanceAfter(txn.getBalanceAfter())
                .paymentId(txn.getPaymentId())
                .description(txn.getDescription())
                .referenceId(txn.getReferenceId())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
