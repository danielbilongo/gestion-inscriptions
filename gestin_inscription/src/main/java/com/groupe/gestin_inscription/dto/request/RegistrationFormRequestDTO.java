package com.groupe.gestin_inscription.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@AllArgsConstructor
@NoArgsConstructor
@Data

public class RegistrationFormRequestDTO {
    // Section 1: Personal Information
    private String firstName; // Prénom principal (concaténation de tous les prénoms)
    private String lastName;
    private String gender;
    private LocalDate dateOfBirth;
    private String nationality;
    private String idType;
    private String username;

    // Section 2: Academic History
    private String lastInstitution;
    private String specialization;
    private String subSpecialization;
    private String educationLevel;
    private Double gpa;
    private LocalDate trainingPeriodStart;
    private LocalDate trainingPeriodEnd;
    private String honors;

    // Section 4: Contact Information
    private String email;
    private String phoneNumber;
    private String address;
    private String emergencyContact;

    // Getters and Setters
}