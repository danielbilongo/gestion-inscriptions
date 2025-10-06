package com.groupe.gestin_inscription.dto.request;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.groupe.gestin_inscription.model.AcademicHistory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserRequestDTO {
    private String firstName;
    private String lastName;
    private String password;
    private String username;
    private String gender; // Use String for mapping flexibility
    private String dateOfBirth; // Use String for easier handling of date formats
    private String nationality;
    private String email;
    private String phoneNumber;
    private String address;
    private String emergencyContact;

    @JsonProperty("academicHistory")
    private AcademicHistoryRequestDTO academicHistory;
    // Getters and Setters
}