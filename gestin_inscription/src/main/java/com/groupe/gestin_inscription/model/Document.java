package com.groupe.gestin_inscription.model;

import com.groupe.gestin_inscription.model.Enums.ValidationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor

public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String fileType;
    private double fileSizeMB;
    private String ocrNotes;
    private String filePath;

    @Column(unique = true)
    private String hash;

    @Enumerated(EnumType.STRING)
    private ValidationStatus validationStatus;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;

    // Getters and Setters
}
