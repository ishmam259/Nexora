package com.nexora.lostfound.repository;

import com.nexora.lostfound.entity.LostItem;
import com.nexora.lostfound.entity.LostItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long> {

    List<LostItem> findByReportedByOrderByCreatedAtDesc(String reportedBy);

    List<LostItem> findByStatusOrderByCreatedAtDesc(LostItemStatus status);

    @Query("SELECT l FROM LostItem l WHERE l.status = :status AND " +
           "(LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.lostLocation) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY l.createdAt DESC")
    List<LostItem> searchLostItems(@Param("status") LostItemStatus status, @Param("search") String search);

    List<LostItem> findByStatusAndCategoryOrderByCreatedAtDesc(LostItemStatus status, String category);
}
