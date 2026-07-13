package com.nexora.food.repository;

import com.nexora.food.entity.FoodOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodOrderItemRepository extends JpaRepository<FoodOrderItem, Long> {
}
