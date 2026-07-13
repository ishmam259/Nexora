package com.nexora.medical.repository;

import com.nexora.medical.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByActive(boolean active);
    List<Medicine> findByNameContainingIgnoreCaseAndActive(String name, boolean active);
}
