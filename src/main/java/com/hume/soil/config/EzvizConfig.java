package com.hume.soil.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "ezviz")
@Data
public class EzvizConfig {
    private String apiUrl;
    private String appKey;
    private String appSecret;
    private String accessToken;
}
