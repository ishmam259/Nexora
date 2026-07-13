package com.nexora.print.dto;

import com.nexora.print.entity.PrintOrderStatus;
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
public class PrintOrderResponseDto {
    private Long id;
    private String customerId;
    private String fileName;
    private String fileUrl;
    private Integer pageCount;
    private boolean color;
    private boolean doubleSided;
    private Integer copies;
    private BigDecimal amount;
    private PrintOrderStatus status;
    private String paymentReference;
    private String customerNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
