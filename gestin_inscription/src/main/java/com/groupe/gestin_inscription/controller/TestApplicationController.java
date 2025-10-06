package com.groupe.gestin_inscription.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.groupe.gestin_inscription.services.serviceImpl.ApplicationServiceImpl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test-applications")
public class TestApplicationController {

    @Autowired
    private ApplicationServiceImpl applicationServiceImpl;

    @PostMapping("/test-duplicate-error")
    public ResponseEntity<?> testDuplicateError() {
        try {
            // Simuler une tentative de création d'application pour un utilisateur existant
            applicationServiceImpl.createFromExistingUser("techcytchi@gmail.com", new ArrayList<>());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Candidature créée avec succès");
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("code", "ALREADY_SUBMITTED");
            error.put("message", "Candidature déjà soumise");
            error.put("details", "Vous avez déjà soumis une candidature pour cette session. Une seule candidature par utilisateur est autorisée.");
            error.put("action", "Consultez le statut de votre candidature existante dans 'Mes Candidatures'.");
            return ResponseEntity.status(409).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("code", "SERVER_ERROR");
            error.put("message", "Erreur du serveur");
            error.put("details", "Une erreur technique s'est produite: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}