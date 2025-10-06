package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.dto.response.CountryStatisticsDto;
import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import com.groupe.gestin_inscription.services.serviceImpl.ApplicationServiceImpl;
import com.groupe.gestin_inscription.services.serviceImpl.UserServiceImpl;
import com.groupe.gestin_inscription.services.serviceImpl.NotificationServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/statistics")
@Tag(name = "Statistics", description = "Endpoints for dashboard statistics")
public class StatisticsController {

    @Autowired
    private ApplicationServiceImpl applicationService;
    
    @Autowired
    private UserServiceImpl userService;
    
    @Autowired
    private NotificationServiceImpl notificationService;

    @Operation(summary = "Get dashboard statistics for admin")
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('AGENT')")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Optimisation: Récupérer toutes les applications une seule fois
        List<Application> allApplications = applicationService.getAllApplications();
        long totalApplications = allApplications.size();
        
        // Compter par statut en une seule itération
        Map<ApplicationStatus, Long> statusCounts = allApplications.stream()
                .collect(Collectors.groupingBy(Application::getStatus, Collectors.counting()));
        
        long approvedApplications = statusCounts.getOrDefault(ApplicationStatus.APPROVED, 0L);
        long pendingApplications = statusCounts.getOrDefault(ApplicationStatus.PRE_VALIDATION, 0L);
        long rejectedApplications = statusCounts.getOrDefault(ApplicationStatus.REJECTED, 0L);
        long reviewApplications = statusCounts.getOrDefault(ApplicationStatus.MANUAL_REVIEW, 0L);
        
        // Statistiques des utilisateurs
        long totalUsers = userService.getAllUsers().size();
        
        // Statistiques des notifications (approximation)
        long totalNotifications = 0; // TODO: Implémenter si nécessaire
        
        stats.put("totalApplications", totalApplications);
        stats.put("approvedApplications", approvedApplications);
        stats.put("pendingApplications", pendingApplications);
        stats.put("rejectedApplications", rejectedApplications);
        stats.put("reviewApplications", reviewApplications);
        stats.put("totalUsers", totalUsers);
        stats.put("totalNotifications", totalNotifications);
        
        // Calcul des pourcentages
        if (totalApplications > 0) {
            stats.put("approvalRate", (double) approvedApplications / totalApplications * 100);
            stats.put("rejectionRate", (double) rejectedApplications / totalApplications * 100);
            stats.put("pendingRate", (double) pendingApplications / totalApplications * 100);
        } else {
            stats.put("approvalRate", 0.0);
            stats.put("rejectionRate", 0.0);
            stats.put("pendingRate", 0.0);
        }
        
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get statistics by status")
    @GetMapping("/by-status")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('AGENT')")
    public ResponseEntity<Map<String, Long>> getStatisticsByStatus() {
        // Optimisation: Une seule requête pour tous les statuts
        List<Application> allApplications = applicationService.getAllApplications();
        
        Map<String, Long> statusStats = allApplications.stream()
                .collect(Collectors.groupingBy(
                    app -> app.getStatus().name(),
                    Collectors.counting()
                ));
        
        return ResponseEntity.ok(statusStats);
    }

    @Operation(summary = "Get monthly statistics")
    @GetMapping("/monthly")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('AGENT')")
    public ResponseEntity<Map<String, Object>> getMonthlyStatistics() {
        Map<String, Object> monthlyStats = new HashMap<>();
        
        // Optimisation: Utiliser le cache des applications déjà récupérées
        // TODO: Implémenter les statistiques mensuelles basées sur submissionDate
        // Pour l'instant, retourner des données basiques
        long totalThisMonth = applicationService.getAllApplications().size();
        
        monthlyStats.put("applicationsThisMonth", totalThisMonth);
        monthlyStats.put("growthRate", 12.0); // Placeholder
        monthlyStats.put("averageProcessingTime", 5.2); // Placeholder en jours
        
        return ResponseEntity.ok(monthlyStats);
    }

    @Operation(summary = "Get statistics by country")
    @GetMapping("/by-country")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('AGENT')")
    public ResponseEntity<List<CountryStatisticsDto>> getStatisticsByCountry() {
        List<Application> allApplications = applicationService.getAllApplications();
        long totalApplications = allApplications.size();
        
        // Mapping des codes pays vers noms complets
        Map<String, String> countryNames = new HashMap<>();
        countryNames.put("FR", "France");
        countryNames.put("DZ", "Algérie");
        countryNames.put("MA", "Maroc");
        countryNames.put("TN", "Tunisie");
        countryNames.put("SN", "Sénégal");
        countryNames.put("CI", "Côte d'Ivoire");
        countryNames.put("CM", "Cameroun");
        countryNames.put("BF", "Burkina Faso");
        countryNames.put("ML", "Mali");
        countryNames.put("NE", "Niger");
        
        // Compter les candidatures par nationalité
        Map<String, Long> countryCount = allApplications.stream()
            .filter(app -> app.getApplicantName() != null && app.getApplicantName().getNationality() != null)
            .collect(Collectors.groupingBy(
                app -> app.getApplicantName().getNationality(),
                Collectors.counting()
            ));
        
        // Convertir en DTO avec pourcentages
        List<CountryStatisticsDto> countryStats = countryCount.entrySet().stream()
            .map(entry -> {
                String countryCode = entry.getKey();
                Long count = entry.getValue();
                String countryName = countryNames.getOrDefault(countryCode, countryCode);
                Double percentage = totalApplications > 0 ? (double) count / totalApplications * 100 : 0.0;
                
                return new CountryStatisticsDto(countryName, countryCode, count, percentage);
            })
            .sorted((a, b) -> Long.compare(b.getCount(), a.getCount())) // Tri par nombre décroissant
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(countryStats);
    }
}
