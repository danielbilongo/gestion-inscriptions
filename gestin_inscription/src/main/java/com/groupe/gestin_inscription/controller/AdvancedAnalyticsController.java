package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.services.serviceImpl.AdvancedAnalyticsServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Advanced Analytics", description = "Comprehensive analytics and reporting endpoints")
public class AdvancedAnalyticsController {

    private final AdvancedAnalyticsServiceImpl analyticsService;

    @Operation(summary = "Get comprehensive dashboard statistics")
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        Map<String, Object> statistics = analyticsService.getDashboardStatistics();
        return ResponseEntity.ok(statistics);
    }

    @Operation(summary = "Get completion rate statistics by step")
    @GetMapping("/completion-rates")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getCompletionRateStatistics() {
        Map<String, Object> completionStats = analyticsService.getCompletionRateStatistics();
        return ResponseEntity.ok(completionStats);
    }

    @Operation(summary = "Get monthly submission trends")
    @GetMapping("/trends/monthly")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyTrends() {
        List<Map<String, Object>> trends = analyticsService.getMonthlyTrends();
        return ResponseEntity.ok(trends);
    }

    @Operation(summary = "Get validation heatmap data")
    @GetMapping("/heatmap/validations")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getValidationHeatmap() {
        Map<String, Object> heatmapData = analyticsService.getValidationHeatmap();
        return ResponseEntity.ok(heatmapData);
    }

    @Operation(summary = "Get blocked applications (>48h in manual review)")
    @GetMapping("/blocked-applications")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getBlockedApplications() {
        Map<String, Object> blockedStats = analyticsService.getBlockedApplicationsCount();
        return ResponseEntity.ok(blockedStats);
    }

    @Operation(summary = "Get agent performance statistics")
    @GetMapping("/agent-performance")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAgentPerformanceStats() {
        Map<String, Object> performanceStats = analyticsService.getAgentPerformanceStats();
        return ResponseEntity.ok(performanceStats);
    }

    @Operation(summary = "Get top countries by application count")
    @GetMapping("/countries/top")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getTopCountriesStatistics() {
        List<Map<String, Object>> countryStats = analyticsService.getTopCountriesStatistics();
        return ResponseEntity.ok(countryStats);
    }
}