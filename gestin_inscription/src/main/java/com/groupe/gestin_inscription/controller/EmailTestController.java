package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.services.serviceImpl.EmailNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@Tag(name = "Email Test", description = "Endpoints for testing email functionality")
public class EmailTestController {

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Operation(summary = "Test email sending functionality")
    @PostMapping("/email")
    public ResponseEntity<?> testEmail(@RequestParam String toEmail, 
                                     @RequestParam(defaultValue = "Test User") String candidateName) {
        try {
            // Test document rejection email
            emailNotificationService.sendDocumentRejectionEmail(
                toEmail,
                candidateName,
                "Document de test",
                "Ceci est un test d'envoi d'email pour le rejet de document."
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email de test envoyé avec succès");
            response.put("recipient", toEmail);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de l'envoi de l'email");
            error.put("error", e.getMessage());
            
            return ResponseEntity.status(500).body(error);
        }
    }

    @Operation(summary = "Test approval email")
    @PostMapping("/email/approval")
    public ResponseEntity<?> testApprovalEmail(@RequestParam String toEmail, 
                                             @RequestParam(defaultValue = "Test User") String candidateName) {
        try {
            emailNotificationService.sendApplicationApprovalEmail(toEmail, candidateName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email d'approbation envoyé avec succès");
            response.put("recipient", toEmail);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de l'envoi de l'email d'approbation");
            error.put("error", e.getMessage());
            
            return ResponseEntity.status(500).body(error);
        }
    }
}