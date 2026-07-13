package com.nexora.medical.dto;

import com.nexora.medical.entity.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDto {
    private Long id;
    private String customerId;
    private String doctorName;
    private String department;
    private LocalDateTime appointmentTime;
    private AppointmentStatus status;
    private BigDecimal amount;
    private String symptoms;
    private String prescriptionDetails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
