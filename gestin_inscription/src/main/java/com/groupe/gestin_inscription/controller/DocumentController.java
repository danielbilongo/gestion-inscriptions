package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.dto.request.DocumentUploadRequestDTO;
import com.groupe.gestin_inscription.dto.response.DocumentResponseDTO;
import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.Document;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import com.groupe.gestin_inscription.services.serviceImpl.DocumentServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Document Management", description = "Endpoints for handling document uploads and validation")
public class DocumentController {

    @Autowired
    private DocumentServiceImpl documentService;
    @Autowired
    private AdministratorRepository administratorRepository;

    @Operation(summary = "Upload a document for an application")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Document uploaded successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = DocumentResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid file or validation error"),
            @ApiResponse(responseCode = "403", description = "Forbidden access")
    })
    @PostMapping("/upload/{applicationId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<DocumentResponseDTO> uploadDocument(
            @PathVariable Long applicationId,
            @RequestPart("documentType") String documentType,
            @RequestPart("file") MultipartFile file) {

        DocumentUploadRequestDTO docDTO = new DocumentUploadRequestDTO();
        docDTO.setDocumentType(documentType);
        docDTO.setFileContent(file);

        Document uploadedDocument = documentService.uploadDocument(applicationId, docDTO);
        return ResponseEntity.ok(convertToDto(uploadedDocument));
    }

    @Operation(summary = "Manually validate a document by an agent")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Document validated successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden access"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @PostMapping("/validate/{documentId}")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<Void> validateDocument(@PathVariable Long documentId) {
        // Get the authenticated user's details from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminUsername;

        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            adminUsername = userDetails.getUsername();
        } else {
            throw new IllegalStateException("Authentication principal not found or is not a UserDetails instance.");
        }

        // Finding the administrator's ID using their username (not email)
        Administrator adminUser = administratorRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found with username: " + adminUsername));

        Long adminId = adminUser.getId();

        // Passing the retrieved adminId to the service layer for object-level security checks
        documentService.manualValidation(documentId, adminId);
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "Reject a document with custom message")
    @PostMapping("/reject/{documentId}")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<Void> rejectDocument(
            @PathVariable Long documentId,
            @RequestBody String rejectionMessage) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminUsername = authentication.getName();
        
        Administrator adminUser = administratorRepository.findByUserName(adminUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found with username: " + adminUsername));
        
        documentService.rejectDocument(documentId, rejectionMessage, adminUser.getId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get a list of all documents for a specific application")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documents retrieved successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden access")
    })
    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN', 'CANDIDATE')")
    public ResponseEntity<List<DocumentResponseDTO>> getDocumentsByApplication(@PathVariable Long applicationId) {
        try {
            List<Document> documents = documentService.getDocumentsByApplicationId(applicationId);
            List<DocumentResponseDTO> documentDTOs = documents.stream().map(this::convertToDto).toList();
            return ResponseEntity.ok(documentDTOs);
        } catch (Exception e) {
            System.err.println("Error loading documents for application " + applicationId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Return empty list on error
        }
    }

    @Operation(summary = "Get all documents (admin only)")
    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<DocumentResponseDTO>> getAllDocuments() {
        List<Document> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(documents.stream().map(this::convertToDto).toList());
    }

    @Operation(summary = "Preview a document")
    @GetMapping("/{documentId}/preview")
    public ResponseEntity<String> previewDocument(@PathVariable Long documentId) {
        String htmlContent = "<!DOCTYPE html>" +
            "<html><head><title>Aper\u00e7u Document #" + documentId + "</title></head>" +
            "<body style='font-family: Arial, sans-serif; padding: 20px;'>" +
            "<h2>Aper\u00e7u du Document #" + documentId + "</h2>" +
            "<div style='border: 1px solid #ccc; padding: 20px; margin: 20px 0; background: #f9f9f9;'>" +
            "<p><strong>Type:</strong> Document PDF</p>" +
            "<p><strong>Statut:</strong> En attente de validation</p>" +
            "<p><strong>Taille:</strong> 1.2 MB</p>" +
            "<p><strong>Date d'upload:</strong> " + java.time.LocalDateTime.now().toString() + "</p>" +
            "</div>" +
            "<div style='text-align: center; margin: 20px;'>" +
            "<p style='color: #666;'>Contenu du document sera affich\u00e9 ici</p>" +
            "<div style='width: 100%; height: 400px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center;'>" +
            "<span style='color: #999;'>Aper\u00e7u du document #" + documentId + "</span>" +
            "</div>" +
            "</div>" +
            "</body></html>";
        
        return ResponseEntity.ok()
            .header("Content-Type", "text/html; charset=utf-8")
            .body(htmlContent);
    }
    
    @Operation(summary = "Get document content for preview")
    @GetMapping("/{documentId}/content")
    public ResponseEntity<?> getDocumentContent(@PathVariable Long documentId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("documentId", documentId);
        response.put("content", "Document content placeholder");
        response.put("type", "application/pdf");
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Download a document")
    @GetMapping("/{documentId}/download")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN', 'CANDIDATE')")
    public ResponseEntity<?> downloadDocument(@PathVariable Long documentId) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document download initiated");
            response.put("documentId", documentId);
            response.put("note", "File download functionality not yet implemented");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error downloading document: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @Operation(summary = "Delete a document")
    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }

    // This method converts a Document entity to a DocumentResponseDTO
    private DocumentResponseDTO convertToDto(Document document) {
        DocumentResponseDTO dto = new DocumentResponseDTO();
        dto.setId(document.getId());
        dto.setName(document.getName());
        dto.setFileType(document.getFileType());
        dto.setValidationStatus(document.getValidationStatus().name());
        dto.setOcrNotes(document.getOcrNotes());
        return dto;
    }
    
    @Operation(summary = "Get document validation summary for application")
    @GetMapping("/validation-summary/{applicationId}")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPER_ADMIN')")
    public ResponseEntity<?> getValidationSummary(@PathVariable Long applicationId) {
        List<Document> documents = documentService.getDocumentsByApplicationId(applicationId);
        
        long totalDocs = documents.size();
        long validatedDocs = documents.stream().filter(d -> d.getValidationStatus().name().equals("VALIDATED")).count();
        long rejectedDocs = documents.stream().filter(d -> d.getValidationStatus().name().equals("REJECTED")).count();
        long pendingDocs = documents.stream().filter(d -> d.getValidationStatus().name().equals("PENDING")).count();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalDocuments", totalDocs);
        summary.put("validatedDocuments", validatedDocs);
        summary.put("rejectedDocuments", rejectedDocs);
        summary.put("pendingDocuments", pendingDocs);
        summary.put("allValidated", validatedDocs == totalDocs && totalDocs > 0);
        summary.put("documents", documents.stream().map(this::convertToDto).toList());
        
        return ResponseEntity.ok(summary);
    }
}
