package com.nexora.medical.controller;

import com.nexora.medical.dto.AppointmentRequestDto;
import com.nexora.medical.dto.AppointmentResponseDto;
import com.nexora.medical.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medical/appointments")
@RequiredArgsConstructor
// // @CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentResponseDto> bookAppointment(
            @RequestBody AppointmentRequestDto request,
            Authentication authentication) {
        String customerId = authentication.getName();
        AppointmentResponseDto response = appointmentService.bookAppointment(request, customerId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/customer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AppointmentResponseDto>> getCustomerAppointments(Authentication authentication) {
        String customerId = authentication.getName();
        return ResponseEntity.ok(appointmentService.getCustomerAppointments(customerId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MERCHANT', 'ADMIN')")
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(
            @PathVariable Long id,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        return ResponseEntity.ok(appointmentService.getAppointmentById(id, requesterId, isAdmin, roles));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentResponseDto> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String prescriptionDetails,
            Authentication authentication) {
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        return ResponseEntity.ok(appointmentService.updateAppointment(id, status, requesterId, isAdmin, roles, prescriptionDetails));
    }
}
