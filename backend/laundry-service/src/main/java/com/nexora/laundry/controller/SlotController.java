package com.nexora.laundry.controller;

import com.nexora.laundry.dto.SlotRequestDto;
import com.nexora.laundry.dto.SlotResponseDto;
import com.nexora.laundry.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laundry/slots")
@RequiredArgsConstructor
// // @CrossOrigin(origins = "*")
public class SlotController {

    private final SlotService slotService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SlotResponseDto>> getActiveSlots() {
        return ResponseEntity.ok(slotService.getAllActiveSlots());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SlotResponseDto> getSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(slotService.getSlotById(id));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('MERCHANT', 'ADMIN')")
    public ResponseEntity<List<SlotResponseDto>> getAllSlots() {
        return ResponseEntity.ok(slotService.getAllSlots());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MERCHANT', 'ADMIN')")
    public ResponseEntity<SlotResponseDto> createSlot(@RequestBody SlotRequestDto request) {
        SlotResponseDto created = slotService.createSlot(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MERCHANT', 'ADMIN')")
    public ResponseEntity<SlotResponseDto> updateSlot(@PathVariable Long id, @RequestBody SlotRequestDto request) {
        return ResponseEntity.ok(slotService.updateSlot(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MERCHANT', 'ADMIN')")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        slotService.deleteSlot(id);
        return ResponseEntity.noContent().build();
    }
}
