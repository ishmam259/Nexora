package com.nexora.lostfound.controller;

import com.nexora.lostfound.dto.FoundItemRequestDto;
import com.nexora.lostfound.dto.FoundItemResponseDto;
import com.nexora.lostfound.service.FoundItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lost-found/found-items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FoundItemController {

    private final FoundItemService foundItemService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FoundItemResponseDto>> getFoundItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(foundItemService.getActiveFoundItems(search, category));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FoundItemResponseDto> getFoundItemById(@PathVariable Long id) {
        return ResponseEntity.ok(foundItemService.getFoundItemById(id));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FoundItemResponseDto>> getMyFoundItems(Authentication authentication) {
        String reportedBy = authentication.getName();
        return ResponseEntity.ok(foundItemService.getMyFoundItems(reportedBy));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<FoundItemResponseDto> reportFoundItem(
            @RequestBody FoundItemRequestDto request,
            Authentication authentication) {
        String reportedBy = authentication.getName();
        FoundItemResponseDto response = foundItemService.reportFoundItem(request, reportedBy);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<FoundItemResponseDto> updateFoundItem(
            @PathVariable Long id,
            @RequestBody FoundItemRequestDto request,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        return ResponseEntity.ok(foundItemService.updateFoundItem(id, request, requesterId, isAdmin));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<FoundItemResponseDto> updateFoundItemStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        return ResponseEntity.ok(foundItemService.updateStatus(id, status, requesterId, isAdmin));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MERCHANT', 'ADMIN')")
    public ResponseEntity<Void> deleteFoundItem(
            @PathVariable Long id,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        foundItemService.deleteFoundItem(id, requesterId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}
