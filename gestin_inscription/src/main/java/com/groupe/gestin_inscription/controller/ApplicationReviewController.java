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
@RequestMapping("/api/applications")
@Tag(name = "Application Review", description = "Endpoints pour traiter et réviser les candidatures")
public class ApplicationReviewController {

    @Autowired
    private ApplicationRepository applicationRepository;



    @PostMapping("/{applicationId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Approuver une candidature")
    public ResponseEntity<?> approveApplication(
            @PathVariable Long applicationId,
            @RequestBody(required = false) Map<String, String> requestBody) {
        
        try {
            Optional<Application> appOpt = applicationRepository.findById(applicationId);
            if (appOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Application app = appOpt.get();
            app.setStatus(ApplicationStatus.APPROVED);
            app.setLastUpdated(LocalDateTime.now());
            applicationRepository.save(app);

            String comment = requestBody != null ? requestBody.get("comment") : null;

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Candidature approuvée avec succès");
            response.put("applicationId", applicationId);
            response.put("newStatus", "APPROVED");
            if (comment != null) {
                response.put("comment", comment);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de l'approbation");
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/{applicationId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Rejeter une candidature avec motif personnalisé")
    public ResponseEntity<?> rejectApplication(
            @PathVariable Long applicationId,
            @RequestBody Map<String, Object> requestBody) {
        
        try {
            Optional<Application> appOpt = applicationRepository.findById(applicationId);
            if (appOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            String reason = (String) requestBody.get("reason");
            String nonCompliantDocument = (String) requestBody.get("nonCompliantDocument");
            String customMessage = (String) requestBody.get("customMessage");

            Application app = appOpt.get();
            app.setStatus(ApplicationStatus.REJECTED);
            app.setLastUpdated(LocalDateTime.now());
            applicationRepository.save(app);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Candidature rejetée");
            response.put("applicationId", applicationId);
            response.put("newStatus", "REJECTED");
            response.put("rejectionReason", reason);
            response.put("nonCompliantDocument", nonCompliantDocument);
            response.put("customMessage", customMessage);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors du rejet");
            return ResponseEntity.status(500).body(error);
        }
    }
}