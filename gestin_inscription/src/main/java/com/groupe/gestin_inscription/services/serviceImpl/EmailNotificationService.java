package com.groupe.gestin_inscription.services.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@sigec.cm}")
    private String fromEmail;

    public void sendDocumentRejectionEmail(String toEmail, String candidateName, String documentName, String rejectionReason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Document rejeté - " + documentName);
            
            String emailBody = String.format(
                "Bonjour %s,\n\n" +
                "Votre document '%s' a été rejeté pour la raison suivante :\n\n" +
                "%s\n\n" +
                "Veuillez soumettre un nouveau document conforme aux exigences.\n\n" +
                "Pour toute question, n'hésitez pas à nous contacter.\n\n" +
                "Cordialement,\n" +
                "L'équipe SIGEC",
                candidateName,
                documentName,
                rejectionReason
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            System.out.println("Document rejection email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send document rejection email: " + e.getMessage());
        }
    }

    public void sendApplicationApprovalEmail(String toEmail, String candidateName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Candidature approuvée - SIGEC");
            
            String emailBody = String.format(
                "Félicitations %s !\n\n" +
                "Tous vos documents ont été validés avec succès. Votre candidature est maintenant approuvée.\n\n" +
                "Vous pouvez désormais télécharger votre fiche d'inscription depuis votre espace candidat.\n\n" +
                "Prochaines étapes :\n" +
                "1. Connectez-vous à votre espace candidat\n" +
                "2. Téléchargez votre fiche d'inscription\n" +
                "3. Suivez les instructions pour finaliser votre inscription\n\n" +
                "Cordialement,\n" +
                "L'équipe SIGEC",
                candidateName
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            System.out.println("Application approval email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send application approval email: " + e.getMessage());
        }
    }

    public void sendApplicationStatusUpdateEmail(String toEmail, String candidateName, String status, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(toEmail);
            mailMessage.setSubject("Mise à jour de votre candidature - SIGEC");
            
            String emailBody = String.format(
                "Bonjour %s,\n\n" +
                "Le statut de votre candidature a été mis à jour :\n\n" +
                "Nouveau statut : %s\n\n" +
                "%s\n\n" +
                "Vous pouvez consulter les détails dans votre espace candidat.\n\n" +
                "Cordialement,\n" +
                "L'équipe SIGEC",
                candidateName,
                status,
                message
            );
            
            mailMessage.setText(emailBody);
            mailSender.send(mailMessage);
            
            System.out.println("Status update email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send status update email: " + e.getMessage());
        }
    }
}