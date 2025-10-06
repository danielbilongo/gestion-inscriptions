package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/oauth2/fix")
@Profile("dev")
@CrossOrigin(origins = "*")
public class OAuth2FixController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/set-candidate-role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> fixOAuth2Users() {
        try {
            // Find users with OAuth2 names and no role
            List<User> oauth2Users = userRepository.findAll().stream()
                .filter(user -> "OAuth2".equals(user.getFirstName()) && "User".equals(user.getLastName()))
                .filter(user -> user.getAdministratorRole() == null)
                .toList();
            
            int updatedCount = 0;
            for (User user : oauth2Users) {
                user.setAdministratorRole(AdministratorRole.CANDIDATE);
                // Set creation date if not set
                if (user.getCreatedAt() == null) {
                    user.setCreatedAt(LocalDateTime.now());
                }
                if (user.getUpdatedAt() == null) {
                    user.setUpdatedAt(LocalDateTime.now());
                }
                userRepository.save(user);
                updatedCount++;
            }
            
            return ResponseEntity.ok("Fixed " + updatedCount + " OAuth2 users by setting their role to CANDIDATE");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fixing OAuth2 users: " + e.getMessage());
        }
    }

    @PostMapping("/set-creation-dates")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> fixUserCreationDates() {
        try {
            // Find users without creation dates
            List<User> usersWithoutDates = userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt() == null)
                .toList();
            
            int updatedCount = 0;
            LocalDateTime now = LocalDateTime.now();
            
            for (User user : usersWithoutDates) {
                user.setCreatedAt(now);
                user.setUpdatedAt(now);
                userRepository.save(user);
                updatedCount++;
            }
            
            return ResponseEntity.ok("Fixed " + updatedCount + " users by setting their creation dates");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fixing user creation dates: " + e.getMessage());
        }
    }
}