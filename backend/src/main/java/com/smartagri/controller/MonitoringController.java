package com.smartagri.controller;

import com.smartagri.service.FboxApiService;
import com.smartagri.service.YsApiService;
import com.smartagri.model.Greenhouse;
import com.smartagri.model.SensorData;
import com.smartagri.repository.GreenhouseRepository;
import com.smartagri.repository.SensorDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/monitoring")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MonitoringController {
    private final FboxApiService fboxApiService;
    private final YsApiService ysApiService;
    private final GreenhouseRepository greenhouseRepository;
    private final SensorDataRepository sensorDataRepository;

    @PostMapping("/greenhouses")
    public ResponseEntity<Greenhouse> createGreenhouse(@RequestBody Greenhouse greenhouse) {
        return ResponseEntity.ok(greenhouseRepository.save(greenhouse));
    }

    @PostMapping("/sensor-data")
    public ResponseEntity<List<SensorData>> addSensorData(@RequestBody List<SensorData> sensorDataList) {
        for (SensorData data : sensorDataList) {
            if (data.getTimestamp() == null) {
                data.setTimestamp(LocalDateTime.now());
            }
        }
        return ResponseEntity.ok(sensorDataRepository.saveAll(sensorDataList));
    }

    @GetMapping("/greenhouses")
    public ResponseEntity<List<Greenhouse>> getAllGreenhouses() {
        return ResponseEntity.ok(greenhouseRepository.findAll());
    }

    @GetMapping("/greenhouses/{boxNo}/sensors")
    public ResponseEntity<List<SensorData>> getGreenhouseSensorData(@PathVariable String boxNo) {
        return ResponseEntity.ok(sensorDataRepository.findByGreenhouseBoxNo(boxNo));
    }

    @GetMapping("/greenhouses/{boxNo}/camera")
    public ResponseEntity<String> getGreenhouseCamera(@PathVariable String boxNo) {
        String cameraUrl = ysApiService.getCameraStreamUrl(boxNo);
        return ResponseEntity.ok(cameraUrl);
    }

    @GetMapping("/sensor-data/latest")
    public ResponseEntity<List<SensorData>> getLatestSensorData() {
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        return ResponseEntity.ok(sensorDataRepository.findLatestSensorData(oneDayAgo));
    }

    @GetMapping("/greenhouse/status")
    public ResponseEntity<List<Greenhouse>> getGreenhouseStatus() {
        return ResponseEntity.ok(greenhouseRepository.findAllWithLatestSensorData());
    }

    @GetMapping("/sensor-data/history")
    public ResponseEntity<List<SensorData>> getSensorHistory(
            @RequestParam String boxNo,
            @RequestParam(required = false) LocalDateTime startTime,
            @RequestParam(required = false) LocalDateTime endTime) {
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(7);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        return ResponseEntity.ok(sensorDataRepository.findByGreenhouseBoxNoAndTimestampBetween(
                boxNo, startTime, endTime));
    }

    @GetMapping("/weather")
    public ResponseEntity<Object> getWeatherData(
            @RequestParam String boxNo,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(Map.of(
            "temperature", 22.5,
            "humidity", 68,
            "condition", "Partly Cloudy",
            "windSpeed", 12.3,
            "rainfall", 0.0,
            "forecast", List.of(
                Map.of("date", LocalDateTime.now().plusDays(1), "temp", 23.0, "condition", "Sunny"),
                Map.of("date", LocalDateTime.now().plusDays(2), "temp", 21.5, "condition", "Rain"),
                Map.of("date", LocalDateTime.now().plusDays(3), "temp", 22.0, "condition", "Cloudy")
            )
        ));
    }

    @GetMapping("/batch-status")
    public ResponseEntity<Object> getBatchProcessingStatus() {
        return ResponseEntity.ok(Map.of(
            "lastProcessed", LocalDateTime.now(),
            "totalRecords", 1250,
            "processedToday", 150,
            "failedJobs", 0,
            "activeJobs", 2,
            "queuedJobs", 5,
            "systemHealth", "GOOD"
        ));
    }
}
