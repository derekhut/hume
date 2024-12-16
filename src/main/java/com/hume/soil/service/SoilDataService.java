package com.hume.soil.service;

import com.hume.soil.model.SoilData;
import com.hume.soil.repository.SoilDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SoilDataService {
    private final SoilDataRepository soilDataRepository;

    public SoilData saveSoilData(SoilData soilData) {
        return soilDataRepository.save(soilData);
    }
}
