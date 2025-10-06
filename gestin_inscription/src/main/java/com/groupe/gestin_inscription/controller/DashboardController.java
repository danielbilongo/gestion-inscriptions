package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.repository.ApplicationRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AdministratorRepository administratorRepository;

    @GetMapping("/statistics")
    @PreAuthorize("hasAuthority('ROLE_AGENT') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getStatistics() {
        try {
            List<Application> allApplications = applicationRepository.findAll();
            List<User> allUsers = userRepository.findAll();
            
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalApplications", allApplications.size());
            statistics.put("approvedApplications", allApplications.stream()
                .mapToInt(app -> app.getStatus() == ApplicationStatus.APPROVED ? 1 : 0).sum());
            statistics.put("pendingApplications", allApplications.stream()
                .mapToInt(app -> app.getStatus() == ApplicationStatus.PENDING ? 1 : 0).sum());
            statistics.put("rejectedApplications", allApplications.stream()
                .mapToInt(app -> app.getStatus() == ApplicationStatus.REJECTED ? 1 : 0).sum());
            statistics.put("reviewApplications", allApplications.stream()
                .mapToInt(app -> app.getStatus() == ApplicationStatus.UNDER_REVIEW ? 1 : 0).sum());
            statistics.put("totalUsers", allUsers.size());
            List<Administrator> allAdministrators = administratorRepository.findAll();
            statistics.put("totalAgents", allAdministrators.stream()
                .mapToInt(admin -> admin.getRole() == AdministratorRole.AGENT ? 1 : 0).sum());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", statistics);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la récupération des statistiques");
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/recent-applications")
    @PreAuthorize("hasAuthority('ROLE_AGENT') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getRecentApplications(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<Application> recentApplications = applicationRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getSubmissionDate().compareTo(a.getSubmissionDate()))
                .limit(limit)
                .collect(Collectors.toList());
            
            List<Map<String, Object>> applicationsData = recentApplications.stream()
                .map(app -> {
                    Map<String, Object> appData = new HashMap<>();
                    appData.put("id", app.getId());
                    appData.put("candidatName", app.getApplicantName() != null ? 
                        app.getApplicantName().getFirstName() + " " + app.getApplicantName().getLastName() : "N/A");
                    appData.put("email", app.getApplicantName() != null ? 
                        app.getApplicantName().getEmail() : "N/A");
                    appData.put("status", app.getStatus().toString());
                    appData.put("submissionDate", app.getSubmissionDate());
                    return appData;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applications", applicationsData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la récupération des candidatures récentes");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Endpoints pour les candidats
    @GetMapping("/candidate/statistics")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> getCandidateStatistics() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            User user = userRepository.findByEmail(userEmail)
                .orElse(userRepository.findByUsername(userEmail).orElse(null));
            
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Utilisateur non trouvé");
                return ResponseEntity.status(404).body(error);
            }
            
            List<Application> userApplications = applicationRepository.findAll()
                .stream()
                .filter(app -> app.getApplicantName() != null && app.getApplicantName().getId().equals(user.getId()))
                .collect(Collectors.toList());
            
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalApplications", userApplications.size());
            statistics.put("approvedApplications", userApplications.stream()
                .mapToInt(app -> app.getStatus() == ApplicationStatus.APPROVED ? 1 : 0).sum());
            statistics.put("pendingApplications", userApplications.stream()
                .mapToInt(app -> app.getStatus() == ApplicationStatus.PENDING ? 1 : 0).sum());
            statistics.put("rejectedApplications", userApplications.stream()
                .mapToInt(app -> app.getStatus() == ApplicationStatus.REJECTED ? 1 : 0).sum());
            statistics.put("reviewApplications", userApplications.stream()
                .mapToInt(app -> app.getStatus() == ApplicationStatus.UNDER_REVIEW ? 1 : 0).sum());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", statistics);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la récupération des statistiques: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/candidate/recent-applications")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> getCandidateRecentApplications(@RequestParam(defaultValue = "10") int limit) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            User user = userRepository.findByEmail(userEmail)
                .orElse(userRepository.findByUsername(userEmail).orElse(null));
            
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Utilisateur non trouvé");
                return ResponseEntity.status(404).body(error);
            }
            
            List<Application> userApplications = applicationRepository.findAll()
                .stream()
                .filter(app -> app.getApplicantName() != null && app.getApplicantName().getId().equals(user.getId()))
                .sorted((a, b) -> b.getSubmissionDate().compareTo(a.getSubmissionDate()))
                .limit(limit)
                .collect(Collectors.toList());
            
            List<Map<String, Object>> applicationsData = userApplications.stream()
                .map(app -> {
                    Map<String, Object> appData = new HashMap<>();
                    appData.put("id", app.getId());
                    appData.put("status", app.getStatus().toString());
                    appData.put("submissionDate", app.getSubmissionDate());
                    return appData;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applications", applicationsData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la récupération des candidatures: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Endpoint pour les données du graphique d'évolution des inscriptions par mois
    @GetMapping("/chart/inscriptions-evolution")
    @PreAuthorize("hasAuthority('ROLE_AGENT') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getInscriptionsEvolution() {
        try {
            List<Application> allApplications = applicationRepository.findAll();
            
            // Grouper par mois
            Map<String, Long> monthlyData = allApplications.stream()
                .collect(Collectors.groupingBy(
                    app -> app.getSubmissionDate().getYear() + "-" + 
                           String.format("%02d", app.getSubmissionDate().getMonthValue()),
                    Collectors.counting()
                ));
            
            // Convertir en format pour graphique
            List<Map<String, Object>> chartData = monthlyData.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("month", entry.getKey());
                    point.put("count", entry.getValue());
                    return point;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", chartData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Endpoint pour les données du graphique de répartition par statut
    @GetMapping("/chart/status-distribution")
    @PreAuthorize("hasAuthority('ROLE_AGENT') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getStatusDistribution() {
        try {
            List<Application> allApplications = applicationRepository.findAll();
            
            // Grouper par statut
            Map<ApplicationStatus, Long> statusCounts = allApplications.stream()
                .collect(Collectors.groupingBy(
                    Application::getStatus,
                    Collectors.counting()
                ));
            
            // Convertir en format pour graphique en secteurs
            List<Map<String, Object>> chartData = statusCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> segment = new HashMap<>();
                    segment.put("status", entry.getKey().name());
                    segment.put("label", getStatusLabel(entry.getKey()));
                    segment.put("count", entry.getValue());
                    segment.put("color", getStatusColor(entry.getKey()));
                    return segment;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", chartData);
            response.put("total", allApplications.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    private String getStatusLabel(ApplicationStatus status) {
        switch (status) {
            case APPROVED: return "Approuvées";
            case PENDING: return "En attente";
            case REJECTED: return "Rejetées";
            case UNDER_REVIEW: return "En révision";
            default: return status.name();
        }
    }
    
    private String getStatusColor(ApplicationStatus status) {
        switch (status) {
            case APPROVED: return "#10B981";
            case PENDING: return "#F59E0B";
            case REJECTED: return "#EF4444";
            case UNDER_REVIEW: return "#3B82F6";
            default: return "#6B7280";
        }
    }
}