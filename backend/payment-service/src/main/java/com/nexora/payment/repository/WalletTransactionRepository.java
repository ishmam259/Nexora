package com.nexora.payment.repository;

import com.nexora.payment.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    /** Paginated transaction history for a wallet */
    Page<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId, Pageable pageable);

    /** Idempotency check — prevent processing the same external reference twice */
    Optional<WalletTransaction> findByReferenceId(String referenceId);
}
