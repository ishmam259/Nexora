package com.nexora.food.repository;

import com.nexora.food.entity.FoodOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodOrderRepository extends JpaRepository<FoodOrder, Long> {
    List<FoodOrder> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    List<FoodOrder> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
}
