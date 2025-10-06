package com.groupe.gestin_inscription.services.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@sigec.com}")
    private String fromEmail;

    @Value("${app.mail.enabled:true}")
    private boolean emailEnabled;

    @Async
    public CompletableFuture<Boolean> sendApplicationConfirmation(String toEmail, String applicantName, String applicationId) {
        if (!emailEnabled) {
            log.info("Email service disabled - skipping email to: {}", toEmail);
            return CompletableFuture.completedFuture(true);
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Confirmation de réception - Dossier d'inscription SIGEC");

            String htmlContent = buildApplicationConfirmationTemplate(applicantName, applicationId);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Application confirmation email sent to: {}", toEmail);
            return CompletableFuture.completedFuture(true);

        } catch (MessagingException e) {
            log.error("Failed to send application confirmation email to: {}", toEmail, e);
            return CompletableFuture.completedFuture(false);
        }
    }

    @Async
    public CompletableFuture<Boolean> sendApplicationStatusUpdate(String toEmail, String applicantName, 
                                                                String status, String message) {
        if (!emailEnabled) {
            log.info("Email service disabled - skipping status update email to: {}", toEmail);
            return CompletableFuture.completedFuture(true);
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Mise à jour de votre dossier - SIGEC");

            String htmlContent = buildStatusUpdateTemplate(applicantName, status, message);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("Status update email sent to: {} with status: {}", toEmail, status);
            return CompletableFuture.completedFuture(true);

        } catch (MessagingException e) {
            log.error("Failed to send status update email to: {}", toEmail, e);
            return CompletableFuture.completedFuture(false);
        }
    }

    @Async
    public CompletableFuture<Boolean> sendSimpleNotification(String toEmail, String subject, String message) {
        if (!emailEnabled) {
            log.info("Email service disabled - skipping notification to: {}", toEmail);
            return CompletableFuture.completedFuture(true);
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(toEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);

            mailSender.send(mailMessage);
            log.info("Simple notification email sent to: {}", toEmail);
            return CompletableFuture.completedFuture(true);

        } catch (Exception e) {
            log.error("Failed to send simple notification to: {}", toEmail, e);
            return CompletableFuture.completedFuture(false);
        }
    }

    private String buildApplicationConfirmationTemplate(String applicantName, String applicationId) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Confirmation de réception</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎓 SIGEC</h1>
                        <h2>Confirmation de réception</h2>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>%s</strong>,</p>
                        
                        <p>Nous avons bien reçu votre dossier d'inscription et vous remercions pour votre candidature.</p>
                        
                        <div class="highlight">
                            <strong>📋 Numéro de dossier :</strong> %s<br>
                            <strong>📅 Date de réception :</strong> %s<br>
                            <strong>⏱️ Statut :</strong> En cours de traitement
                        </div>
                        
                        <h3>📋 Prochaines étapes :</h3>
                        <ol>
                            <li><strong>Pré-validation automatique</strong> (2 minutes) - Vérification des formats</li>
                            <li><strong>Contrôle manuel</strong> (24-48h) - Examen par nos agents</li>
                            <li><strong>Notification de décision</strong> - Vous serez informé par email</li>
                        </ol>
                        
                        <p>Vous pouvez suivre l'évolution de votre dossier en vous connectant à votre espace personnel.</p>
                        
                        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
                        
                        <p>Cordialement,<br><strong>L'équipe SIGEC</strong></p>
                    </div>
                    <div class="footer">
                        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(applicantName, applicationId, LocalDateTime.now().toString());
    }

    private String buildStatusUpdateTemplate(String applicantName, String status, String message) {
        String statusColor = switch (status.toUpperCase()) {
            case "APPROVED" -> "#4caf50";
            case "REJECTED" -> "#f44336";
            case "PENDING" -> "#ff9800";
            default -> "#2196f3";
        };

        String statusIcon = switch (status.toUpperCase()) {
            case "APPROVED" -> "✅";
            case "REJECTED" -> "❌";
            case "PENDING" -> "⏳";
            default -> "📋";
        };

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Mise à jour de votre dossier</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .status-box { background: white; padding: 20px; border-left: 4px solid %s; margin: 20px 0; border-radius: 5px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎓 SIGEC</h1>
                        <h2>Mise à jour de votre dossier</h2>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>%s</strong>,</p>
                        
                        <div class="status-box">
                            <h3>%s Nouveau statut : <span style="color: %s;">%s</span></h3>
                            <p>%s</p>
                        </div>
                        
                        <p>Vous pouvez consulter les détails complets dans votre espace personnel.</p>
                        
                        <p>Cordialement,<br><strong>L'équipe SIGEC</strong></p>
                    </div>
                    <div class="footer">
                        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(statusColor, applicantName, statusIcon, statusColor, status, message);
    }
}