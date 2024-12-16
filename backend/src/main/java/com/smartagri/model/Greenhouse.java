package com.smartagri.model;

import lombok.Data;
import javax.persistence.*;
import java.util.List;

@Data
@Entity
@Table(name = "greenhouses")
public class Greenhouse {
    @Id
    private String boxNo;
    private String name;

    @OneToMany(mappedBy = "greenhouse", cascade = CascadeType.ALL)
    private List<SensorData> sensorData;

    private String cameraId;
    private String cameraUrl;
}
