package com.groupe.gestin_inscription.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ApplicationSubmissionRequestDTO {
    
    private PersonalInfoDTO personalInfo;
    private ContactInfoDTO contactInfo;
    private AcademicHistoryDTO academicHistory;
    private String targetInstitution; // Institution cible pour cette candidature
    private String specialization; // Spécialité demandée
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalInfoDTO {
        private String lastName;
        private String[] firstNames;
        private String gender;
        private LocalDate birthDate;
        private String nationality;
        private String idType;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactInfoDTO {
        private String email;
        private String emailConfirm;
        private String countryCode;
        private String phone;
        private AddressDTO address;
        private EmergencyContactDTO emergencyContact;
        private Boolean emailNotifications;
        private Boolean smsNotifications;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmergencyContactDTO {
        private String name;
        private String phone;
        private String relationship;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDTO {
        private String street;
        private String city;
        private String postalCode;
        private String country;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcademicHistoryDTO {
        private String lastInstitution;
        private String specialization;
        private String subSpecialization;
        private LocalDate startDate;
        private LocalDate endDate;
        private String educationLevel;
        private Double gpa;
        private String[] honors;
    }
}