package com.groupe.gestin_inscription.services.serviceInterfaces;

import com.groupe.gestin_inscription.dto.request.DocumentUploadRequestDTO;
import com.groupe.gestin_inscription.model.Document;

import java.util.List;

public interface DocumentService {
    public Document uploadDocument(Long applicationId, DocumentUploadRequestDTO docDTO);
    public boolean performAutomaticValidation(Document document);
    public boolean detectDocumentCopy(Document document);
    public void manualValidation(Long documentId, Long adminId);
    public List<Document> getDocumentsByApplicationId(Long applicationId);
    public List<Document> getAllDocuments();
    public void deleteDocument(Long documentId);
}
