package com.groupe.gestin_inscription.services.serviceInterfaces;

import com.groupe.gestin_inscription.dto.response.ApplicationStatusResponseDto;
import com.groupe.gestin_inscription.dto.response.DashboardAnalyticsDTO;

import java.util.List;

public interface AnalyticsService {
    public DashboardAnalyticsDTO getRealTimeStatistics();
    public List<ApplicationStatusResponseDto> getAlerts();

}
