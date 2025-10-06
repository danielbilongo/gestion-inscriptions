package com.groupe.gestin_inscription.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardAnalyticsDTO {
    private Long totalApplications;
    private List pendingApplications;
    private List approvedApplications;
    private List rejectedApplications;
    private Map<String, Integer> completionRateByStep;
    // Getters and Setters
}