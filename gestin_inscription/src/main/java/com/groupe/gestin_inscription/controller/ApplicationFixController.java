package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/applications/fix")
@Profile("dev")
@CrossOrigin(origins = "*")
public class ApplicationFixController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @PostMapping("/set-creation-dates")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> fixApplicationCreationDates() {
        try {
            // Find applications without creation dates
            List<Application> appsWithoutDates = applicationRepository.findAll().stream()
                .filter(app -> app.getCreatedAt() == null)
                .toList();
            
            int updatedCount = 0;
            LocalDateTime now = LocalDateTime.now();
            
            for (Application app : appsWithoutDates) {
                // Use submissionDate if available, otherwise use current time
                app.setCreatedAt(app.getSubmissionDate() != null ? app.getSubmissionDate() : now);
                app.setUpdatedAt(now);
                applicationRepository.save(app);
                updatedCount++;
            }
            
            return ResponseEntity.ok("Fixed " + updatedCount + " applications by setting their creation dates");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fixing application creation dates: " + e.getMessage());
        }
    }
}