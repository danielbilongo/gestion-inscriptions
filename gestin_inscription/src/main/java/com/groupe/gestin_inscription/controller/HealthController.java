package com.groupe.gestin_inscription.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("timestamp", java.time.LocalDateTime.now());
        response.put("message", "Server is running");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/favicon.ico")
    public ResponseEntity<String> getFavicon() {
        return ResponseEntity.ok("");
    }
}