package com.nexora.lostfound.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "found_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoundItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(name = "found_location")
    private String foundLocation;

    @Column(name = "found_date")
    private LocalDateTime foundDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FoundItemStatus status;

    @Column(name = "reported_by", nullable = false)
    private String reportedBy;

    @Column(name = "storage_location")
    private String storageLocation;

    @Column(name = "contact_details")
    private String contactDetails;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = FoundItemStatus.FOUND;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
