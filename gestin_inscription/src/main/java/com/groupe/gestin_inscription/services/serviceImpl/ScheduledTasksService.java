package com.groupe.gestin_inscription.services.serviceImpl;

import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import com.groupe.gestin_inscription.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasksService {

    private final ApplicationRepository applicationRepository;
    private final EmailServiceImpl emailService;
    private final NotificationServiceImpl notificationService;

    /**
     * Vérifie les dossiers bloqués toutes les heures
     * Envoie des alertes pour les dossiers en attente depuis plus de 48h
     */
    @Scheduled(fixedRate = 3600000) // Toutes les heures
    public void checkBlockedApplications() {
        log.info("Checking for blocked applications...");
        
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(48);
        
        List<Application> blockedApplications = applicationRepository.findAll().stream()
                .filter(app -> app.getStatus() == ApplicationStatus.MANUAL_REVIEW)
                .filter(app -> app.getLastUpdated() != null && app.getLastUpdated().isBefore(cutoffTime))
                .toList();
        
        if (!blockedApplications.isEmpty()) {
            log.warn("Found {} blocked applications (>48h in manual review)", blockedApplications.size());
            
            // Envoyer des notifications aux agents
            for (Application app : blockedApplications) {
                if (app.getAssignedAdmin() != null) {
                    String subject = "Dossier bloqué - Action requise";
                    String message = String.format(
                        "Le dossier #%d de %s %s est en attente de validation depuis plus de 48h.",
                        app.getId(),
                        app.getApplicantName().getFirstName(),
                        app.getApplicantName().getLastName()
                    );
                    
                    emailService.sendSimpleNotification(
                        app.getAssignedAdmin().getEmail(),
                        subject,
                        message
                    );
                }
            }
        }
    }

    /**
     * Envoie des rappels quotidiens aux candidats
     * Exécuté tous les jours à 9h00
     */
    @Scheduled(cron = "0 0 9 * * *") // Tous les jours à 9h00
    public void sendDailyReminders() {
        log.info("Sending daily reminders to candidates...");
        
        // Rappels pour les dossiers incomplets
        List<Application> incompleteApplications = applicationRepository.findAll().stream()
                .filter(app -> app.getCompletionRate() < 100.0)
                .filter(app -> app.getStatus() == ApplicationStatus.PRE_VALIDATION)
                .toList();
        
        for (Application app : incompleteApplications) {
            String subject = "Complétez votre dossier d'inscription - SIGEC";
            String message = String.format(
                "Bonjour %s,\n\n" +
                "Votre dossier d'inscription est à %.1f%% de complétion.\n" +
                "Connectez-vous à votre espace personnel pour le finaliser.\n\n" +
                "Cordialement,\nL'équipe SIGEC",
                app.getApplicantName().getFirstName(),
                app.getCompletionRate()
            );
            
            emailService.sendSimpleNotification(
                app.getApplicantName().getEmail(),
                subject,
                message
            );
        }
        
        log.info("Sent {} daily reminders", incompleteApplications.size());
    }

    /**
     * Nettoie les anciennes données temporaires
     * Exécuté tous les dimanches à 2h00
     */
    @Scheduled(cron = "0 0 2 * * SUN") // Tous les dimanches à 2h00
    public void cleanupOldData() {
        log.info("Starting weekly cleanup of old data...");
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);
        
        // Nettoyer les applications rejetées anciennes
        List<Application> oldRejectedApplications = applicationRepository.findAll().stream()
                .filter(app -> app.getStatus() == ApplicationStatus.REJECTED)
                .filter(app -> app.getLastUpdated() != null && app.getLastUpdated().isBefore(cutoffDate))
                .toList();
        
        log.info("Found {} old rejected applications to archive", oldRejectedApplications.size());
        
        // En production, ces données seraient archivées plutôt que supprimées
        // applicationRepository.deleteAll(oldRejectedApplications);
        
        log.info("Weekly cleanup completed");
    }

    /**
     * Génère des rapports hebdomadaires
     * Exécuté tous les lundis à 8h00
     */
    @Scheduled(cron = "0 0 8 * * MON") // Tous les lundis à 8h00
    public void generateWeeklyReports() {
        log.info("Generating weekly reports...");
        
        // Statistiques de la semaine passée
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        
        long newApplications = applicationRepository.findAll().stream()
                .filter(app -> app.getSubmissionDate() != null && app.getSubmissionDate().isAfter(weekStart))
                .count();
        
        long processedApplications = applicationRepository.findAll().stream()
                .filter(app -> app.getLastUpdated() != null && app.getLastUpdated().isAfter(weekStart))
                .filter(app -> app.getStatus() == ApplicationStatus.APPROVED || 
                              app.getStatus() == ApplicationStatus.REJECTED)
                .count();
        
        String reportSubject = "Rapport hebdomadaire SIGEC";
        String reportMessage = String.format(
            "Rapport de la semaine du %s:\n\n" +
            "📊 Nouvelles candidatures: %d\n" +
            "✅ Dossiers traités: %d\n" +
            "📈 Taux de traitement: %.1f%%\n\n" +
            "Cordialement,\nSystème SIGEC",
            weekStart.toLocalDate(),
            newApplications,
            processedApplications,
            newApplications > 0 ? (processedApplications * 100.0 / newApplications) : 0.0
        );
        
        // Envoyer le rapport aux administrateurs
        // En production, récupérer la liste des administrateurs depuis la base
        log.info("Weekly report generated: {} new applications, {} processed", 
                newApplications, processedApplications);
    }

    /**
     * Vérifie l'état du système toutes les 30 minutes
     */
    @Scheduled(fixedRate = 1800000) // Toutes les 30 minutes
    public void systemHealthCheck() {
        try {
            // Vérifier la connectivité à la base de données
            long totalApplications = applicationRepository.count();
            
            // Vérifier l'espace disque (simulation)
            // En production, vérifier l'espace disque réel
            
            log.debug("System health check passed - {} applications in database", totalApplications);
            
        } catch (Exception e) {
            log.error("System health check failed", e);
            
            // En production, envoyer une alerte aux administrateurs
            String alertSubject = "ALERTE SYSTÈME - SIGEC";
            String alertMessage = "Une erreur système a été détectée: " + e.getMessage();
            
            // emailService.sendSimpleNotification("admin@sigec.com", alertSubject, alertMessage);
        }
    }
}