package com.groupe.gestin_inscription.services.serviceImpl;

import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.repository.ApplicationRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdvancedAnalyticsServiceImpl {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final AdministratorRepository administratorRepository;

    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Statistiques générales
        stats.put("totalApplications", applicationRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalAgents", administratorRepository.countByRole(AdministratorRole.AGENT));
        
        // Statistiques par statut
        Map<String, Long> statusStats = Arrays.stream(ApplicationStatus.values())
                .collect(Collectors.toMap(
                    Enum::name,
                    status -> applicationRepository.countByStatus(status)
                ));
        stats.put("applicationsByStatus", statusStats);
        
        // Taux de complétion
        stats.put("completionRates", getCompletionRateStatistics());
        
        // Tendances temporelles
        stats.put("monthlyTrends", getMonthlyTrends());
        
        // Carte thermique des validations
        stats.put("validationHeatmap", getValidationHeatmap());
        
        // Dossiers bloqués
        stats.put("blockedApplications", getBlockedApplicationsCount());
        
        // Performance des agents
        stats.put("agentPerformance", getAgentPerformanceStats());
        
        return stats;
    }

    public Map<String, Object> getCompletionRateStatistics() {
        List<Application> applications = applicationRepository.findAll();
        
        Map<String, Object> completionStats = new HashMap<>();
        
        // Distribution des taux de complétion
        Map<String, Long> completionDistribution = applications.stream()
                .collect(Collectors.groupingBy(
                    app -> getCompletionRangeLabel(app.getCompletionRate()),
                    Collectors.counting()
                ));
        
        completionStats.put("distribution", completionDistribution);
        
        // Taux moyen de complétion
        double averageCompletion = applications.stream()
                .mapToDouble(Application::getCompletionRate)
                .average()
                .orElse(0.0);
        completionStats.put("average", Math.round(averageCompletion * 100.0) / 100.0);
        
        // Taux de complétion par étape
        completionStats.put("byStep", getCompletionByStep());
        
        return completionStats;
    }

    public List<Map<String, Object>> getMonthlyTrends() {
        List<Application> applications = applicationRepository.findAll();
        
        Map<String, Long> monthlySubmissions = applications.stream()
                .filter(app -> app.getSubmissionDate() != null)
                .collect(Collectors.groupingBy(
                    app -> app.getSubmissionDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                    Collectors.counting()
                ));
        
        return monthlySubmissions.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> monthData = new HashMap<>();
                    monthData.put("month", entry.getKey());
                    monthData.put("submissions", entry.getValue());
                    return monthData;
                })
                .sorted((a, b) -> ((String) a.get("month")).compareTo((String) b.get("month")))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getValidationHeatmap() {
        List<Application> applications = applicationRepository.findAll();
        
        Map<String, Object> heatmapData = new HashMap<>();
        
        // Validations par jour de la semaine
        Map<String, Long> dayOfWeekValidations = applications.stream()
                .filter(app -> app.getLastUpdated() != null)
                .collect(Collectors.groupingBy(
                    app -> app.getLastUpdated().getDayOfWeek().toString(),
                    Collectors.counting()
                ));
        
        // Validations par heure
        Map<String, Long> hourlyValidations = applications.stream()
                .filter(app -> app.getLastUpdated() != null)
                .collect(Collectors.groupingBy(
                    app -> String.valueOf(app.getLastUpdated().getHour()),
                    Collectors.counting()
                ));
        
        heatmapData.put("byDayOfWeek", dayOfWeekValidations);
        heatmapData.put("byHour", hourlyValidations);
        
        return heatmapData;
    }

    public Map<String, Object> getBlockedApplicationsCount() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(48);
        
        List<Application> blockedApplications = applicationRepository.findAll().stream()
                .filter(app -> app.getStatus() == ApplicationStatus.MANUAL_REVIEW)
                .filter(app -> app.getLastUpdated() != null && app.getLastUpdated().isBefore(cutoffTime))
                .collect(Collectors.toList());
        
        Map<String, Object> blockedStats = new HashMap<>();
        blockedStats.put("count", blockedApplications.size());
        blockedStats.put("applications", blockedApplications.stream()
                .map(app -> {
                    Map<String, Object> appData = new HashMap<>();
                    appData.put("id", app.getId());
                    appData.put("applicantName", app.getApplicantName().getFirstName() + " " + app.getApplicantName().getLastName());
                    appData.put("submissionDate", app.getSubmissionDate());
                    appData.put("daysSinceSubmission", java.time.Duration.between(app.getSubmissionDate(), LocalDateTime.now()).toDays());
                    return appData;
                })
                .collect(Collectors.toList()));
        
        return blockedStats;
    }

    public Map<String, Object> getAgentPerformanceStats() {
        List<Application> processedApplications = applicationRepository.findAll().stream()
                .filter(app -> app.getAssignedAdmin() != null)
                .filter(app -> app.getStatus() == ApplicationStatus.APPROVED || app.getStatus() == ApplicationStatus.REJECTED)
                .collect(Collectors.toList());
        
        Map<String, Object> performanceStats = new HashMap<>();
        
        // Applications traitées par agent
        Map<String, Long> applicationsByAgent = processedApplications.stream()
                .collect(Collectors.groupingBy(
                    app -> app.getAssignedAdmin().getUserName(),
                    Collectors.counting()
                ));
        
        // Temps moyen de traitement par agent
        Map<String, Double> avgProcessingTimeByAgent = processedApplications.stream()
                .filter(app -> app.getSubmissionDate() != null && app.getLastUpdated() != null)
                .collect(Collectors.groupingBy(
                    app -> app.getAssignedAdmin().getUserName(),
                    Collectors.averagingLong(app -> 
                        java.time.Duration.between(app.getSubmissionDate(), app.getLastUpdated()).toHours())
                ));
        
        performanceStats.put("applicationsByAgent", applicationsByAgent);
        performanceStats.put("avgProcessingTimeByAgent", avgProcessingTimeByAgent);
        
        return performanceStats;
    }

    public List<Map<String, Object>> getTopCountriesStatistics() {
        List<Application> applications = applicationRepository.findAll();
        
        Map<String, Long> countryCounts = applications.stream()
                .filter(app -> app.getApplicantName() != null && app.getApplicantName().getNationality() != null)
                .collect(Collectors.groupingBy(
                    app -> app.getApplicantName().getNationality(),
                    Collectors.counting()
                ));
        
        return countryCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> countryData = new HashMap<>();
                    countryData.put("country", entry.getKey());
                    countryData.put("count", entry.getValue());
                    return countryData;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
                .limit(10)
                .collect(Collectors.toList());
    }

    private String getCompletionRangeLabel(double completionRate) {
        if (completionRate < 25) return "0-25%";
        if (completionRate < 50) return "25-50%";
        if (completionRate < 75) return "50-75%";
        if (completionRate < 100) return "75-99%";
        return "100%";
    }

    private Map<String, Double> getCompletionByStep() {
        // Simulation des étapes de complétion
        Map<String, Double> stepCompletion = new HashMap<>();
        stepCompletion.put("personalInfo", 95.5);
        stepCompletion.put("documents", 78.2);
        stepCompletion.put("academicHistory", 85.7);
        stepCompletion.put("contactInfo", 92.1);
        stepCompletion.put("review", 67.8);
        
        return stepCompletion;
    }
}