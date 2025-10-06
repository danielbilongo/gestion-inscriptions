package com.groupe.gestin_inscription.model;


import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.model.Enums.Gender;
import jakarta.validation.constraints.Past;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Personal Information
    private String firstName;
    private String lastName;
    @Column(nullable = false)
    private String password;
    @Column(unique = true, nullable = false)
    private String username;
    private String userIdNum;

    @Enumerated(EnumType.STRING)
    private Gender gender;
    @Past(message = "Date de naissance doit être antérieure à aujourd'hui")
    private LocalDate dateOfBirth;
    private String nationality;
    private String emergencyContact;

    // Contact Information
    @Enumerated(EnumType.STRING)
    private AdministratorRole administratorRole;
    private String email;
    private String phoneNumber;
    private String address;

    // Relationships
    @OneToMany(mappedBy = "applicantName", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.Set<Application> applications = new java.util.HashSet<>();

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_history_id")
    private AcademicHistory academicHistory;

    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and Setters
}




