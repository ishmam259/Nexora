package com.nexora.laundry.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.laundry.dto.SlotRequestDto;
import com.nexora.laundry.dto.SlotResponseDto;
import com.nexora.laundry.entity.Slot;
import com.nexora.laundry.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlotService {

    private final SlotRepository slotRepository;

    @Transactional(readOnly = true)
    public List<SlotResponseDto> getAllActiveSlots() {
        return slotRepository.findByActive(true)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SlotResponseDto getSlotById(Long id) {
        Slot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laundry slot not found with ID: " + id));
        return mapToResponseDto(slot);
    }

    @Transactional(readOnly = true)
    public List<SlotResponseDto> getAllSlots() {
        return slotRepository.findAll()
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SlotResponseDto createSlot(SlotRequestDto request) {
        if (request.getLabel() == null || request.getLabel().isBlank()) {
            throw new NexoraException("Slot label is required");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new NexoraException("Start time and end time are required");
        }
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new NexoraException("Start time must be before end time");
        }

        Slot slot = Slot.builder()
                .label(request.getLabel())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .maxCapacity(request.getMaxCapacity() != null ? request.getMaxCapacity() : 5)
                .active(request.getActive() != null ? request.getActive() : true)
                .bookedCount(0)
                .build();

        Slot saved = slotRepository.save(slot);
        return mapToResponseDto(saved);
    }

    @Transactional
    public SlotResponseDto updateSlot(Long id, SlotRequestDto request) {
        Slot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laundry slot not found with ID: " + id));

        if (request.getLabel() != null && !request.getLabel().isBlank()) {
            slot.setLabel(request.getLabel());
        }
        if (request.getStartTime() != null) {
            slot.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            slot.setEndTime(request.getEndTime());
        }
        if (slot.getStartTime().isAfter(slot.getEndTime())) {
            throw new NexoraException("Start time must be before end time");
        }
        if (request.getMaxCapacity() != null) {
            if (request.getMaxCapacity() < slot.getBookedCount()) {
                throw new NexoraException("New capacity cannot be less than current booked count (" + slot.getBookedCount() + ")");
            }
            slot.setMaxCapacity(request.getMaxCapacity());
        }
        if (request.getActive() != null) {
            slot.setActive(request.getActive());
        }

        Slot updated = slotRepository.save(slot);
        return mapToResponseDto(updated);
    }

    @Transactional
    public void deleteSlot(Long id) {
        Slot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laundry slot not found with ID: " + id));
        if (slot.getBookedCount() > 0) {
            throw new NexoraException("Cannot delete slot as it has active bookings");
        }
        slotRepository.delete(slot);
    }

    private SlotResponseDto mapToResponseDto(Slot slot) {
        return SlotResponseDto.builder()
                .id(slot.getId())
                .label(slot.getLabel())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .maxCapacity(slot.getMaxCapacity())
                .bookedCount(slot.getBookedCount())
                .active(slot.isActive())
                .createdAt(slot.getCreatedAt())
                .updatedAt(slot.getUpdatedAt())
                .build();
    }
}
