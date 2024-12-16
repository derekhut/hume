package com.hume.soil.controller;

import com.hume.soil.dto.ApiResponse;
import com.hume.soil.model.SoilData;
import com.hume.soil.service.SoilDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/soil")
@RequiredArgsConstructor
public class SoilDataController {
    private final SoilDataService soilDataService;

    @PostMapping("/data")
    public ResponseEntity<ApiResponse<SoilData>> receiveSoilData(@RequestBody SoilData soilData) {
        SoilData savedData = soilDataService.saveSoilData(soilData);
        return ResponseEntity.ok(ApiResponse.success(savedData));
    }
}
