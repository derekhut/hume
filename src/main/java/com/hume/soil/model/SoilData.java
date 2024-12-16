package com.hume.soil.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class SoilData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "设备ID不能为空")
    private String deviceId;

    @NotNull(message = "温度不能为空")
    private Double temperature;

    @NotNull(message = "湿度不能为空")
    private Double humidity;

    @NotNull(message = "电导率不能为空")
    private Double ec;

    @NotNull(message = "pH值不能为空")
    private Double ph;

    @NotNull(message = "氮含量不能为空")
    private Double n;

    @NotNull(message = "磷含量不能为空")
    private Double p;

    @NotNull(message = "钾含量不能为空")
    private Double k;

    private LocalDateTime timestamp = LocalDateTime.now();
}
