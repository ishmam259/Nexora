package com.nexora.marketplace.config;

import com.nexora.marketplace.entity.Category;
import com.nexora.marketplace.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CategorySeeder implements ApplicationRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() > 0) {
            return;
        }
        List<Category> seeds = List.of(
                Category.builder().name("Books").description("Textbooks and course materials").build(),
                Category.builder().name("Electronics").description("Phones, laptops, accessories").build(),
                Category.builder().name("Furniture").description("Dorm and apartment furniture").build(),
                Category.builder().name("Clothing").description("Apparel and shoes").build(),
                Category.builder().name("Sports").description("Sports gear and fitness").build(),
                Category.builder().name("Other").description("Everything else").build()
        );
        categoryRepository.saveAll(seeds);
        log.info("[MARKETPLACE] Seeded {} default categories", seeds.size());
    }
}
