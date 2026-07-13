package com.nexora.ai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_query_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiQueryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false, length = 1000)
    private String query;

    @Column(nullable = false, length = 2000)
    private String response;

    @Column(nullable = false)
    private String queryType;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
