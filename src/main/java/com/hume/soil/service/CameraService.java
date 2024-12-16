package com.hume.soil.service;

import com.hume.soil.config.EzvizConfig;
import com.hume.soil.repository.CameraDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CameraService {
    private final CameraDeviceRepository cameraDeviceRepository;
    private final EzvizConfig ezvizConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, String> captureImage(String deviceSerial, Integer channelNo, Integer quality) {
        String captureUrl = ezvizConfig.getApiUrl() + "/device/capture";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("accessToken", ezvizConfig.getAccessToken());
        map.add("deviceSerial", deviceSerial);
        map.add("channelNo", channelNo.toString());
        if (quality != null) {
            map.add("quality", quality.toString());
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(
                captureUrl,
                request,
                Map.class
            );

            if (response != null && response.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, String> data = (Map<String, String>) response.get("data");
                return Map.of("picUrl", data.get("picUrl"));
            }

            throw new RuntimeException("Failed to capture image from camera");
        } catch (Exception e) {
            throw new RuntimeException("Error capturing image: " + e.getMessage());
        }
    }
}
