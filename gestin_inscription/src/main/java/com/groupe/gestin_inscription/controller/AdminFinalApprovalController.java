package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import com.groupe.gestin_inscription.repository.ApplicationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Final Approval", description = "Validation finale des candidatures par l'admin")
public class AdminFinalApprovalController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @PostMapping("/applications/{applicationId}/final-approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Approbation finale - génère la fiche d'inscription")
    public ResponseEntity<?> finalApprove(@PathVariable Long applicationId) {
        
        try {
            Optional<Application> appOpt = applicationRepository.findById(applicationId);
            if (appOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Application app = appOpt.get();
            
            // Vérifier que l'agent a validé
            if (!app.getStatus().equals(ApplicationStatus.AGENT_VALIDATED)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "La candidature doit être validée par un agent d'abord");
                return ResponseEntity.badRequest().body(error);
            }

            app.setStatus(ApplicationStatus.APPROVED);
            app.setLastUpdated(LocalDateTime.now());
            applicationRepository.save(app);

            // Générer la fiche d'inscription (simulation)
            String registrationFormUrl = generateRegistrationForm(applicationId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Candidature approuvée définitivement");
            response.put("applicationId", applicationId);
            response.put("newStatus", "APPROVED");
            response.put("registrationFormUrl", registrationFormUrl);
            response.put("canDownloadForm", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de l'approbation finale");
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/applications/pending-approval")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Liste des candidatures validées par les agents en attente d'approbation")
    public ResponseEntity<?> getPendingApprovals() {
        
        try {
            // Récupérer les candidatures validées par les agents
            var pendingApprovals = applicationRepository.findByStatus(ApplicationStatus.AGENT_VALIDATED);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applications", pendingApprovals);
            response.put("count", pendingApprovals.size());
            response.put("message", "Candidatures en attente d'approbation finale");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors du chargement des candidatures");
            return ResponseEntity.status(500).body(error);
        }
    }

    private String generateRegistrationForm(Long applicationId) {
        // Simulation de génération de fiche d'inscription
        return "/api/registration-forms/download/" + applicationId + "?token=" + System.currentTimeMillis();
    }
}