package com.nexora.medical.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.medical.dto.AppointmentRequestDto;
import com.nexora.medical.dto.AppointmentResponseDto;
import com.nexora.medical.entity.Appointment;
import com.nexora.medical.entity.AppointmentStatus;
import com.nexora.medical.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    @Transactional
    public AppointmentResponseDto bookAppointment(AppointmentRequestDto request, String customerId) {
        if (request.getDoctorName() == null || request.getDoctorName().isBlank()) {
            throw new NexoraException("Doctor name is required");
        }
        if (request.getDepartment() == null || request.getDepartment().isBlank()) {
            throw new NexoraException("Department is required");
        }
        if (request.getAppointmentTime() == null) {
            throw new NexoraException("Appointment time is required");
        }
        if (request.getAppointmentTime().isBefore(LocalDateTime.now())) {
            throw new NexoraException("Appointment time must be in the future");
        }

        Appointment appointment = Appointment.builder()
                .customerId(customerId)
                .doctorName(request.getDoctorName())
                .department(request.getDepartment())
                .appointmentTime(request.getAppointmentTime())
                .amount(request.getAmount() != null ? request.getAmount() : java.math.BigDecimal.ZERO)
                .symptoms(request.getSymptoms())
                .status(AppointmentStatus.PENDING)
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getCustomerAppointments(String customerId) {
        return appointmentRepository.findByCustomerIdOrderByAppointmentTimeDesc(customerId)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDto getAppointmentById(Long id, String requesterId, boolean isAdmin, List<String> roles) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        boolean isPatient = appointment.getCustomerId().equals(requesterId);
        boolean isMerchantOrAdmin = isAdmin || roles.contains("ROLE_MERCHANT") || roles.contains("ROLE_ADMIN");

        if (!isPatient && !isMerchantOrAdmin) {
            throw new NexoraException("You are not authorized to view this appointment");
        }

        return mapToResponseDto(appointment);
    }

    @Transactional
    public AppointmentResponseDto updateAppointment(Long id, String newStatus, String requesterId, boolean isAdmin, List<String> roles, String prescriptionDetails) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        AppointmentStatus targetStatus;
        try {
            targetStatus = AppointmentStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new NexoraException("Invalid appointment status: " + newStatus);
        }

        boolean isPatient = appointment.getCustomerId().equals(requesterId);
        boolean isMerchantOrAdmin = isAdmin || roles.contains("ROLE_MERCHANT") || roles.contains("ROLE_ADMIN");

        if (!isPatient && !isMerchantOrAdmin) {
            throw new NexoraException("You are not authorized to update this appointment");
        }

        // Customer can only cancel pending appointment
        if (isPatient && !isMerchantOrAdmin) {
            if (targetStatus != AppointmentStatus.CANCELLED) {
                throw new NexoraException("Patients can only cancel appointments");
            }
            if (appointment.getStatus() != AppointmentStatus.PENDING) {
                throw new NexoraException("Appointments can only be cancelled while they are PENDING");
            }
        }

        // Merchant or Admin validations
        if (isMerchantOrAdmin) {
            if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.CANCELLED) {
                throw new NexoraException("Cannot update status of an already completed or cancelled appointment");
            }
            if (prescriptionDetails != null) {
                appointment.setPrescriptionDetails(prescriptionDetails);
            }
        }

        appointment.setStatus(targetStatus);
        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponseDto(saved);
    }

    private AppointmentResponseDto mapToResponseDto(Appointment appointment) {
        return AppointmentResponseDto.builder()
                .id(appointment.getId())
                .customerId(appointment.getCustomerId())
                .doctorName(appointment.getDoctorName())
                .department(appointment.getDepartment())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .amount(appointment.getAmount())
                .symptoms(appointment.getSymptoms())
                .prescriptionDetails(appointment.getPrescriptionDetails())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }
}
