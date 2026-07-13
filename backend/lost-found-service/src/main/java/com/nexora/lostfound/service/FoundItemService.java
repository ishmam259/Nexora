package com.nexora.lostfound.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.lostfound.dto.FoundItemRequestDto;
import com.nexora.lostfound.dto.FoundItemResponseDto;
import com.nexora.lostfound.entity.FoundItem;
import com.nexora.lostfound.entity.FoundItemStatus;
import com.nexora.lostfound.repository.FoundItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoundItemService {

    private final FoundItemRepository foundItemRepository;

    @Transactional(readOnly = true)
    public List<FoundItemResponseDto> getActiveFoundItems(String search, String category) {
        List<FoundItem> items;
        if (search != null && !search.isBlank()) {
            items = foundItemRepository.searchFoundItems(FoundItemStatus.FOUND, search);
        } else if (category != null && !category.isBlank()) {
            items = foundItemRepository.findByStatusAndCategoryOrderByCreatedAtDesc(FoundItemStatus.FOUND, category);
        } else {
            items = foundItemRepository.findByStatusOrderByCreatedAtDesc(FoundItemStatus.FOUND);
        }
        return items.stream().map(this::mapToResponseDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FoundItemResponseDto getFoundItemById(Long id) {
        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found with ID: " + id));
        return mapToResponseDto(item);
    }

    @Transactional(readOnly = true)
    public List<FoundItemResponseDto> getMyFoundItems(String reportedBy) {
        return foundItemRepository.findByReportedByOrderByCreatedAtDesc(reportedBy).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FoundItemResponseDto reportFoundItem(FoundItemRequestDto request, String reportedBy) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new NexoraException("Title cannot be empty");
        }
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            throw new NexoraException("Category must be specified");
        }

        FoundItem item = FoundItem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .foundLocation(request.getFoundLocation())
                .foundDate(request.getFoundDate() != null ? request.getFoundDate() : LocalDateTime.now())
                .storageLocation(request.getStorageLocation())
                .status(FoundItemStatus.FOUND)
                .reportedBy(reportedBy)
                .contactDetails(request.getContactDetails())
                .build();

        FoundItem saved = foundItemRepository.save(item);
        return mapToResponseDto(saved);
    }

    @Transactional
    public FoundItemResponseDto updateFoundItem(Long id, FoundItemRequestDto request, String requesterId, boolean isAdmin) {
        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found with ID: " + id));

        if (!item.getReportedBy().equals(requesterId) && !isAdmin) {
            throw new NexoraException("You do not have permission to update this item");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            item.setTitle(request.getTitle());
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            item.setCategory(request.getCategory());
        }
        item.setDescription(request.getDescription());
        item.setFoundLocation(request.getFoundLocation());
        if (request.getFoundDate() != null) {
            item.setFoundDate(request.getFoundDate());
        }
        item.setStorageLocation(request.getStorageLocation());
        item.setContactDetails(request.getContactDetails());

        FoundItem saved = foundItemRepository.save(item);
        return mapToResponseDto(saved);
    }

    @Transactional
    public FoundItemResponseDto updateStatus(Long id, String status, String requesterId, boolean isAdmin) {
        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found with ID: " + id));

        if (!item.getReportedBy().equals(requesterId) && !isAdmin) {
            throw new NexoraException("You do not have permission to change the status of this item");
        }

        try {
            FoundItemStatus newStatus = FoundItemStatus.valueOf(status.toUpperCase());
            item.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new NexoraException("Invalid status: " + status);
        }

        FoundItem saved = foundItemRepository.save(item);
        return mapToResponseDto(saved);
    }

    @Transactional
    public void deleteFoundItem(Long id, String requesterId, boolean isAdmin) {
        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found with ID: " + id));

        if (!item.getReportedBy().equals(requesterId) && !isAdmin) {
            throw new NexoraException("You do not have permission to delete this item");
        }

        foundItemRepository.delete(item);
    }

    private FoundItemResponseDto mapToResponseDto(FoundItem item) {
        return FoundItemResponseDto.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory())
                .foundLocation(item.getFoundLocation())
                .foundDate(item.getFoundDate())
                .status(item.getStatus())
                .reportedBy(item.getReportedBy())
                .storageLocation(item.getStorageLocation())
                .contactDetails(item.getContactDetails())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
