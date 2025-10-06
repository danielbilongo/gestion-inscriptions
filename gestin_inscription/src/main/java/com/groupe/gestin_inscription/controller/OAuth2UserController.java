package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/oauth2-users")
public class OAuth2UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AdministratorRepository administratorRepository;

    @GetMapping("/me/form-data")
    public ResponseEntity<Map<String, Object>> getMyFormData() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Return empty form data for unauthenticated users
            response.put("authenticated", false);
            response.put("message", "No authentication - returning empty form");
            response.put("data", Map.of(
                "firstName", "",
                "lastName", "",
                "email", "",
                "phoneNumber", "",
                "address", ""
            ));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("authenticated", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}