package com.groupe.gestin_inscription.model;

import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Administrator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String userName;

    @Enumerated(EnumType.STRING)
    private AdministratorRole role;

    // Getters and Setters
}