package com.groupe.gestin_inscription.dto.response;

import com.groupe.gestin_inscription.model.Enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponseDTO {
    private Long id;
    private Long recipientId;
    private String titre;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime dateCreation;
}
