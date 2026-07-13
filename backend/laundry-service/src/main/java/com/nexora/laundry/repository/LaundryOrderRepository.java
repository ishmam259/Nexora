package com.nexora.laundry.repository;

import com.nexora.laundry.entity.LaundryOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LaundryOrderRepository extends JpaRepository<LaundryOrder, Long> {
    List<LaundryOrder> findByCustomerIdOrderByCreatedAtDesc(String customerId);
}
