package com.smartagri.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sensor_data")
public class SensorData {
    @Id
    private String sensorId;

    @ManyToOne
    @JoinColumn(name = "box_no")
    private Greenhouse greenhouse;

    private String name;
    private String unit;
    private Double value;
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private SensorType type;
}
