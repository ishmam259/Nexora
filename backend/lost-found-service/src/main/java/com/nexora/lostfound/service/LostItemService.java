package com.nexora.lostfound.service;

import com.nexora.common.exception.NexoraException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.lostfound.dto.LostItemRequestDto;
import com.nexora.lostfound.dto.LostItemResponseDto;
import com.nexora.lostfound.entity.LostItem;
import com.nexora.lostfound.entity.LostItemStatus;
import com.nexora.lostfound.repository.LostItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LostItemService {

    private final LostItemRepository lostItemRepository;

    @Transactional(readOnly = true)
    public List<LostItemResponseDto> getActiveLostItems(String search, String category) {
        List<LostItem> items;
        if (search != null && !search.isBlank()) {
            items = lostItemRepository.searchLostItems(LostItemStatus.LOST, search);
        } else if (category != null && !category.isBlank()) {
            items = lostItemRepository.findByStatusAndCategoryOrderByCreatedAtDesc(LostItemStatus.LOST, category);
        } else {
            items = lostItemRepository.findByStatusOrderByCreatedAtDesc(LostItemStatus.LOST);
        }
        return items.stream().map(this::mapToResponseDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LostItemResponseDto getLostItemById(Long id) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with ID: " + id));
        return mapToResponseDto(item);
    }

    @Transactional(readOnly = true)
    public List<LostItemResponseDto> getMyLostItems(String reportedBy) {
        return lostItemRepository.findByReportedByOrderByCreatedAtDesc(reportedBy).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LostItemResponseDto reportLostItem(LostItemRequestDto request, String reportedBy) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new NexoraException("Title cannot be empty");
        }
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            throw new NexoraException("Category must be specified");
        }

        LostItem item = LostItem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .lostLocation(request.getLostLocation())
                .lostDate(request.getLostDate() != null ? request.getLostDate() : LocalDateTime.now())
                .reward(request.getReward())
                .status(LostItemStatus.LOST)
                .reportedBy(reportedBy)
                .contactDetails(request.getContactDetails())
                .build();

        LostItem saved = lostItemRepository.save(item);
        return mapToResponseDto(saved);
    }

    @Transactional
    public LostItemResponseDto updateLostItem(Long id, LostItemRequestDto request, String requesterId, boolean isAdmin) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with ID: " + id));

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
        item.setLostLocation(request.getLostLocation());
        if (request.getLostDate() != null) {
            item.setLostDate(request.getLostDate());
        }
        item.setReward(request.getReward());
        item.setContactDetails(request.getContactDetails());

        LostItem saved = lostItemRepository.save(item);
        return mapToResponseDto(saved);
    }

    @Transactional
    public LostItemResponseDto updateStatus(Long id, String status, String requesterId, boolean isAdmin) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with ID: " + id));

        if (!item.getReportedBy().equals(requesterId) && !isAdmin) {
            throw new NexoraException("You do not have permission to change the status of this item");
        }

        try {
            LostItemStatus newStatus = LostItemStatus.valueOf(status.toUpperCase());
            item.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new NexoraException("Invalid status: " + status);
        }

        LostItem saved = lostItemRepository.save(item);
        return mapToResponseDto(saved);
    }

    @Transactional
    public void deleteLostItem(Long id, String requesterId, boolean isAdmin) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with ID: " + id));

        if (!item.getReportedBy().equals(requesterId) && !isAdmin) {
            throw new NexoraException("You do not have permission to delete this item");
        }

        lostItemRepository.delete(item);
    }

    private LostItemResponseDto mapToResponseDto(LostItem item) {
        return LostItemResponseDto.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory())
                .lostLocation(item.getLostLocation())
                .lostDate(item.getLostDate())
                .reward(item.getReward())
                .status(item.getStatus())
                .reportedBy(item.getReportedBy())
                .contactDetails(item.getContactDetails())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
