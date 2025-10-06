package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.dto.response.ApplicationStatusResponseDto;
import com.groupe.gestin_inscription.dto.response.DocumentResponseDTO;
import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.Document;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import com.groupe.gestin_inscription.services.serviceImpl.ApplicationServiceImpl;
import com.groupe.gestin_inscription.services.serviceImpl.DocumentServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/applications")
@Tag(name = "Admin Application Management", description = "Endpoints for administrators to manage applications and documents")
@PreAuthorize("hasRole('AGENT') or hasRole('SUPER_ADMIN')")
public class AdminApplicationController {

    @Autowired
    private ApplicationServiceImpl applicationService;
    
    @Autowired
    private DocumentServiceImpl documentService;

    @Operation(summary = "Get all applications with documents for review")
    @GetMapping("/review")
    public ResponseEntity<?> getApplicationsForReview() {
        try {
            List<Application> applications = applicationService.getApplicationsByStatus(ApplicationStatus.UNDER_REVIEW);
            applications.addAll(applicationService.getApplicationsByStatus(ApplicationStatus.MANUAL_REVIEW));
            
            List<Map<String, Object>> applicationsWithDocuments = applications.stream()
                .map(this::convertToDetailedDto)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("applications", applicationsWithDocuments);
            response.put("count", applicationsWithDocuments.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors de la récupération des candidatures");
            return ResponseEntity.status(500).body(error);
        }
    }

    @Operation(summary = "Get application details with documents")
    @GetMapping("/{applicationId}/details")
    public ResponseEntity<?> getApplicationDetails(@PathVariable Long applicationId) {
        try {
            Application application = applicationService.getApplicationById(applicationId);
            List<Document> documents = documentService.getDocumentsByApplicationId(applicationId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("application", convertToDetailedDto(application));
            response.put("documents", documents.stream().map(this::convertDocumentToDto).collect(Collectors.toList()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Candidature non trouvée");
            return ResponseEntity.status(404).body(error);
        }
    }

    @Operation(summary = "Get applications dashboard statistics")
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            List<Application> allApplications = applicationService.getAllApplications();
            
            long pending = allApplications.stream().filter(a -> a.getStatus() == ApplicationStatus.PENDING).count();
            long underReview = allApplications.stream().filter(a -> a.getStatus() == ApplicationStatus.UNDER_REVIEW).count();
            long manualReview = allApplications.stream().filter(a -> a.getStatus() == ApplicationStatus.MANUAL_REVIEW).count();
            long approved = allApplications.stream().filter(a -> a.getStatus() == ApplicationStatus.APPROVED).count();
            long rejected = allApplications.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", allApplications.size());
            stats.put("pending", pending);
            stats.put("underReview", underReview);
            stats.put("manualReview", manualReview);
            stats.put("approved", approved);
            stats.put("rejected", rejected);
            stats.put("needsAttention", underReview + manualReview);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Erreur lors du calcul des statistiques");
            return ResponseEntity.status(500).body(error);
        }
    }

    private Map<String, Object> convertToDetailedDto(Application application) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", application.getId());
        dto.put("status", application.getStatus().name());
        dto.put("submissionDate", application.getSubmissionDate());
        dto.put("lastUpdated", application.getUpdatedAt());
        dto.put("completionRate", application.getCompletionRate());
        
        User applicant = application.getApplicantName();
        if (applicant != null) {
            Map<String, Object> candidateInfo = new HashMap<>();
            candidateInfo.put("id", applicant.getId());
            candidateInfo.put("name", applicant.getFirstName() + " " + applicant.getLastName());
            candidateInfo.put("email", applicant.getEmail());
            candidateInfo.put("phone", applicant.getPhoneNumber());
            candidateInfo.put("nationality", applicant.getNationality());
            dto.put("candidate", candidateInfo);
        }
        
        // Get documents summary
        List<Document> documents = documentService.getDocumentsByApplicationId(application.getId());
        long validatedDocs = documents.stream().filter(d -> d.getValidationStatus().name().equals("VALIDATED")).count();
        long rejectedDocs = documents.stream().filter(d -> d.getValidationStatus().name().equals("REJECTED")).count();
        long pendingDocs = documents.stream().filter(d -> d.getValidationStatus().name().equals("PENDING")).count();
        
        Map<String, Object> docsSummary = new HashMap<>();
        docsSummary.put("total", documents.size());
        docsSummary.put("validated", validatedDocs);
        docsSummary.put("rejected", rejectedDocs);
        docsSummary.put("pending", pendingDocs);
        dto.put("documentsSummary", docsSummary);
        
        return dto;
    }
    
    private DocumentResponseDTO convertDocumentToDto(Document document) {
        DocumentResponseDTO dto = new DocumentResponseDTO();
        dto.setId(document.getId());
        dto.setName(document.getName());
        dto.setFileType(document.getFileType());
        dto.setValidationStatus(document.getValidationStatus().name());
        dto.setOcrNotes(document.getOcrNotes());
        return dto;
    }
}