package com.nexora.print.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrintOrderRequestDto {
    private String fileName;
    private String fileUrl;
    private Integer pageCount;
    private Boolean color;
    private Boolean doubleSided;
    private Integer copies;
    private BigDecimal amount; // Optional, can be computed in service
    private String paymentReference;
    private String customerNote;
}
