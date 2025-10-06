package com.groupe.gestin_inscription.repository;

import com.groupe.gestin_inscription.model.Document;
import com.groupe.gestin_inscription.model.Enums.ValidationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    // Custom query to find documents associated with a specific application
    /**
     * Finds all documents belonging to a specific application.
     * @param applicationId The ID of the application.
     * @return A list of documents associated with the application.
     */
    List<Document> findByApplicationId(Long applicationId);

    /**
     * Finds documents that are pending validation.
     * @return A list of documents with a PENDING validation status.
     */
    List<Document> findByValidationStatus(ValidationStatus status);
    Optional<Document> findByHash(String hash);
}
