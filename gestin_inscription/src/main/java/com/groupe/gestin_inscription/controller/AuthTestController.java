package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth-test")
public class AuthTestController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AdministratorRepository administratorRepository;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        Map<String, Object> response = new HashMap<>();
        
        if (authentication != null && authentication.isAuthenticated()) {
            response.put("authenticated", true);
            response.put("username", authentication.getName());
            response.put("authorities", authentication.getAuthorities());
            response.put("principal", authentication.getPrincipal().getClass().getSimpleName());
        } else {
            response.put("authenticated", false);
            response.put("message", "No authentication found");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/protected-test")
    public ResponseEntity<Map<String, Object>> protectedTest() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
                response.put("message", "Protected endpoint accessed successfully");
                response.put("username", authentication.getName());
                response.put("authorities", authentication.getAuthorities().toString());
                response.put("authenticated", true);
            } else {
                response.put("message", "Access denied - authentication required");
                response.put("authenticated", false);
                response.put("username", null);
            }
            
        } catch (Exception e) {
            response.put("message", "Error checking authentication");
            response.put("error", e.getMessage());
            response.put("authenticated", false);
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/create-complete-user/{email}")
    public ResponseEntity<Map<String, Object>> createCompleteUser(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Créer dans la table User
            com.groupe.gestin_inscription.model.User user = new com.groupe.gestin_inscription.model.User();
            user.setEmail(email);
            user.setUsername(email);
            user.setFirstName(email.split("@")[0]);
            user.setLastName("TestUser");
            user.setPassword("oauth2_user"); // Required field
            
            com.groupe.gestin_inscription.model.User savedUser = userRepository.save(user);
            
            // Créer aussi dans la table Administrator
            Administrator admin = new Administrator();
            admin.setEmail(email);
            admin.setUserName(email);
            admin.setFirstName(email.split("@")[0]);
            admin.setLastName("TestUser");
            admin.setPassword("");
            admin.setRole(com.groupe.gestin_inscription.model.Enums.AdministratorRole.CANDIDATE);
            
            Administrator savedAdmin = administratorRepository.save(admin);
            
            response.put("success", true);
            response.put("message", "Complete user created in both tables");
            response.put("user", Map.of(
                "userId", savedUser.getId(),
                "adminId", savedAdmin.getId(),
                "email", savedUser.getEmail(),
                "username", savedUser.getUsername()
            ));
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/check-user/{email}")
    public ResponseEntity<Map<String, Object>> checkUser(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        
        // Vérifier dans la table User
        boolean userExists = userRepository.findByEmail(email).isPresent() || 
                           userRepository.findByUsername(email).isPresent();
        
        // Vérifier dans la table Administrator
        boolean adminExists = administratorRepository.findByEmail(email).isPresent() || 
                            administratorRepository.findByUserName(email).isPresent();
        
        response.put("email", email);
        response.put("existsInUserTable", userExists);
        response.put("existsInAdminTable", adminExists);
        
        if (adminExists) {
            Administrator admin = administratorRepository.findByEmail(email)
                    .or(() -> administratorRepository.findByUserName(email))
                    .orElse(null);
            if (admin != null) {
                response.put("adminInfo", Map.of(
                    "id", admin.getId(),
                    "userName", admin.getUserName(),
                    "email", admin.getEmail(),
                    "role", admin.getRole(),
                    "firstName", admin.getFirstName(),
                    "lastName", admin.getLastName()
                ));
            }
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/create-oauth2-user/{email}")
    public ResponseEntity<Map<String, Object>> createOAuth2User(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Vérifier si l'utilisateur existe déjà dans Administrator
            if (administratorRepository.findByEmail(email).isEmpty()) {
                // Créer l'utilisateur OAuth2 dans Administrator
                Administrator oauth2User = new Administrator();
                oauth2User.setEmail(email);
                oauth2User.setUserName(email);
                oauth2User.setFirstName(email.split("@")[0]);
                oauth2User.setLastName("");
                oauth2User.setPassword("");
                oauth2User.setRole(com.groupe.gestin_inscription.model.Enums.AdministratorRole.CANDIDATE);
                administratorRepository.save(oauth2User);
            }
            
            // Créer aussi dans la table User si pas déjà présent
            if (userRepository.findByEmail(email).isEmpty()) {
                com.groupe.gestin_inscription.model.User user = new com.groupe.gestin_inscription.model.User();
                user.setEmail(email);
                user.setUsername(email);
                user.setFirstName(email.split("@")[0]);
                user.setLastName("OAuth2User");
                user.setPassword("oauth2_user");
                
                com.groupe.gestin_inscription.model.User savedUser = userRepository.save(user);
                
                response.put("success", true);
                response.put("message", "OAuth2 user created in both tables");
                response.put("userId", savedUser.getId());
                response.put("userEmail", savedUser.getEmail());
            } else {
                response.put("success", true);
                response.put("message", "User already exists in User table");
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(response);
    }
}