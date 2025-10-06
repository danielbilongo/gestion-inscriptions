package com.groupe.gestin_inscription.services.serviceInterfaces;

import com.groupe.gestin_inscription.model.Notification;
import com.groupe.gestin_inscription.model.Enums.NotificationType;
import jakarta.mail.MessagingException;

import java.util.List;

public interface NotificationService {

    public void sendEmailNotification(String recipient, String template, String subject) throws MessagingException;

    public void sendSmsReminder(String phoneNumber, String message);

    public void sendInAppNotification(Long userId, String message);

    // Nouvelles méthodes pour la gestion des notifications persistantes
    public Notification createNotification(Long userId, String titre, String message, NotificationType type);
    
    public List<Notification> getNotificationsByUserId(Long userId);
    
    public Notification markAsRead(Long notificationId);
    
    public void markAllAsRead(Long userId);
    
    public Notification getNotificationById(Long notificationId);
}
