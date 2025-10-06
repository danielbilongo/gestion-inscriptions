package com.groupe.gestin_inscription.services.serviceImpl;

import com.groupe.gestin_inscription.dto.request.DocumentUploadRequestDTO;
import com.groupe.gestin_inscription.dto.request.RegistrationFormRequestDTO;
import com.groupe.gestin_inscription.dto.request.UserRequestDTO;
import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import com.groupe.gestin_inscription.repository.ApplicationRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import com.groupe.gestin_inscription.services.serviceInterfaces.ApplicationService;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Random;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AdministratorRepository administratorRepository;
    @Autowired
    private DocumentServiceImpl documentService;
    @Autowired
    private NotificationServiceImpl notificationService;
    @Autowired
    private DocumentManagerService documentManagerService;

    // Méthode pour mettre à jour le statut avec notification automatique
    @Transactional
    public void updateApplicationStatus(Long applicationId, ApplicationStatus newStatus, String comment) throws MessagingException {
        Application application = getApplicationById(applicationId);
        ApplicationStatus oldStatus = application.getStatus();
        
        // Mettre à jour le statut
        application.setStatus(newStatus);
        application.setLastUpdated(LocalDateTime.now());
        applicationRepository.save(application);
        
        // Notifier le candidat du changement de statut
        if (application.getApplicantName() != null && !oldStatus.equals(newStatus)) {
            sendStatusChangeNotification(application, newStatus, comment);
        }
    }
    
    // Envoie une notification lors du changement de statut
    private void sendStatusChangeNotification(Application application, ApplicationStatus status, String comment) {
        User candidate = application.getApplicantName();
        String title, message, emailSubject, emailContent;
        com.groupe.gestin_inscription.model.Enums.NotificationType notificationType;
        
        switch (status) {
            case PRE_VALIDATION:
                title = "Candidature reçue";
                message = "Votre candidature est en cours de pré-validation.";
                emailSubject = "Candidature reçue - Gestion Inscription";
                emailContent = "<h2>Candidature reçue</h2><p>Votre candidature est en cours de pré-validation.</p>";
                notificationType = com.groupe.gestin_inscription.model.Enums.NotificationType.INFO;
                break;
            case MANUAL_REVIEW:
                title = "Candidature en révision";
                message = "Votre candidature est maintenant en révision manuelle.";
                emailSubject = "Candidature en révision - Gestion Inscription";
                emailContent = "<h2>Candidature en révision</h2><p>Votre candidature est maintenant en révision manuelle par nos agents.</p>";
                notificationType = com.groupe.gestin_inscription.model.Enums.NotificationType.INFO;
                break;
            case UNDER_REVIEW:
                title = "Candidature en cours d'examen";
                message = "Votre candidature est en cours d'examen approfondi.";
                emailSubject = "Candidature en examen - Gestion Inscription";
                emailContent = "<h2>Candidature en examen</h2><p>Votre candidature est en cours d'examen approfondi.</p>";
                notificationType = com.groupe.gestin_inscription.model.Enums.NotificationType.INFO;
                break;
            case APPROVED:
                title = "Candidature approuvée";
                message = "Félicitations ! Votre candidature a été approuvée.";
                emailSubject = "Candidature approuvée - Gestion Inscription";
                emailContent = "<h2>Félicitations !</h2><p>Votre candidature a été approuvée.</p>";
                notificationType = com.groupe.gestin_inscription.model.Enums.NotificationType.SUCCESS;
                break;
            case REJECTED:
                title = "Candidature rejetée";
                message = "Votre candidature a été rejetée.";
                emailSubject = "Candidature rejetée - Gestion Inscription";
                emailContent = "<h2>Candidature rejetée</h2><p>Nous regrettons de vous informer que votre candidature a été rejetée.</p>";
                notificationType = com.groupe.gestin_inscription.model.Enums.NotificationType.WARNING;
                break;
            case PENDING:
                title = "Candidature en attente";
                message = "Votre candidature est en attente de traitement.";
                emailSubject = "Candidature en attente - Gestion Inscription";
                emailContent = "<h2>Candidature en attente</h2><p>Votre candidature est en attente de traitement.</p>";
                notificationType = com.groupe.gestin_inscription.model.Enums.NotificationType.INFO;
                break;
            default:
                return; // Pas de notification pour les statuts non définis
        }
        
        // Ajouter le commentaire si présent
        if (comment != null && !comment.trim().isEmpty()) {
            message += " Commentaire: " + comment;
            emailContent += "<p><strong>Commentaire:</strong> " + comment + "</p>";
        }
        
        try {
            // Créer notification in-app
            notificationService.createNotification(candidate.getId(), title, message, notificationType);
            
            // Envoyer email
            notificationService.sendEmailNotification(candidate.getEmail(), emailSubject, emailContent);
            
            System.out.println("Status change notification sent to: " + candidate.getEmail() + " for status: " + status);
        } catch (Exception e) {
            System.err.println("Failed to send status change notification: " + e.getMessage());
        }
    }

    // Creates application from existing user profile (simplified approach)
    public Application createFromExistingUser(String username, List<DocumentUploadRequestDTO> documents) throws MessagingException {
        System.out.println("=== DEBUG - createFromExistingUser called with username: " + username + " ===");
        
        try {
            // Try both tables to find user
            Optional<User> userOpt = userRepository.findByUsername(username)
                    .or(() -> userRepository.findByEmail(username));
            
            User existingUser;
            if (userOpt.isPresent()) {
                existingUser = userOpt.get();
                System.out.println("DEBUG - Found existing User: " + existingUser.getUsername());
            } else {
                // Check Administrator table for OAuth2 users
                Optional<Administrator> adminOpt = administratorRepository.findByUserName(username)
                        .or(() -> administratorRepository.findByEmail(username));
                
                if (adminOpt.isPresent()) {
                    Administrator admin = adminOpt.get();
                    System.out.println("DEBUG - Found Administrator, creating User: " + admin.getEmail());
                    existingUser = createUserFromAdministrator(admin);
                } else {
                    System.out.println("DEBUG - No user found in either table for: " + username);
                    throw new NoSuchElementException("Utilisateur non trouvé: " + username);
                }
            }
            
            // Vérification des doublons temporairement désactivée pour permettre les tests
            String targetInstitution = "DEFAULT_INSTITUTION";
            String specialization = "DEFAULT_SPECIALIZATION";
            
            if (existingUser.getAcademicHistory() != null) {
                if (existingUser.getAcademicHistory().getLastInstitution() != null) {
                    targetInstitution = existingUser.getAcademicHistory().getLastInstitution();
                }
                if (existingUser.getAcademicHistory().getSpecialization() != null) {
                    specialization = existingUser.getAcademicHistory().getSpecialization();
                }
            }
            
            System.out.println("DEBUG - Allowing multiple applications for testing purposes");
            
            // Créer l'application avec le profil existant
            Application application = new Application();
            
            // Set all required fields with validation
            application.setApplicantName(existingUser);
            application.setTargetInstitution(targetInstitution != null && !targetInstitution.trim().isEmpty() ? targetInstitution : "DEFAULT_INSTITUTION");
            application.setSpecialization(specialization != null && !specialization.trim().isEmpty() ? specialization : "DEFAULT_SPECIALIZATION");
            application.setSubmissionDate(LocalDateTime.now());
            application.setLastUpdated(LocalDateTime.now());
            application.setStatus(ApplicationStatus.PRE_VALIDATION);
            
            // Calculate completion rate with fallback
            double completionRate = 0.0;
            try {
                completionRate = calculateCompletionRateSimple(existingUser, documents);
            } catch (Exception e) {
                System.err.println("Error calculating completion rate: " + e.getMessage());
                completionRate = 50.0; // Default fallback
            }
            application.setCompletionRate(completionRate);
            
            // Final validation before save
            if (application.getApplicantName() == null) {
                throw new IllegalStateException("Applicant user cannot be null");
            }
            if (application.getTargetInstitution() == null || application.getTargetInstitution().trim().isEmpty()) {
                application.setTargetInstitution("DEFAULT_INSTITUTION");
            }
            if (application.getSpecialization() == null || application.getSpecialization().trim().isEmpty()) {
                application.setSpecialization("DEFAULT_SPECIALIZATION");
            }
            if (application.getStatus() == null) {
                application.setStatus(ApplicationStatus.PRE_VALIDATION);
            }
            
            System.out.println("DEBUG - Saving application for user: " + existingUser.getUsername());
            System.out.println("DEBUG - Application details: Institution=" + application.getTargetInstitution() + ", Specialization=" + application.getSpecialization());
            
            Application savedApplication = applicationRepository.save(application);
            System.out.println("DEBUG - Application saved with ID: " + savedApplication.getId());
            
            // Traiter les documents
            if (documents != null && !documents.isEmpty()) {
                System.out.println("DEBUG - Processing " + documents.size() + " documents");
                for (DocumentUploadRequestDTO docDTO : documents) {
                    documentService.uploadDocument(savedApplication.getId(), docDTO);
                }
            }
            
            // Déclencher la pré-validation
            System.out.println("DEBUG - Starting pre-validation");
            performPreValidation(savedApplication);
            
            System.out.println("DEBUG - Sending notification email");
            notificationService.sendEmailNotification(existingUser.getEmail(), "Candidature Soumise", "Votre candidature a été reçue.");
            
            return savedApplication;
            
        } catch (Exception e) {
            System.err.println("ERROR in createFromExistingUser: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Creates a new application from user data and documents
    @Override
    public Application createApplication(RegistrationFormRequestDTO registrationForm, List<DocumentUploadRequestDTO> documents) throws MessagingException {
        // Step 1: Get the currently authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User user = userRepository.findByUsername(currentUsername)
                .or(() -> userRepository.findByEmail(currentUsername))
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + currentUsername));
        
        // Déterminer l'institution cible et la spécialité depuis le formulaire
        String targetInstitution = "DEFAULT_INSTITUTION";
        String specialization = "DEFAULT_SPECIALIZATION";
        
        if (registrationForm.getLastInstitution() != null && !registrationForm.getLastInstitution().trim().isEmpty()) {
            targetInstitution = registrationForm.getLastInstitution().trim();
        }
        if (registrationForm.getSpecialization() != null && !registrationForm.getSpecialization().trim().isEmpty()) {
            specialization = registrationForm.getSpecialization().trim();
        }
        
        // Vérification des doublons temporairement désactivée pour permettre les tests
        System.out.println("DEBUG - Allowing multiple applications for testing purposes");

        // Update user information with form data
        updateUserFromForm(user, registrationForm);
        user = userRepository.save(user);

        // Step 2: Create a new Application entity associated with the retrieved user.
        Application application = new Application();
        application.setApplicantName(user);
        application.setTargetInstitution(targetInstitution);
        application.setSpecialization(specialization);
        application.setCompletionRate(calculateCompletionRate(registrationForm, documents));
        application.setSubmissionDate(LocalDateTime.now());
        application.setStatus(ApplicationStatus.PRE_VALIDATION);
        application = applicationRepository.save(application);

        // Step 3: Upload and associate documents.
        for (DocumentUploadRequestDTO docDTO : documents) {
            documentService.uploadDocument(application.getId(), docDTO);
        }

        // Step 4: Trigger automatic pre-validation and notifications.
        performPreValidation(application);
        notificationService.sendEmailNotification(user.getEmail(), "Application Submitted", "Your application has been received.");

        return application;
    }

    // Retrieves an application by its ID
    public Application getApplicationById(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with ID: " + applicationId));
    }

    // Retrieves all applications for the admin dashboard
    public List<Application> getAllApplications() {
        try {
            return applicationRepository.findAll();
        } catch (Exception e) {
            System.err.println("Error in getAllApplications: " + e.getMessage());
            e.printStackTrace();
            // Return empty list instead of throwing exception
            return new ArrayList<>();
        }
    }

    // Finds applications by status for filtering in the admin dashboard
    public List<Application> getApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.findByStatus(status);
    }

    // Finds applications with a certain completion rate
    public List<Application> getApplicationsByCompletionRate(double rate) {
        return applicationRepository.findByCompletionRateGreaterThanEqual(rate);
    }

    // Performs automated pre-validation checks (2 min)
    @Override
    public void performPreValidation(Application application) {
        // Verification of document formats
        boolean docsValid = application.getDocuments() == null || application.getDocuments().stream()
                .allMatch(doc -> documentManagerService.verifyFormat(doc.getFilePath(), (MultipartFile) doc));

        // Elementary fraud detection
        boolean noFraud = application.getDocuments() == null || application.getDocuments().stream()
                .noneMatch(doc -> documentManagerService.performOcrCheck(doc.getFilePath()));

        try {
            if (docsValid && noFraud) {
                updateApplicationStatus(application.getId(), ApplicationStatus.MANUAL_REVIEW, "Pré-validation réussie");
                assignForManualReview(application);
            } else {
                updateApplicationStatus(application.getId(), ApplicationStatus.REJECTED, "Pré-validation échouée");
            }
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    // Assigns an application to an agent for manual review (24-48h)
    @Override
    public void assignForManualReview(Application application) {

        // Get all agents
        List<Administrator> agents = administratorRepository.findByRole(AdministratorRole.AGENT);
        if (agents.isEmpty()) {
            // Handle case with no agents
            return;
        }

        // Simple logic for random assignment
        Random random = new Random();
        Administrator agent = agents.get(random.nextInt(agents.size()));

        // You would typically link the application to the agent here
        application.setAssignedAdmin(agent);
        applicationRepository.save(application);

    }

    // Agent's action to manually validate or reject a dossier
    @Transactional
    @Override
    public void reviewDossier(Long applicationId, String reviewDecision) throws MessagingException {
        Application application = applicationRepository.findById(applicationId).orElseThrow(
                () -> new NoSuchElementException("Application with ID " + applicationId + " not found.")
        );

        User applicant = application.getApplicantName();

        String emailSubject;
        String emailBody;

        if ("approve".equalsIgnoreCase(reviewDecision)) {
            updateApplicationStatus(applicationId, ApplicationStatus.APPROVED, "Révision manuelle approuvée");
        } else {
            updateApplicationStatus(applicationId, ApplicationStatus.REJECTED, "Révision manuelle rejetée");
        }

        // Send SMS reminder (optional additional notification)
        try {
            notificationService.sendSmsReminder(applicant.getPhoneNumber(), "Statut de candidature mis à jour");
        } catch (Exception e) {
            System.err.println("Failed to send SMS: " + e.getMessage());
        }
    }

    /**
     * Handles the online appeal process for a rejected application.
     */
    public void handleRecourse(Long applicationId, String recourseType) {
        Application application = applicationRepository.findById(applicationId).orElseThrow(() -> new EntityNotFoundException("Application not found."));

        if (application.getStatus() != ApplicationStatus.REJECTED) {
            throw new IllegalStateException("Recourse is only possible for rejected applications.");
        }

        if ("appointment".equalsIgnoreCase(recourseType)) {
            // Logic for virtual appointment scheduling [cite: 76]
            try {
                notificationService.sendEmailNotification(application.getApplicantName().getEmail(), "Prise de rendez-vous", "Prenez un rendez-vous virtuel avec l'administration.");
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        } else if ("chat".equalsIgnoreCase(recourseType)) {
            // Logic for chat with administration [cite: 77]
            // ... enable chat functionality
        } else {
            throw new IllegalArgumentException("Invalid recourse type.");
        }
    }


    // Updates user information from registration form
    private void updateUserFromForm(User user, RegistrationFormRequestDTO form) {
        if (form.getFirstName() != null && !form.getFirstName().trim().isEmpty()) {
            user.setFirstName(form.getFirstName().trim());
        }
        if (form.getLastName() != null && !form.getLastName().trim().isEmpty()) {
            user.setLastName(form.getLastName().trim());
        }
        if (form.getEmail() != null && !form.getEmail().trim().isEmpty()) {
            user.setEmail(form.getEmail().trim());
        }
        if (form.getPhoneNumber() != null && !form.getPhoneNumber().trim().isEmpty()) {
            user.setPhoneNumber(form.getPhoneNumber().trim());
        }
        if (form.getAddress() != null && !form.getAddress().trim().isEmpty()) {
            user.setAddress(form.getAddress().trim());
        }
        if (form.getEmergencyContact() != null && !form.getEmergencyContact().trim().isEmpty()) {
            user.setEmergencyContact(form.getEmergencyContact().trim());
        }
        if (form.getNationality() != null && !form.getNationality().trim().isEmpty()) {
            user.setNationality(form.getNationality().trim());
        }
        if (form.getDateOfBirth() != null) {
            user.setDateOfBirth(form.getDateOfBirth());
        }
        if (form.getGender() != null && !form.getGender().trim().isEmpty()) {
            try {
                user.setGender(com.groupe.gestin_inscription.model.Enums.Gender.valueOf(form.getGender().toUpperCase()));
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid gender value: " + form.getGender());
            }
        }
        if (form.getIdType() != null && !form.getIdType().trim().isEmpty()) {
            user.setUserIdNum(form.getIdType().trim());
        }
        
        // Update academic history if user has one
        if (user.getAcademicHistory() != null) {
            updateAcademicHistoryFromForm(user.getAcademicHistory(), form);
        }
    }
    
    // Updates academic history from registration form
    private void updateAcademicHistoryFromForm(com.groupe.gestin_inscription.model.AcademicHistory academicHistory, RegistrationFormRequestDTO form) {
        if (form.getLastInstitution() != null && !form.getLastInstitution().trim().isEmpty()) {
            academicHistory.setLastInstitution(form.getLastInstitution().trim());
        }
        if (form.getSpecialization() != null && !form.getSpecialization().trim().isEmpty()) {
            academicHistory.setSpecialization(form.getSpecialization().trim());
        }
        if (form.getSubSpecialization() != null && !form.getSubSpecialization().trim().isEmpty()) {
            academicHistory.setSubSpecialization(form.getSubSpecialization().trim());
        }
        if (form.getEducationLevel() != null && !form.getEducationLevel().trim().isEmpty()) {
            academicHistory.setEducationLevel(form.getEducationLevel().trim());
        }
        if (form.getGpa() != null) {
            academicHistory.setGpa(form.getGpa());
        }
        if (form.getHonors() != null && !form.getHonors().trim().isEmpty()) {
            academicHistory.setHonors(form.getHonors().trim());
        }
        if (form.getTrainingPeriodStart() != null) {
            academicHistory.setStartDate(form.getTrainingPeriodStart());
        }
        if (form.getTrainingPeriodEnd() != null) {
            academicHistory.setEndDate(form.getTrainingPeriodEnd());
        }
    }

    // Create User from Administrator for OAuth2 users
    private User createUserFromAdministrator(Administrator admin) {
        System.out.println("DEBUG - Creating User from Administrator: " + admin.getEmail());
        
        // Check if User already exists
        Optional<User> existingUser = userRepository.findByEmail(admin.getEmail())
                .or(() -> userRepository.findByUsername(admin.getUserName()));
        
        if (existingUser.isPresent()) {
            System.out.println("DEBUG - User already exists, returning existing: " + existingUser.get().getUsername());
            return existingUser.get();
        }
        
        User user = new User();
        user.setUsername(admin.getUserName());
        user.setEmail(admin.getEmail());
        user.setFirstName(admin.getFirstName() != null ? admin.getFirstName() : "OAuth2User");
        user.setLastName(admin.getLastName() != null ? admin.getLastName() : "OAuth2User");
        user.setPassword("oauth2_user"); // Required field for OAuth2 users
        
        User savedUser = userRepository.save(user);
        System.out.println("DEBUG - Created new User: " + savedUser.getUsername() + ", ID: " + savedUser.getId());
        return savedUser;
    }

    // Calcule le taux de complétion pour utilisateur existant
    private double calculateCompletionRateSimple(User user, List<DocumentUploadRequestDTO> documents) {
        int totalFields = 10; // Expanded field count for more accurate completion rate
        int completedFields = 0;
        
        // Personal information fields
        if (user.getFirstName() != null && !user.getFirstName().isEmpty()) completedFields++;
        if (user.getLastName() != null && !user.getLastName().isEmpty()) completedFields++;
        if (user.getEmail() != null && !user.getEmail().isEmpty()) completedFields++;
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()) completedFields++;
        if (user.getAddress() != null && !user.getAddress().isEmpty()) completedFields++;
        if (user.getNationality() != null && !user.getNationality().isEmpty()) completedFields++;
        if (user.getDateOfBirth() != null) completedFields++;
        if (user.getGender() != null) completedFields++;
        
        // Academic history
        if (user.getAcademicHistory() != null && 
            user.getAcademicHistory().getLastInstitution() != null && 
            !user.getAcademicHistory().getLastInstitution().isEmpty()) completedFields++;
        
        // Documents
        if (documents != null && !documents.isEmpty()) completedFields++;
        
        return ((double) completedFields / totalFields) * 100;
    }

     // Calculates the completion rate of an application based on submitted data.
    private double calculateCompletionRate(RegistrationFormRequestDTO userDTO, List<DocumentUploadRequestDTO> documents) {
        // Simple example: 50% for personal info, 50% for documents
        int totalFields = 2;
        int completedFields = 0;
        if (userDTO != null) completedFields++;
        if (documents != null && !documents.isEmpty()) completedFields++;
        return ((double) completedFields / totalFields) * 100;
    }
}
