package com.groupe.gestin_inscription.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/oauth2-test", "/api/oauth2"})
public class OAuth2TestController {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getOAuth2Config() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("googleClientId", googleClientId);
        response.put("frontendUrl", frontendUrl);
        response.put("googleAuthUrl", "/oauth2/authorization/google");
        response.put("redirectUri", "http://localhost:8086/login/oauth2/code/google");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/login-url")
    public ResponseEntity<Map<String, String>> getGoogleLoginUrl() {
        Map<String, String> response = new HashMap<>();
        response.put("loginUrl", "http://localhost:8086/oauth2/authorization/google");
        response.put("message", "Visit this URL to start OAuth2 authentication");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/test/google")
    public ResponseEntity<Map<String, String>> testGoogleOAuth() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "OAuth2 test endpoint working");
        response.put("googleAuthUrl", "http://localhost:8086/oauth2/authorization/google");
        return ResponseEntity.ok(response);
    }
}