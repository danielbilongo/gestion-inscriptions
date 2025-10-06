package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin-init")
public class AdminInitController {

    @Autowired
    private AdministratorRepository administratorRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Value("${app.admin.username:super-admin}")
    private String adminUsername;
    
    @Value("${app.admin.password:adminpass}")
    private String adminPassword;
    
    @Value("${app.admin.email:admin@example.com}")
    private String adminEmail;

    @PostMapping("/create-admin")
    public ResponseEntity<Map<String, Object>> createAdmin() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Administrator> existingAdmin = administratorRepository.findByEmail(adminEmail);
            
            if (existingAdmin.isPresent()) {
                response.put("success", false);
                response.put("message", "Admin déjà existant");
                response.put("details", "Un administrateur avec cet email existe déjà");
                response.put("credentials", Map.of(
                    "username", adminUsername,
                    "email", adminEmail,
                    "password", "adminpass"
                ));
                return ResponseEntity.ok(response);
            }
            
            Administrator newAdmin = Administrator.builder()
                    .userName(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .role(AdministratorRole.SUPER_ADMIN)
                    .firstName("Super")
                    .lastName("Admin")
                    .build();
            
            administratorRepository.save(newAdmin);
            
            response.put("success", true);
            response.put("message", "Admin créé avec succès");
            response.put("credentials", Map.of(
                "username", adminUsername,
                "email", adminEmail,
                "password", "adminpass"
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la création");
            response.put("details", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/check-admin")
    public ResponseEntity<Map<String, Object>> checkAdmin() {
        Map<String, Object> response = new HashMap<>();
        
        Optional<Administrator> admin = administratorRepository.findByEmail(adminEmail);
        
        response.put("adminExists", admin.isPresent());
        response.put("configuredEmail", adminEmail);
        response.put("configuredUsername", adminUsername);
        
        if (admin.isPresent()) {
            response.put("adminId", admin.get().getId());
            response.put("adminRole", admin.get().getRole().name());
        }
        
        return ResponseEntity.ok(response);
    }
}