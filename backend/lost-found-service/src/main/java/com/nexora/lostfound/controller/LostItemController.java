package com.nexora.lostfound.controller;

import com.nexora.lostfound.dto.LostItemRequestDto;
import com.nexora.lostfound.dto.LostItemResponseDto;
import com.nexora.lostfound.service.LostItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lost-found/lost-items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LostItemController {

    private final LostItemService lostItemService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LostItemResponseDto>> getLostItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(lostItemService.getActiveLostItems(search, category));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LostItemResponseDto> getLostItemById(@PathVariable Long id) {
        return ResponseEntity.ok(lostItemService.getLostItemById(id));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LostItemResponseDto>> getMyLostItems(Authentication authentication) {
        String reportedBy = authentication.getName();
        return ResponseEntity.ok(lostItemService.getMyLostItems(reportedBy));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<LostItemResponseDto> reportLostItem(
            @RequestBody LostItemRequestDto request,
            Authentication authentication) {
        String reportedBy = authentication.getName();
        LostItemResponseDto response = lostItemService.reportLostItem(request, reportedBy);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<LostItemResponseDto> updateLostItem(
            @PathVariable Long id,
            @RequestBody LostItemRequestDto request,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        return ResponseEntity.ok(lostItemService.updateLostItem(id, request, requesterId, isAdmin));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<LostItemResponseDto> updateLostItemStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        return ResponseEntity.ok(lostItemService.updateStatus(id, status, requesterId, isAdmin));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<Void> deleteLostItem(
            @PathVariable Long id,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        lostItemService.deleteLostItem(id, requesterId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}
