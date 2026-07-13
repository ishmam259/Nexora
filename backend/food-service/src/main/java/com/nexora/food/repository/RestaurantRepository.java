package com.nexora.food.repository;

import com.nexora.food.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByActive(boolean active);
    List<Restaurant> findByOwnerId(String ownerId);
    List<Restaurant> findByNameContainingIgnoreCase(String name);
}
