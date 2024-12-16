package com.hume.soil.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class CameraDevice {
    @Id
    private String deviceSerial;
    private Integer channelNo;
    private String accessToken;
    private Integer quality;
}
