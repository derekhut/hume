package com.smartagri.repository;

import com.smartagri.model.Greenhouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GreenhouseRepository extends JpaRepository<Greenhouse, String> {
    @Query("SELECT DISTINCT g FROM Greenhouse g LEFT JOIN FETCH g.sensorData sd WHERE sd.timestamp = " +
            "(SELECT MAX(sd2.timestamp) FROM SensorData sd2 WHERE sd2.greenhouse = g)")
    List<Greenhouse> findAllWithLatestSensorData();
}
