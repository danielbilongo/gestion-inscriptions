package com.groupe.gestin_inscription.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class AcademicHistoryRequestDTO {
    private String lastInstitution;
    private String specialization;
    private String subSpecialization;
    private String educationLevel;
    private Double gpa;
    private String honors;
    private String formationPeriodStart; // Represents a Date
    private String formationPeriodEnd;   // Represents a Date
    // Getters and Setters
}
