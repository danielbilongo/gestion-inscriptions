package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.Notification;
import com.groupe.gestin_inscription.model.Enums.NotificationType;
import com.groupe.gestin_inscription.services.serviceImpl.NotificationServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Management", description = "Endpoints for managing notifications")
public class NotificationController {

    @Autowired
    private NotificationServiceImpl notificationService;

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE', 'ROLE_AGENT', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getMyNotifications() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            // Pour l'instant, retourner des notifications de test
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notifications", List.of());
            response.put("count", 0);
            response.put("message", "Aucune notification");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la récupération des notifications");
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE', 'ROLE_AGENT', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification marquée comme lue");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la mise à jour");
            return ResponseEntity.status(500).body(error);
        }
    }
}