package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.dto.request.ApplicationSubmissionRequestDTO;
import com.groupe.gestin_inscription.dto.request.DocumentUploadRequestDTO;
import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.model.Document;
import com.groupe.gestin_inscription.repository.UserRepository;
import com.groupe.gestin_inscription.repository.DocumentRepository;
import com.groupe.gestin_inscription.services.serviceImpl.ApplicationServiceImpl;
import com.groupe.gestin_inscription.services.serviceImpl.NotificationServiceImpl;
import com.groupe.gestin_inscription.services.serviceImpl.EmailNotificationService;
import com.groupe.gestin_inscription.model.Enums.NotificationType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.List;
import java.util.ArrayList;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Application Management", description = "Endpoints for managing the application submission workflow")
public class ApplicationController {

    @Autowired
    private ApplicationServiceImpl applicationServiceImpl;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private com.groupe.gestin_inscription.repository.ApplicationRepository applicationRepository;
    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private NotificationServiceImpl notificationService;
    @Autowired
    private EmailNotificationService emailNotificationService;
    
    // Endpoint de test pour vérifier l'authentification
    @GetMapping("/auth-test")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE') or hasAuthority('ROLE_AGENT') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> testAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("username", authentication.getName());
        response.put("authorities", authentication.getAuthorities());
        response.put("authenticated", authentication.isAuthenticated());
        return ResponseEntity.ok(response);
    }

    // Endpoint pour récupérer toutes les candidatures (agents et admins)
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_AGENT') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getAllApplications() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            System.out.println("Debug - Getting all applications for user: " + currentUsername);
            
            // Récupérer toutes les candidatures via le service
            List<Application> applications = applicationServiceImpl.getAllApplications();
            
            // Convertir en format attendu par le frontend
            List<Map<String, Object>> applicationsData = applications.stream()
                .map(this::convertApplicationToDto)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applications", applicationsData);
            response.put("count", applicationsData.size());
            response.put("message", "Candidatures récupérées avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error getting all applications: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la récupération des candidatures");
            error.put("details", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Endpoint pour récupérer les candidatures de l'utilisateur connecté
    @GetMapping("/my-applications")
    // @PreAuthorize("hasAuthority('ROLE_CANDIDATE') or hasAuthority('ROLE_AGENT') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getMyApplications() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            System.out.println("=== MY-APPLICATIONS DEBUG ===");
            System.out.println("Authentication: " + authentication);
            System.out.println("Username: " + currentUsername);
            System.out.println("Authorities: " + authentication.getAuthorities());
            System.out.println("Is authenticated: " + authentication.isAuthenticated());
            System.out.println("Principal: " + authentication.getPrincipal());
            
            // Récupérer l'utilisateur (d'abord par email, puis par username)
            System.out.println("Searching user by email: " + currentUsername);
            Optional<User> userOpt = userRepository.findByEmail(currentUsername);
            System.out.println("User found by email: " + userOpt.isPresent());
            
            if (!userOpt.isPresent()) {
                System.out.println("Searching user by username: " + currentUsername);
                userOpt = userRepository.findByUsername(currentUsername);
                System.out.println("User found by username: " + userOpt.isPresent());
            }
            
            if (!userOpt.isPresent()) {
                System.out.println("No user found for: " + currentUsername);
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("applications", new ArrayList<>());
                response.put("count", 0);
                response.put("message", "Aucune candidature trouvée (mode test)");
                response.put("details", "Vous pouvez soumettre une nouvelle candidature.");
                return ResponseEntity.ok(response);
            }
            
            User user = userOpt.get();
            
            // Récupérer les candidatures de cet utilisateur
            List<Application> applications = applicationRepository.findByApplicantName(user);
            
            // Convertir en format attendu par le frontend
            List<Map<String, Object>> applicationsData = applications.stream()
                .map(this::convertApplicationToDto)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applications", applicationsData);
            response.put("count", applicationsData.size());
            response.put("message", applicationsData.isEmpty() ? 
                "Aucune candidature trouvée" : "Candidatures récupérées avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error getting user applications: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la récupération des candidatures");
            error.put("details", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    

    
    // Endpoint pour récupérer les documents d'une candidature
    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAuthority('ROLE_AGENT') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getApplicationDocuments(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            System.out.println("Debug - Getting documents for application " + id + " by user: " + currentUsername);
            
            // Retourner directement le tableau de documents
            List<Map<String, Object>> documents = new ArrayList<>();
            
            return ResponseEntity.ok(documents);
            
        } catch (Exception e) {
            System.err.println("Error getting documents for application " + id + ": " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }
    
    // Endpoint pour soumettre une candidature
    @PostMapping("/submit")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE') or hasAuthority('ROLE_AGENT') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> submitApplication(
            @RequestParam("applicationData") String applicationDataJson,
            @RequestParam(value = "documents", required = false) MultipartFile[] documents) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            System.out.println("=== SUBMIT APPLICATION DEBUG ===");
            System.out.println("Username: " + currentUsername);
            System.out.println("Application data: " + applicationDataJson);
            System.out.println("Documents count: " + (documents != null ? documents.length : 0));
            
            // Parser les données JSON
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            ApplicationSubmissionRequestDTO applicationData = objectMapper.readValue(applicationDataJson, ApplicationSubmissionRequestDTO.class);
            
            // Récupérer l'utilisateur
            Optional<User> userOpt = userRepository.findByEmail(currentUsername);
            if (!userOpt.isPresent()) {
                userOpt = userRepository.findByUsername(currentUsername);
            }
            
            if (!userOpt.isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Utilisateur non trouvé");
                return ResponseEntity.status(404).body(error);
            }
            
            User user = userOpt.get();
            
            // Mettre à jour les informations utilisateur avec les données du formulaire
            if (applicationData.getPersonalInfo() != null) {
                ApplicationSubmissionRequestDTO.PersonalInfoDTO personalInfo = applicationData.getPersonalInfo();
                if (personalInfo.getLastName() != null) {
                    user.setLastName(personalInfo.getLastName());
                }
                if (personalInfo.getFirstNames() != null && personalInfo.getFirstNames().length > 0) {
                    user.setFirstName(String.join(" ", personalInfo.getFirstNames()));
                }
            }
            
            // Sauvegarder les informations utilisateur mises à jour
            userRepository.save(user);
            
            System.out.println("Updated user - FirstName: " + user.getFirstName() + ", LastName: " + user.getLastName());
            
            // Créer une nouvelle candidature
            Application application = new Application();
            application.setApplicantName(user);
            application.setSubmissionDate(LocalDateTime.now());
            application.setStatus(com.groupe.gestin_inscription.model.Enums.ApplicationStatus.UNDER_REVIEW);
            
            // Sauvegarder la candidature
            Application savedApplication = applicationRepository.save(application);
            

            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applicationId", savedApplication.getId());
            response.put("message", "Candidature soumise avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error submitting application: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la soumission de la candidature");
            error.put("details", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Endpoint de test simple sans sécurité
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Test endpoint works");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
    
    // Test endpoint pour my-applications sans authentification
    @GetMapping("/test-my-applications")
    public ResponseEntity<?> testMyApplications() {
        try {
            List<Application> allApplications = applicationRepository.findAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", allApplications.size());
            response.put("message", "Test my-applications works - found " + allApplications.size() + " applications");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Debug version of my-applications with detailed logging
    @GetMapping("/debug-my-applications")
    public ResponseEntity<?> debugMyApplications(HttpServletRequest request) {
        try {
            System.out.println("=== DEBUG MY-APPLICATIONS ===");
            
            // Check authentication
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Authentication: " + authentication);
            System.out.println("Is authenticated: " + (authentication != null && authentication.isAuthenticated()));
            
            if (authentication != null) {
                System.out.println("Principal: " + authentication.getPrincipal());
                System.out.println("Name: " + authentication.getName());
                System.out.println("Authorities: " + authentication.getAuthorities());
            }
            
            // Check headers
            String authHeader = request.getHeader("Authorization");
            System.out.println("Authorization header: " + (authHeader != null ? "Present (" + authHeader.substring(0, Math.min(20, authHeader.length())) + "...)" : "Missing"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hasAuth", authentication != null);
            response.put("isAuthenticated", authentication != null && authentication.isAuthenticated());
            response.put("hasAuthHeader", authHeader != null);
            response.put("message", "Debug info collected");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Debug error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Debug error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Simple test endpoint for processing
    @PostMapping("/{id}/process-test")
    public ResponseEntity<?> processApplicationTest(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Test endpoint works");
        response.put("applicationId", id);
        return ResponseEntity.ok(response);
    }
    
    // Endpoint pour traiter une candidature (approuver/rejeter)
    @PostMapping("/{id}/process")
    public ResponseEntity<?> processApplication(
            @PathVariable Long id,
            @RequestParam String decision,
            @RequestParam(required = false) String comment) {
        try {
            Optional<Application> appOpt = applicationRepository.findById(id);
            if (!appOpt.isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Candidature non trouvée");
                return ResponseEntity.status(404).body(error);
            }
            
            Application application = appOpt.get();
            User candidate = application.getApplicantName();
            
            if ("APPROVED".equals(decision)) {
                application.setStatus(com.groupe.gestin_inscription.model.Enums.ApplicationStatus.APPROVED);
                // Envoyer email d'approbation avec lien vers fiche d'inscription
                sendApprovalEmail(candidate, application.getId());
            } else if ("REJECTED".equals(decision)) {
                application.setStatus(com.groupe.gestin_inscription.model.Enums.ApplicationStatus.REJECTED);
                // Envoyer email de rejet
                sendRejectionEmail(candidate, comment);
            }
            
            applicationRepository.save(application);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Candidature traitée avec succès. Email envoyé au candidat.");
            response.put("newStatus", application.getStatus().name());
            response.put("applicationId", id);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    private void sendApprovalEmail(User candidate, Long applicationId) {
        try {
            String candidateName = (candidate.getFirstName() != null ? candidate.getFirstName() + " " : "") +
                                 (candidate.getLastName() != null ? candidate.getLastName() : "");
            
            emailNotificationService.sendApplicationApprovalEmail(
                candidate.getEmail(),
                candidateName.trim()
            );
        } catch (Exception e) {
            System.err.println("Erreur envoi email approbation: " + e.getMessage());
        }
    }
    
    private void sendRejectionEmail(User candidate, String comment) {
        try {
            String candidateName = (candidate.getFirstName() != null ? candidate.getFirstName() + " " : "") +
                                 (candidate.getLastName() != null ? candidate.getLastName() : "");
            
            String rejectionMessage = comment != null && !comment.trim().isEmpty() ? 
                "Motif du rejet: " + comment : 
                "Votre dossier ne répond pas aux critères d'admission pour cette session.";
            
            emailNotificationService.sendApplicationStatusUpdateEmail(
                candidate.getEmail(),
                candidateName.trim(),
                "REJETÉE",
                rejectionMessage
            );
        } catch (Exception e) {
            System.err.println("Erreur envoi email rejet: " + e.getMessage());
        }
    }
    
    // Original process method with full logic (commented out for debugging)
    /*
    @PostMapping("/{id}/process-full")
    public ResponseEntity<?> processApplicationFull(
            @PathVariable Long id,
            @RequestParam String decision,
            @RequestParam(required = false) String comment) {
        try {
            System.out.println("=== PROCESS APPLICATION DEBUG ===");
            System.out.println("Application ID: " + id);
            System.out.println("Decision: " + decision);
            System.out.println("Comment: " + comment);
            
            Optional<Application> appOpt = applicationRepository.findById(id);
            if (!appOpt.isPresent()) {
                System.out.println("Application not found with ID: " + id);
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Candidature non trouvée");
                return ResponseEntity.status(404).body(error);
            }
            
            Application application = appOpt.get();
            System.out.println("Found application: " + application.getId() + ", current status: " + application.getStatus());
            
            if ("APPROVED".equals(decision)) {
                application.setStatus(com.groupe.gestin_inscription.model.Enums.ApplicationStatus.APPROVED);
                System.out.println("Setting status to APPROVED");
            } else if ("REJECTED".equals(decision)) {
                application.setStatus(com.groupe.gestin_inscription.model.Enums.ApplicationStatus.REJECTED);
                System.out.println("Setting status to REJECTED");
            } else {
                System.out.println("Invalid decision: " + decision);
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Décision invalide: " + decision);
                return ResponseEntity.status(400).body(error);
            }
            
            System.out.println("Saving application with new status: " + application.getStatus());
            Application savedApp = applicationRepository.save(application);
            System.out.println("Application saved successfully with status: " + savedApp.getStatus());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Candidature traitée avec succès");
            response.put("newStatus", savedApp.getStatus().name());
            response.put("applicationId", savedApp.getId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error processing application " + id + ": " + e.getMessage());
            System.err.println("Exception type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors du traitement de la candidature: " + e.getMessage());
            error.put("details", e.getClass().getSimpleName() + ": " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    */
    
    // Endpoint pour récupérer une candidature par ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id) {
        try {
            Optional<Application> appOpt = applicationRepository.findById(id);
            if (!appOpt.isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Candidature non trouvée");
                return ResponseEntity.status(404).body(error);
            }
            
            Application application = appOpt.get();
            Map<String, Object> dto = convertApplicationToDto(application);
            
            return ResponseEntity.ok(dto);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Endpoint pour les données de la carte thermique
    @GetMapping("/heatmap-data")
    public ResponseEntity<?> getHeatmapData() {
        try {
            List<Application> allApplications = applicationRepository.findAll();
            
            // Compter les inscriptions par université (basé sur targetInstitution ou lastInstitution)
            Map<String, Integer> universityCount = new HashMap<>();
            
            for (Application app : allApplications) {
                String university = "Université Inconnue";
                
                // Essayer de récupérer l'université depuis les données de l'application
                // Pour l'instant, on utilise des universités du Cameroun comme exemple
                if (app.getId() % 4 == 0) university = "Université de Yaoundé I";
                else if (app.getId() % 4 == 1) university = "Université de Douala";
                else if (app.getId() % 4 == 2) university = "Université de Dschang";
                else university = "Université de Ngaoundéré";
                
                universityCount.put(university, universityCount.getOrDefault(university, 0) + 1);
            }
            
            // Créer les données pour la carte thermique
            List<Map<String, Object>> heatmapData = new ArrayList<>();
            
            // Coordonnées des principales universités du Cameroun
            Map<String, double[]> universityCoords = new HashMap<>();
            universityCoords.put("Université de Yaoundé I", new double[]{3.8480, 11.5021});
            universityCoords.put("Université de Douala", new double[]{4.0511, 9.7679});
            universityCoords.put("Université de Dschang", new double[]{5.4467, 10.0594});
            universityCoords.put("Université de Ngaoundéré", new double[]{7.3167, 13.5833});
            
            for (Map.Entry<String, Integer> entry : universityCount.entrySet()) {
                String university = entry.getKey();
                Integer count = entry.getValue();
                double[] coords = universityCoords.get(university);
                
                if (coords != null) {
                    Map<String, Object> point = new HashMap<>();
                    point.put("name", university);
                    point.put("lat", coords[0]);
                    point.put("lng", coords[1]);
                    point.put("count", count);
                    point.put("intensity", Math.min(count / 10.0, 1.0)); // Normaliser l'intensité
                    heatmapData.add(point);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", heatmapData);
            response.put("totalApplications", allApplications.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Endpoint pour télécharger la fiche d'inscription PDF (candidatures approuvées uniquement)
    @GetMapping("/{id}/registration-form")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE') or hasAuthority('ROLE_AGENT') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<byte[]> downloadRegistrationForm(@PathVariable Long id) {
        try {
            Optional<Application> appOpt = applicationRepository.findById(id);
            if (!appOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Application application = appOpt.get();
            
            // Vérifier que la candidature est approuvée
            if (application.getStatus() != com.groupe.gestin_inscription.model.Enums.ApplicationStatus.APPROVED) {
                return ResponseEntity.status(403).build();
            }
            
            // Générer le PDF
            byte[] pdfBytes = generateRegistrationFormPDF(application);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "fiche_inscription_" + id + ".pdf");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
                
        } catch (Exception e) {
            System.err.println("Error generating registration form: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    private byte[] generateRegistrationFormPDF(Application application) throws IOException {
        PDDocument document = new PDDocument();
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);
        
        PDPageContentStream contentStream = new PDPageContentStream(document, page);
        
        float margin = 50;
        float yPosition = page.getMediaBox().getHeight() - margin;
        
        // Titre principal
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 18);
        contentStream.newLineAtOffset(200, yPosition);
        contentStream.showText("FICHE D'INSCRIPTION");
        contentStream.endText();
        yPosition -= 40;
        
        // Informations de l'établissement
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.newLineAtOffset(180, yPosition);
        contentStream.showText("UNIVERSITÉ DE YAOUNDÉ I");
        contentStream.endText();
        yPosition -= 20;
        
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.newLineAtOffset(200, yPosition);
        contentStream.showText("ANNÉE ACADÉMIQUE 2024-2025");
        contentStream.endText();
        yPosition -= 50;
        
        // Informations personnelles
        User user = application.getApplicantName();
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText("INFORMATIONS PERSONNELLES");
        contentStream.endText();
        yPosition -= 30;
        
        String[] personalInfo = {
            "Nom: " + (user.getLastName() != null ? user.getLastName().toUpperCase() : "N/A"),
            "Prénom(s): " + (user.getFirstName() != null ? user.getFirstName() : "N/A"),
            "Email: " + (user.getEmail() != null ? user.getEmail() : "N/A"),
            "Téléphone: " + (user.getPhoneNumber() != null ? user.getPhoneNumber() : "N/A")
        };
        
        for (String info : personalInfo) {
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 10);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText(info);
            contentStream.endText();
            yPosition -= 15;
        }
        
        yPosition -= 20;
        
        // Formation
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText("FORMATION");
        contentStream.endText();
        yPosition -= 30;
        
        String[] formationInfo = {
            "Filière: Sciences Informatiques",
            "Niveau: Licence 1",
            "Durée: 3 ans",
            "Date d'inscription: " + (application.getSubmissionDate() != null ? 
                application.getSubmissionDate().toLocalDate().toString() : "N/A"),
            "Statut: APPROUVÉ"
        };
        
        for (String info : formationInfo) {
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 10);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText(info);
            contentStream.endText();
            yPosition -= 15;
        }
        
        // Espace photo
        float photoX = 400;
        float photoY = yPosition + 100;
        contentStream.addRect(photoX, photoY, 100, 120);
        contentStream.stroke();
        
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA, 8);
        contentStream.newLineAtOffset(photoX + 30, photoY + 60);
        contentStream.showText("PHOTO");
        contentStream.endText();
        
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA, 8);
        contentStream.newLineAtOffset(photoX + 20, photoY + 45);
        contentStream.showText("3.5 x 4.5 cm");
        contentStream.endText();
        
        yPosition -= 80;
        
        // Signatures
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText("Signature de l'étudiant:");
        contentStream.endText();
        
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.newLineAtOffset(350, yPosition);
        contentStream.showText("Cachet de l'établissement:");
        contentStream.endText();
        
        yPosition -= 80;
        
        // Numéro d'inscription
        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.newLineAtOffset(180, yPosition);
        contentStream.showText("Numéro d'inscription: INS-" + String.format("%06d", application.getId()));
        contentStream.endText();
        
        contentStream.close();
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();
        
        return baos.toByteArray();
    }
    
    // Méthode utilitaire pour convertir Application en DTO
    private Map<String, Object> convertApplicationToDto(Application application) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", application.getId());
        
        Map<String, Object> candidat = new HashMap<>();
        
        if (application.getApplicantName() != null) {
            User user = application.getApplicantName();
            candidat.put("nom", user.getLastName() != null ? user.getLastName() : "Nom");
            candidat.put("prenom", user.getFirstName() != null ? user.getFirstName() : "Prénom");
            candidat.put("email", user.getEmail() != null ? user.getEmail() : "email@example.com");
            candidat.put("telephone", user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
        } else {
            candidat.put("nom", "Nom inconnu");
            candidat.put("prenom", "Prénom inconnu");
            candidat.put("email", "email@inconnu.com");
            candidat.put("telephone", "");
        }
        
        dto.put("candidat", candidat);
        dto.put("status", application.getStatus() != null ? application.getStatus().name() : "UNDER_REVIEW");
        dto.put("dateCreation", application.getSubmissionDate() != null ? 
            application.getSubmissionDate().toString() : null);
        // Récupérer les vrais documents depuis la base de données
        List<Document> documents = documentRepository.findByApplicationId(application.getId());
        List<Map<String, Object>> documentsList = documents.stream()
            .map(doc -> {
                Map<String, Object> docMap = new HashMap<>();
                docMap.put("id", doc.getId());
                docMap.put("nom", doc.getName());
                docMap.put("type", doc.getFileType());
                docMap.put("taille", doc.getFileSizeMB());
                docMap.put("statut", doc.getValidationStatus() != null ? doc.getValidationStatus().name() : "PENDING");
                return docMap;
            })
            .collect(Collectors.toList());
        dto.put("documents", documentsList);
        
        return dto;
    }
}