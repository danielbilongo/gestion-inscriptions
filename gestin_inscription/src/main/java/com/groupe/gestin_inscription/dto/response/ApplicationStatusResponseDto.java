package com.groupe.gestin_inscription.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ApplicationStatusResponseDto {
    private Long applicationId;
    private String Status; // e.g., "Pré-validation", "Contrôle manuel"
    private double completionRate; // For the progress bar
    private List<DocumentResponseDTO> documentsStatus;
    private List<NotificationResponseDTO> recentNotifications;
    private LocalDateTime submissionDate;
    private String ApplicantName;
    private String username;
    private String userIdNum;
    private LocalDateTime createdAt;
}
