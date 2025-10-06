package com.groupe.gestin_inscription.services.serviceImpl;

import com.groupe.gestin_inscription.model.Notification;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.model.Enums.NotificationType;
import com.groupe.gestin_inscription.model.Enums.NotificationStatus;
import com.groupe.gestin_inscription.repository.NotificationRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import com.groupe.gestin_inscription.services.serviceInterfaces.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private JavaMailSender emailSender;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private UserRepository userRepository;

    // Uses the Email Service backend module
    @Override
    public void sendEmailNotification(String recipient, String subject, String content) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("noreply@sigec.cm"); // Adresse expéditrice configurée
        helper.setTo(recipient);
        helper.setSubject(subject);
        helper.setText(content, true); // `true` indicates HTML content

        emailSender.send(message);
    }

    // Logic for sending SMS
    @Override
    public void sendSmsReminder(String phoneNumber, String message) {
        // Your Twilio Account SID and Auth Token
        String ACCOUNT_SID = System.getenv("TWILIO_ACCOUNT_SID");
        String AUTH_TOKEN = System.getenv("TWILIO_AUTH_TOKEN");

        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);

        Message.creator(
                        new PhoneNumber(phoneNumber),
                        new PhoneNumber("+15017122661"), // Your Twilio phone number
                        message)
                .create();
    }



    // Logic for sending in-app notifications
    /**
     * Sends an in-app notification to a specific user.
     * @param userId The ID of the user to notify.
     * @param message The notification message content.
     */
    @Override
    public void sendInAppNotification(Long userId, String message) {
        // The destination is a user-specific topic, for example, /topic/notifications/{userId}
        // This pattern allows a client to subscribe to their own notifications.
        String destination = "/topic/notifications/" + userId;
        messagingTemplate.convertAndSend(destination, message);
    }

    // Nouvelles méthodes pour la gestion des notifications persistantes
    @Override
    public Notification createNotification(Long userId, String titre, String message, NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitre(titre);
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus(NotificationStatus.SENT);
        notification.setRead(false);
        
        return notificationRepository.save(notification);
    }
    
    @Override
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId);
    }
    
    @Override
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
    
    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }
    
    @Override
    public Notification getNotificationById(Long notificationId) {
        return notificationRepository.findById(notificationId).orElse(null);
    }

}