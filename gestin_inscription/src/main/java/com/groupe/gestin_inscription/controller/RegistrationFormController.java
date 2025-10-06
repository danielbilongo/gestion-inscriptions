package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import com.groupe.gestin_inscription.repository.ApplicationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/registration-forms")
@Tag(name = "Registration Forms", description = "Téléchargement des fiches d'inscription")
public class RegistrationFormController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @GetMapping("/download/{applicationId}")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'CANDIDAT')")
    @Operation(summary = "Télécharger la fiche d'inscription (candidat approuvé)")
    public ResponseEntity<?> downloadRegistrationForm(
            @PathVariable Long applicationId,
            @RequestParam String token) {
        
        try {
            Optional<Application> appOpt = applicationRepository.findById(applicationId);
            if (appOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Application app = appOpt.get();
            
            // Vérifier que la candidature est approuvée
            if (!app.getStatus().equals(ApplicationStatus.APPROVED)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Candidature non approuvée - fiche non disponible");
                return ResponseEntity.badRequest().body(error);
            }

            // Générer le PDF de la fiche d'inscription
            byte[] pdfContent = generateRegistrationFormPDF(app);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "fiche_inscription_" + applicationId + ".pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);
                    
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la génération de la fiche");
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/status/{applicationId}")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'CANDIDAT')")
    @Operation(summary = "Vérifier si la fiche d'inscription est disponible")
    public ResponseEntity<?> checkFormAvailability(@PathVariable Long applicationId) {
        
        try {
            Optional<Application> appOpt = applicationRepository.findById(applicationId);
            if (appOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Application app = appOpt.get();
            boolean isAvailable = app.getStatus().equals(ApplicationStatus.APPROVED);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applicationId", applicationId);
            response.put("status", app.getStatus().name());
            response.put("formAvailable", isAvailable);
            response.put("downloadUrl", isAvailable ? "/api/registration-forms/download/" + applicationId : null);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la vérification");
            return ResponseEntity.status(500).body(error);
        }
    }

    private byte[] generateRegistrationFormPDF(Application application) {
        // Simulation de génération PDF
        String pdfContent = "FICHE D'INSCRIPTION\n" +
                "===================\n" +
                "Candidature ID: " + application.getId() + "\n" +
                "Statut: APPROUVÉ\n" +
                "Date d'approbation: " + application.getLastUpdated() + "\n" +
                "\nCette fiche confirme votre inscription.\n" +
                "Veuillez la présenter lors de votre arrivée.\n";
        
        return pdfContent.getBytes();
    }
}