package com.nexora.lostfound.repository;

import com.nexora.lostfound.entity.FoundItem;
import com.nexora.lostfound.entity.FoundItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {

    List<FoundItem> findByReportedByOrderByCreatedAtDesc(String reportedBy);

    List<FoundItem> findByStatusOrderByCreatedAtDesc(FoundItemStatus status);

    @Query("SELECT f FROM FoundItem f WHERE f.status = :status AND " +
           "(LOWER(f.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.foundLocation) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY f.createdAt DESC")
    List<FoundItem> searchFoundItems(@Param("status") FoundItemStatus status, @Param("search") String search);

    List<FoundItem> findByStatusAndCategoryOrderByCreatedAtDesc(FoundItemStatus status, String category);
}
