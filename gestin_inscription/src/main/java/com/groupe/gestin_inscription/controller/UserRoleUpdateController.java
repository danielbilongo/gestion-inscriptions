package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.HtmlUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/dev/update-role")
@Profile("dev")
@CrossOrigin(origins = "*")
public class UserRoleUpdateController {

    @Autowired
    private AdministratorRepository administratorRepository;

    @PostMapping
    public ResponseEntity<?> createAdminUser(@RequestParam String email, @RequestParam String role) {
        try {
            // Validation et sanitisation de l'email
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email requis"));
            }
            
            String sanitizedEmail = HtmlUtils.htmlEscape(email.trim());
            if (!isValidEmail(sanitizedEmail)) {
                return ResponseEntity.badRequest().body(createErrorResponse("Format d'email invalide"));
            }
            
            // Validation du rôle
            if (role == null || role.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Rôle requis"));
            }
            
            AdministratorRole adminRole;
            try {
                adminRole = AdministratorRole.valueOf(role.toUpperCase().trim());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(createErrorResponse("Rôle invalide"));
            }
            
            Administrator admin = Administrator.builder()
                    .email(sanitizedEmail)
                    .userName(sanitizedEmail)
                    .firstName("OAuth2")
                    .lastName("Admin")
                    .password("")
                    .role(adminRole)
                    .build();

            Administrator savedAdmin = administratorRepository.save(admin);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Utilisateur admin créé avec succès");
            response.put("email", HtmlUtils.htmlEscape(savedAdmin.getEmail()));
            response.put("role", savedAdmin.getRole().name());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse("Données invalides"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createErrorResponse("Erreur lors de la création"));
        }
    }
    
    private boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        Pattern pattern = Pattern.compile(emailRegex);
        return pattern.matcher(email).matches();
    }
    
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}