package com.nexora.medical.dto;

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
public class AppointmentRequestDto {
    private String doctorName;
    private String department;
    private LocalDateTime appointmentTime;
    private BigDecimal amount;
    private String symptoms;
}
