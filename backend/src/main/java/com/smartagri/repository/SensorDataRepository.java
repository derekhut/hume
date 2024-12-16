package com.smartagri.repository;

import com.smartagri.model.SensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface SensorDataRepository extends JpaRepository<SensorData, String> {
    List<SensorData> findByGreenhouseBoxNo(String boxNo);
    List<SensorData> findByGreenhouseBoxNoAndType(String boxNo, String type);

    @Query("SELECT s FROM SensorData s WHERE s.timestamp >= :oneDayAgo ORDER BY s.timestamp DESC")
    List<SensorData> findLatestSensorData(@Param("oneDayAgo") LocalDateTime oneDayAgo);

    List<SensorData> findByGreenhouseBoxNoAndTimestampBetween(
            String boxNo, LocalDateTime startTime, LocalDateTime endTime);
}
