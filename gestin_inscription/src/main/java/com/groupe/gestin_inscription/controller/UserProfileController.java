package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserProfileController {

    @Autowired
    private AdministratorRepository administratorRepository;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getCurrentUserProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<Administrator> userOpt = administratorRepository.findByUserName(username);
            
            if (userOpt.isPresent()) {
                Administrator user = userOpt.get();
                Map<String, Object> profile = new HashMap<>();
                profile.put("id", user.getId());
                profile.put("username", user.getUserName());
                profile.put("email", user.getEmail());
                profile.put("firstName", user.getFirstName());
                profile.put("lastName", user.getLastName());
                profile.put("role", user.getRole().name());
                
                return ResponseEntity.ok(profile);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}