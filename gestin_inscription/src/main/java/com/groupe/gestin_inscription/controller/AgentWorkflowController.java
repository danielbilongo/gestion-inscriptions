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
@RequestMapping("/api/agent")
@Tag(name = "Agent Workflow", description = "Actions des agents sur les candidatures")
public class AgentWorkflowController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @PostMapping("/applications/{applicationId}/validate")
    @PreAuthorize("hasRole('AGENT')")
    @Operation(summary = "Agent valide une candidature pour révision admin")
    public ResponseEntity<?> validateApplication(
            @PathVariable Long applicationId,
            @RequestBody Map<String, Object> validationData) {
        
        try {
            Optional<Application> appOpt = applicationRepository.findById(applicationId);
            if (appOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Application app = appOpt.get();
            app.setStatus(ApplicationStatus.AGENT_VALIDATED);
            app.setLastUpdated(LocalDateTime.now());
            applicationRepository.save(app);

            String agentComment = (String) validationData.get("comment");
            Boolean documentsValid = (Boolean) validationData.get("documentsValid");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Candidature validée par l'agent - En attente d'approbation admin");
            response.put("applicationId", applicationId);
            response.put("newStatus", "AGENT_VALIDATED");
            response.put("agentComment", agentComment);
            response.put("documentsValid", documentsValid);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la validation agent");
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/applications/{applicationId}/request-changes")
    @PreAuthorize("hasRole('AGENT')")
    @Operation(summary = "Agent demande des modifications")
    public ResponseEntity<?> requestChanges(
            @PathVariable Long applicationId,
            @RequestBody Map<String, Object> requestData) {
        
        try {
            Optional<Application> appOpt = applicationRepository.findById(applicationId);
            if (appOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Application app = appOpt.get();
            app.setStatus(ApplicationStatus.CHANGES_REQUESTED);
            app.setLastUpdated(LocalDateTime.now());
            applicationRepository.save(app);

            String agentComment = (String) requestData.get("comment");
            String requiredChanges = (String) requestData.get("requiredChanges");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Modifications demandées au candidat");
            response.put("applicationId", applicationId);
            response.put("newStatus", "CHANGES_REQUESTED");
            response.put("agentComment", agentComment);
            response.put("requiredChanges", requiredChanges);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la demande de modifications");
            return ResponseEntity.status(500).body(error);
        }
    }
}