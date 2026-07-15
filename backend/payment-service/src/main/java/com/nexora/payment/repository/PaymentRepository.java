package com.nexora.payment.repository;

import com.nexora.payment.entity.Payment;
import com.nexora.payment.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findByOrderId(String orderId);

    List<Payment> findByPayerIdOrderByCreatedAtDesc(String payerId);

    Page<Payment> findByPayerIdOrderByCreatedAtDesc(String payerId, Pageable pageable);

    List<Payment> findByPayerIdAndStatus(String payerId, PaymentStatus status);
}
