package com.smartagri.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class YsApiService {
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ys.account-id}")
    private String accountId;

    private static final String TOKEN_URL = "http://42.193.14.241:7000/ysapi/subAccount/getToken";
    private static final String CAPTURE_URL = "https://open.ys7.com/api/lapp/device/capture";
    private static final String LIVE_URL = "https://open.ys7.com/api/lapp/v2/live/address/get";

    public String getAccessToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String requestBody = String.format("{\"accountId\": \"%s\"}", accountId);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                TOKEN_URL,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            }
        } catch (Exception e) {
            return "mock_token_for_testing_123";
        }
        return "mock_token_for_testing_123";
    }

    public String getCameraCapture(String deviceSerial) {
        return null;
    }

    public String getCameraStreamUrl(String deviceSerial) {
        String token = getAccessToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", token);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        String url = LIVE_URL + "?deviceSerial=" + deviceSerial + "&protocol=2";  // protocol 2 for RTMP

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
            );
            return response.getStatusCode() == HttpStatus.OK ?
                response.getBody() :
                "rtmp://rtmp.example.com/live/" + deviceSerial;
        } catch (Exception e) {
            return "rtmp://rtmp.example.com/live/" + deviceSerial;
        }
    }
}
