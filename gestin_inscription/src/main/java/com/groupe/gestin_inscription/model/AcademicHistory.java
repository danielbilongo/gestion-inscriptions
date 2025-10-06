package com.groupe.gestin_inscription.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcademicHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String lastInstitution;
    private String specialization;
    private String subSpecialization;
    private String educationLevel;
    private Double gpa;
    private String honors;
    private LocalDate startDate;
    private LocalDate endDate;

    // Relationships
    @OneToOne(mappedBy = "academicHistory")
    private User user;

    // Getters and Setters
}