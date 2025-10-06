package com.groupe.gestin_inscription.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @GetMapping("/auth-status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
                response.put("authenticated", true);
                response.put("username", authentication.getName());
                response.put("authorities", authentication.getAuthorities().toString());
                response.put("principal", authentication.getPrincipal().getClass().getSimpleName());
            } else {
                response.put("authenticated", false);
                response.put("username", null);
                response.put("authorities", null);
                response.put("message", "No valid authentication found");
            }
            
            response.put("timestamp", java.time.LocalDateTime.now());
            response.put("status", "success");
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("error", e.getMessage());
            response.put("authenticated", false);
        }
        
        return ResponseEntity.ok(response);
    }
}