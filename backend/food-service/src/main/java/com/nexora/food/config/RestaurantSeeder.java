package com.nexora.food.config;

import com.nexora.food.entity.MenuItem;
import com.nexora.food.entity.Restaurant;
import com.nexora.food.repository.MenuItemRepository;
import com.nexora.food.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RestaurantSeeder implements ApplicationRunner {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (restaurantRepository.count() > 0) {
            return;
        }

        Restaurant cds = restaurantRepository.save(Restaurant.builder()
                .name("CDS")
                .description("Central Dining Spot — campus favourite for quick rice and curry meals")
                .address("Central Cafeteria, Ground Floor, Main Campus")
                .contactNumber("01700000001")
                .imageUrl("https://images.unsplash.com/photo-1512058564366-18510be2db19")
                .ownerId("seed-owner-cds")
                .active(true)
                .build());

        Restaurant ovenFresh = restaurantRepository.save(Restaurant.builder()
                .name("Oven Fresh")
                .description("Freshly baked snacks, pastries, and fast food near the academic building")
                .address("Shop 4, Academic Building Food Court")
                .contactNumber("01700000002")
                .imageUrl("https://images.unsplash.com/photo-1517686469429-8bdb88b9f907")
                .ownerId("seed-owner-ovenfresh")
                .active(true)
                .build());

        List<MenuItem> menuItems = List.of(
                MenuItem.builder().restaurantId(cds.getId()).name("Chicken Rice Combo")
                        .description("Steamed rice, chicken curry, and mixed vegetables")
                        .price(new BigDecimal("120.00")).available(true).category("Main Course").build(),
                MenuItem.builder().restaurantId(cds.getId()).name("Beef Tehari")
                        .description("Spiced rice with tender beef chunks")
                        .price(new BigDecimal("150.00")).available(true).category("Main Course").build(),
                MenuItem.builder().restaurantId(cds.getId()).name("Vegetable Khichuri")
                        .description("Lentils and rice cooked with mixed vegetables")
                        .price(new BigDecimal("90.00")).available(true).category("Main Course").build(),
                MenuItem.builder().restaurantId(cds.getId()).name("Cold Coffee")
                        .description("Chilled coffee with milk and ice")
                        .price(new BigDecimal("70.00")).available(true).category("Beverage").build(),

                MenuItem.builder().restaurantId(ovenFresh.getId()).name("Chicken Burger")
                        .description("Grilled chicken patty with lettuce and mayo")
                        .price(new BigDecimal("140.00")).available(true).category("Fast Food").build(),
                MenuItem.builder().restaurantId(ovenFresh.getId()).name("Beef Patty")
                        .description("Flaky pastry filled with spiced beef")
                        .price(new BigDecimal("60.00")).available(true).category("Snack").build(),
                MenuItem.builder().restaurantId(ovenFresh.getId()).name("Chicken Sandwich")
                        .description("Toasted sandwich with grilled chicken and veggies")
                        .price(new BigDecimal("110.00")).available(true).category("Fast Food").build(),
                MenuItem.builder().restaurantId(ovenFresh.getId()).name("Fresh Orange Juice")
                        .description("Freshly squeezed orange juice")
                        .price(new BigDecimal("80.00")).available(true).category("Beverage").build()
        );
        menuItemRepository.saveAll(menuItems);

        log.info("[FOOD] Seeded {} restaurants ({}, {}) with {} menu items",
                2, cds.getName(), ovenFresh.getName(), menuItems.size());
    }
}
