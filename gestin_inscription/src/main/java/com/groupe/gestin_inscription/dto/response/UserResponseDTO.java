package com.groupe.gestin_inscription.dto.response;

import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.model.Enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data

public class UserResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private AdministratorRole AdministratorRole;
    private String phoneNumber;
    private String address;
    
    // Additional fields for complete user information
    private Gender gender;
    private LocalDate dateOfBirth;
    private String nationality;
    private String userIdNum;
    private String emergencyContact;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserResponseDTO(Long id,
                           String username,
                           String firstName,
                           String lastName,
                           String email,
                           AdministratorRole administratorRole) {
        this.id=id;
        this.username=username;
        this.firstName=firstName;
        this.lastName=lastName;
        this.email=email;
        this.AdministratorRole=administratorRole;

    }
    // Getters and Setters
}
