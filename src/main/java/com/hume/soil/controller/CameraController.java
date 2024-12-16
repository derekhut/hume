package com.hume.soil.controller;

import com.hume.soil.dto.ApiResponse;
import com.hume.soil.service.CameraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

@RestController
@RequestMapping("/api/camera")
@RequiredArgsConstructor
@Validated
public class CameraController {
    private final CameraService cameraService;

    @PostMapping("/capture")
    public ResponseEntity<ApiResponse<Map<String, String>>> captureImage(
            @RequestParam @NotNull(message = "设备序列号不能为空") String deviceSerial,
            @RequestParam @NotNull(message = "通道号不能为空") Integer channelNo,
            @RequestParam(required = false) Integer quality) {
        Map<String, String> result = cameraService.captureImage(deviceSerial, channelNo, quality);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
