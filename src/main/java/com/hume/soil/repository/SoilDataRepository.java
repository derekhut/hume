package com.hume.soil.repository;

import com.hume.soil.model.SoilData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SoilDataRepository extends JpaRepository<SoilData, Long> {
}
