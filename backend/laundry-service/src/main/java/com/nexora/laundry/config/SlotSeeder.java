package com.nexora.laundry.config;

import com.nexora.laundry.entity.Slot;
import com.nexora.laundry.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
public class SlotSeeder implements ApplicationRunner {

    private final SlotRepository slotRepository;

    private static final int[][] WINDOWS = {{9, 11}, {12, 14}, {15, 17}, {18, 20}};
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEE, MMM d", Locale.ENGLISH);

    @Override
    public void run(ApplicationArguments args) {
        if (slotRepository.count() > 0) {
            return;
        }

        List<Slot> slots = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int day = 0; day < 7; day++) {
            LocalDate date = today.plusDays(day);
            for (int[] window : WINDOWS) {
                LocalDateTime start = date.atTime(window[0], 0);
                LocalDateTime end = date.atTime(window[1], 0);
                String label = date.format(DATE_FMT) + " " + window[0] + ":00-" + window[1] + ":00";

                slots.add(Slot.builder()
                        .label(label)
                        .startTime(start)
                        .endTime(end)
                        .maxCapacity(5)
                        .bookedCount(0)
                        .active(true)
                        .build());
            }
        }

        slotRepository.saveAll(slots);
        log.info("[LAUNDRY] Seeded {} laundry slots for the next 7 days", slots.size());
    }
}
