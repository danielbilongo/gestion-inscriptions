package com.groupe.gestin_inscription.model;

import com.groupe.gestin_inscription.model.Enums.NotificationStatus;
import com.groupe.gestin_inscription.model.Enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String titre;
    private String message;
    private boolean isRead = false;

    @Enumerated(EnumType.STRING)
    private NotificationStatus status;

    private LocalDateTime dateCreation;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}