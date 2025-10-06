package com.groupe.gestin_inscription.dto.response;

import java.util.List;
import java.util.Map;

public class AdminDashboardDto {
    private long totalApplications;
    private Map<String, Long> applicationsByStatus;
    private Map<String, Integer> completionRateByStep;
    private List<String> alerts; // e.g., "Dossiers bloqués >48h"
    // Getters and Setters
}
