package com.nexora.medical.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.medical.dto.MedicineRequestDto;
import com.nexora.medical.dto.MedicineResponseDto;
import com.nexora.medical.entity.Medicine;
import com.nexora.medical.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;

    @Transactional(readOnly = true)
    public List<MedicineResponseDto> getAllActiveMedicines() {
        return medicineRepository.findByActive(true)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineResponseDto> searchMedicines(String name) {
        return medicineRepository.findByNameContainingIgnoreCaseAndActive(name, true)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicineResponseDto getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        return mapToResponseDto(medicine);
    }

    @Transactional(readOnly = true)
    public List<MedicineResponseDto> getAllMedicines() {
        return medicineRepository.findAll()
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicineResponseDto createMedicine(MedicineRequestDto request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new NexoraException("Medicine name is required");
        }
        if (request.getPrice() == null || request.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new NexoraException("Medicine price must be positive");
        }

        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .imageUrl(request.getImageUrl())
                .requiresPrescription(request.getRequiresPrescription() != null ? request.getRequiresPrescription() : false)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Medicine saved = medicineRepository.save(medicine);
        return mapToResponseDto(saved);
    }

    @Transactional
    public MedicineResponseDto updateMedicine(Long id, MedicineRequestDto request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            medicine.setName(request.getName());
        }
        if (request.getDescription() != null) {
            medicine.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            if (request.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new NexoraException("Price must be positive");
            }
            medicine.setPrice(request.getPrice());
        }
        if (request.getStock() != null) {
            if (request.getStock() < 0) {
                throw new NexoraException("Stock cannot be negative");
            }
            medicine.setStock(request.getStock());
        }
        if (request.getImageUrl() != null) {
            medicine.setImageUrl(request.getImageUrl());
        }
        if (request.getRequiresPrescription() != null) {
            medicine.setRequiresPrescription(request.getRequiresPrescription());
        }
        if (request.getActive() != null) {
            medicine.setActive(request.getActive());
        }

        Medicine updated = medicineRepository.save(medicine);
        return mapToResponseDto(updated);
    }

    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        medicineRepository.delete(medicine);
    }

    private MedicineResponseDto mapToResponseDto(Medicine medicine) {
        return MedicineResponseDto.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .description(medicine.getDescription())
                .price(medicine.getPrice())
                .stock(medicine.getStock())
                .imageUrl(medicine.getImageUrl())
                .requiresPrescription(medicine.isRequiresPrescription())
                .active(medicine.isActive())
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }
}
