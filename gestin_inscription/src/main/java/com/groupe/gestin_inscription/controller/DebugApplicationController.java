package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.repository.ApplicationRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.groupe.gestin_inscription.model.Application;

@RestController
@RequestMapping("/api/debug")
public class DebugApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AdministratorRepository administratorRepository;

    @GetMapping("/check-user/{email}")
    public ResponseEntity<Map<String, Object>> checkUserStatus(@PathVariable String email) {
        Map<String, Object> result = new HashMap<>();
        
        // Check User table
        Optional<User> user = userRepository.findByEmail(email);
        result.put("userExists", user.isPresent());
        if (user.isPresent()) {
            result.put("userId", user.get().getId());
            result.put("username", user.get().getUsername());
        }
        
        // Check Administrator table
        Optional<Administrator> admin = administratorRepository.findByEmail(email);
        result.put("adminExists", admin.isPresent());
        if (admin.isPresent()) {
            result.put("adminId", admin.get().getId());
            result.put("adminUsername", admin.get().getUserName());
        }
        
        // Check Applications
        if (user.isPresent()) {
            List<Application> applications = applicationRepository.findByApplicantName(user.get());
            result.put("applicationCount", applications.size());
            result.put("hasApplication", !applications.isEmpty());
        } else {
            result.put("applicationCount", 0);
            result.put("hasApplication", false);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/delete-applications/{email}")
    public ResponseEntity<Map<String, String>> deleteApplications(@PathVariable String email) {
        Map<String, String> result = new HashMap<>();
        
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            List<Application> applications = applicationRepository.findByApplicantName(user.get());
            applicationRepository.deleteAll(applications);
            result.put("message", "Deleted " + applications.size() + " applications for " + email);
        } else {
            result.put("message", "No user found with email " + email);
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/my-applications/{email}")
    public ResponseEntity<Map<String, Object>> getMyApplicationsDebug(@PathVariable String email) {
        Map<String, Object> result = new HashMap<>();
        
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            List<Application> applications = applicationRepository.findByApplicantName(user.get());
            result.put("success", true);
            result.put("userFound", true);
            result.put("applicationCount", applications.size());
            result.put("applications", applications.stream().map(app -> {
                Map<String, Object> appInfo = new HashMap<>();
                appInfo.put("id", app.getId());
                appInfo.put("status", app.getStatus().name());
                appInfo.put("submissionDate", app.getSubmissionDate());
                appInfo.put("completionRate", app.getCompletionRate());
                return appInfo;
            }).collect(java.util.stream.Collectors.toList()));
        } else {
            result.put("success", false);
            result.put("userFound", false);
            result.put("message", "No user found with email " + email);
        }
        
        return ResponseEntity.ok(result);
    }
}