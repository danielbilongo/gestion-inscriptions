package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/oauth2/create-user")
@Profile("dev")
@CrossOrigin(origins = "*")
public class OAuth2UserCreationController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createOAuth2User(@RequestParam String email) {
        try {
            Optional<User> existingUser = userRepository.findByEmail(email);
            
            if (existingUser.isPresent()) {
                return ResponseEntity.ok("User already exists: " + email);
            }

            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(email);
            newUser.setFirstName("OAuth2");
            newUser.setLastName("User");
            newUser.setPassword(""); // No password for OAuth2
            newUser.setAdministratorRole(AdministratorRole.CANDIDATE); // Set as candidate

            User savedUser = userRepository.save(newUser);
            
            return ResponseEntity.ok("OAuth2 user created successfully: " + savedUser.getEmail() + " (ID: " + savedUser.getId() + ")");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating user: " + e.getMessage());
        }
    }
}