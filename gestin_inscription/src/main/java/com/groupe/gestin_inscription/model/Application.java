package com.groupe.gestin_inscription.model;

import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "candidat")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime submissionDate;
    private double completionRate;
    private LocalDateTime lastUpdated;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;
    
    private String targetInstitution = "DEFAULT_INSTITUTION"; // Institution cible pour cette candidature
    private String specialization = "DEFAULT_SPECIALIZATION"; // Spécialité demandée

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_admin_id")
    private Administrator assignedAdmin;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User applicantName;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Document> documents;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and Setters
}
