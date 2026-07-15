package com.nexora.medical.controller;

import com.nexora.medical.dto.MedicineRequestDto;
import com.nexora.medical.dto.MedicineResponseDto;
import com.nexora.medical.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical/medicines")
@RequiredArgsConstructor
// // @CrossOrigin(origins = "*")
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MedicineResponseDto>> getActiveMedicines(
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(medicineService.searchMedicines(search));
        }
        return ResponseEntity.ok(medicineService.getAllActiveMedicines());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MedicineResponseDto> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getMedicineById(id));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('MERCHANT', 'ADMIN')")
    public ResponseEntity<List<MedicineResponseDto>> getAllMedicines() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MERCHANT', 'ADMIN')")
    public ResponseEntity<MedicineResponseDto> createMedicine(@RequestBody MedicineRequestDto request) {
        MedicineResponseDto created = medicineService.createMedicine(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MERCHANT', 'ADMIN')")
    public ResponseEntity<MedicineResponseDto> updateMedicine(
            @PathVariable Long id,
            @RequestBody MedicineRequestDto request) {
        return ResponseEntity.ok(medicineService.updateMedicine(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MERCHANT', 'ADMIN')")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }
}
