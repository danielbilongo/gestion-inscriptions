package com.groupe.gestin_inscription.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.groupe.gestin_inscription.dto.request.ApplicationSubmissionRequestDTO;
import com.groupe.gestin_inscription.dto.response.ApplicationStatusResponseDto;
import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.repository.ApplicationRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/inscription")
@Tag(name = "Inscription Workflow", description = "Workflow d'inscription en 5 étapes selon cahier des charges")
public class InscriptionWorkflowController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Étape 1-5: Soumission complète du formulaire d'inscription
     * Processus en 5 étapes selon le cahier des charges
     */
    @PostMapping(value = "/submit-complete", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Soumission complète du dossier d'inscription (5 étapes)")
    public ResponseEntity<?> submitCompleteApplication(
            @RequestParam(required = false) String applicationData,
            @RequestParam(required = false) MultipartFile[] documents,
            @RequestParam(required = false) String[] documentTypes,
            @RequestParam(required = false) String[] documentNames) {
        
        try {
            System.out.println("=== DÉBUT WORKFLOW INSCRIPTION ===");
            
            // Récupération de l'utilisateur authentifié
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            System.out.println("Utilisateur: " + currentUsername);
            System.out.println("Documents reçus: " + (documents != null ? documents.length : 0));
            
            // Étape 1: Pré-validation automatique (2 min selon cahier des charges)
            Map<String, Object> preValidation = performPreValidation(documents, applicationData);
            
            if (!(Boolean) preValidation.get("success")) {
                return ResponseEntity.badRequest().body(preValidation);
            }
            
            // Étape 2: Traitement des données utilisateur
            User user = findOrCreateUser(currentUsername);
            if (applicationData != null && !applicationData.trim().isEmpty()) {
                updateUserFromApplicationData(user, applicationData);
            }
            
            // Étape 3: Création de l'application avec gestion des doublons
            Application application = createApplicationSafely(user, applicationData);
            
            // Étape 4: Calcul du taux de complétion
            double completionRate = calculateCompletionRate(applicationData, documents);
            application.setCompletionRate(completionRate);
            
            // Étape 5: Sauvegarde et réponse
            Application savedApplication = applicationRepository.save(application);
            
            // Création de la réponse selon le format attendu
            ApplicationStatusResponseDto response = createSuccessResponse(savedApplication, user);
            
            System.out.println("=== INSCRIPTION RÉUSSIE - ID: " + savedApplication.getId() + " ===");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Inscription soumise avec succès",
                "application", response,
                "workflow", Map.of(
                    "currentStep", "PRE_VALIDATION",
                    "nextStep", "MANUAL_REVIEW",
                    "estimatedProcessingTime", "24-48h"
                )
            ));
            
        } catch (Exception e) {
            System.err.println("=== ERREUR WORKFLOW INSCRIPTION ===");
            System.err.println("Erreur: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "code", "INSCRIPTION_ERROR",
                "message", "Erreur lors de l'inscription",
                "details", e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }
    
    /**
     * Pré-validation automatique selon cahier des charges
     */
    private Map<String, Object> performPreValidation(MultipartFile[] documents, String applicationData) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        
        // Vérification des documents requis
        if (documents == null || documents.length == 0) {
            errors.add("Aucun document fourni");
        } else {
            for (MultipartFile doc : documents) {
                // Vérification taille (max 5Mo selon cahier des charges)
                if (doc.getSize() > 5 * 1024 * 1024) {
                    errors.add("Document " + doc.getOriginalFilename() + " dépasse 5Mo");
                }
                
                // Vérification format
                String contentType = doc.getContentType();
                if (contentType == null || 
                    (!contentType.equals("application/pdf") && 
                     !contentType.startsWith("image/"))) {
                    errors.add("Format non supporté pour " + doc.getOriginalFilename());
                }
            }
        }
        
        // Vérification données application
        if (applicationData == null || applicationData.trim().isEmpty()) {
            errors.add("Données d'application manquantes");
        }
        
        result.put("success", errors.isEmpty());
        result.put("errors", errors);
        result.put("validationTime", LocalDateTime.now());
        
        return result;
    }
    
    /**
     * Recherche ou création d'utilisateur
     */
    private User findOrCreateUser(String username) {
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + username));
    }
    
    /**
     * Mise à jour des données utilisateur depuis le formulaire
     */
    private void updateUserFromApplicationData(User user, String applicationData) {
        try {
            ApplicationSubmissionRequestDTO dto = objectMapper.readValue(applicationData, ApplicationSubmissionRequestDTO.class);
            
            // Mise à jour informations personnelles
            if (dto.getPersonalInfo() != null) {
                var personalInfo = dto.getPersonalInfo();
                if (personalInfo.getLastName() != null) {
                    user.setLastName(personalInfo.getLastName());
                }
                if (personalInfo.getFirstNames() != null && personalInfo.getFirstNames().length > 0) {
                    user.setFirstName(String.join(" ", personalInfo.getFirstNames()));
                }
                if (personalInfo.getBirthDate() != null) {
                    user.setDateOfBirth(personalInfo.getBirthDate());
                }
                if (personalInfo.getNationality() != null) {
                    user.setNationality(personalInfo.getNationality());
                }
            }
            
            // Mise à jour coordonnées
            if (dto.getContactInfo() != null) {
                var contactInfo = dto.getContactInfo();
                if (contactInfo.getEmail() != null) {
                    user.setEmail(contactInfo.getEmail());
                }
                if (contactInfo.getPhone() != null) {
                    user.setPhoneNumber(contactInfo.getPhone());
                }
            }
            
            userRepository.save(user);
            System.out.println("Utilisateur mis à jour: " + user.getFirstName() + " " + user.getLastName());
            
        } catch (Exception e) {
            System.err.println("Erreur mise à jour utilisateur: " + e.getMessage());
        }
    }
    
    /**
     * Création sécurisée d'application avec gestion des doublons
     */
    private Application createApplicationSafely(User user, String applicationData) {
        // Suppression des applications existantes pour éviter les doublons (temporaire)
        List<Application> existingApps = applicationRepository.findByApplicantName(user);
        if (!existingApps.isEmpty()) {
            System.out.println("Suppression de " + existingApps.size() + " applications existantes");
            applicationRepository.deleteAll(existingApps);
        }
        
        // Création nouvelle application
        Application application = new Application();
        application.setApplicantName(user);
        application.setSubmissionDate(LocalDateTime.now());
        application.setStatus(ApplicationStatus.PRE_VALIDATION);
        application.setTargetInstitution("INSTITUTION_DEFAULT");
        application.setSpecialization("SPECIALIZATION_DEFAULT");
        
        // Extraction spécialisation depuis les données si disponible
        try {
            if (applicationData != null) {
                ApplicationSubmissionRequestDTO dto = objectMapper.readValue(applicationData, ApplicationSubmissionRequestDTO.class);
                if (dto.getAcademicHistory() != null && dto.getAcademicHistory().getSpecialization() != null) {
                    application.setSpecialization(dto.getAcademicHistory().getSpecialization());
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur extraction spécialisation: " + e.getMessage());
        }
        
        return application;
    }
    
    /**
     * Calcul du taux de complétion selon le cahier des charges
     */
    private double calculateCompletionRate(String applicationData, MultipartFile[] documents) {
        double rate = 0.0;
        
        // 40% pour les données du formulaire
        if (applicationData != null && !applicationData.trim().isEmpty()) {
            try {
                ApplicationSubmissionRequestDTO dto = objectMapper.readValue(applicationData, ApplicationSubmissionRequestDTO.class);
                
                if (dto.getPersonalInfo() != null) rate += 10.0;
                if (dto.getContactInfo() != null) rate += 10.0;
                if (dto.getAcademicHistory() != null) rate += 10.0;
                if (dto.getTargetInstitution() != null) rate += 10.0;
                
            } catch (Exception e) {
                rate += 20.0; // Données présentes mais non parsables
            }
        }
        
        // 60% pour les documents
        if (documents != null && documents.length > 0) {
            rate += Math.min(60.0, documents.length * 15.0);
        }
        
        return Math.min(100.0, rate);
    }
    
    /**
     * Création de la réponse de succès
     */
    private ApplicationStatusResponseDto createSuccessResponse(Application application, User user) {
        ApplicationStatusResponseDto response = new ApplicationStatusResponseDto();
        response.setApplicationId(application.getId());
        response.setStatus(application.getStatus().name());
        response.setCompletionRate(application.getCompletionRate());
        response.setSubmissionDate(application.getSubmissionDate());
        response.setCreatedAt(application.getCreatedAt());
        response.setUsername(user.getUsername());
        response.setApplicantName(user.getFirstName() + " " + user.getLastName());
        
        return response;
    }
    
    /**
     * Vérification du statut d'une inscription
     */
    @GetMapping("/status/{applicationId}")
    @Operation(summary = "Vérification du statut d'inscription")
    public ResponseEntity<?> checkInscriptionStatus(@PathVariable Long applicationId) {
        try {
            Optional<Application> appOpt = applicationRepository.findById(applicationId);
            
            if (appOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Application app = appOpt.get();
            ApplicationStatusResponseDto response = createSuccessResponse(app, app.getApplicantName());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "application", response,
                "workflow", getWorkflowInfo(app.getStatus())
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Erreur lors de la vérification du statut"
            ));
        }
    }
    
    /**
     * Informations sur le workflow selon le statut
     */
    private Map<String, Object> getWorkflowInfo(ApplicationStatus status) {
        Map<String, Object> workflow = new HashMap<>();
        
        switch (status) {
            case PRE_VALIDATION:
                workflow.put("currentStep", "Pré-validation automatique");
                workflow.put("nextStep", "Contrôle manuel");
                workflow.put("estimatedTime", "2 minutes");
                break;
            case UNDER_REVIEW:
                workflow.put("currentStep", "Contrôle manuel");
                workflow.put("nextStep", "Décision finale");
                workflow.put("estimatedTime", "24-48h");
                break;
            case APPROVED:
                workflow.put("currentStep", "Approuvé");
                workflow.put("nextStep", "Inscription finalisée");
                workflow.put("estimatedTime", "Immédiat");
                break;
            case REJECTED:
                workflow.put("currentStep", "Rejeté");
                workflow.put("nextStep", "Recours possible");
                workflow.put("estimatedTime", "Selon recours");
                break;
            default:
                workflow.put("currentStep", "En cours");
                workflow.put("nextStep", "À déterminer");
                workflow.put("estimatedTime", "Variable");
        }
        
        return workflow;
    }
}