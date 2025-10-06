package com.groupe.gestin_inscription.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugSubmissionController {

    @PostMapping("/capture-submission")
    public ResponseEntity<Map<String, Object>> captureSubmission(
            HttpServletRequest request,
            @RequestParam(value = "applicationData", required = false) String applicationDataJson,
            @RequestParam(value = "documentNames", required = false) List<String> documentNames,
            @RequestParam(value = "documentTypes", required = false) List<String> documentTypes,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        
        Map<String, Object> debug = new HashMap<>();
        
        try {
            // Capture request details
            debug.put("contentType", request.getContentType());
            debug.put("method", request.getMethod());
            debug.put("headers", getHeaders(request));
            
            // Capture form parameters
            debug.put("applicationData", applicationDataJson);
            debug.put("documentNames", documentNames);
            debug.put("documentTypes", documentTypes);
            debug.put("filesCount", files != null ? files.size() : 0);
            
            // Try to read JSON body if content-type is JSON
            if (request.getContentType() != null && request.getContentType().contains("application/json")) {
                StringBuilder jsonBody = new StringBuilder();
                try (BufferedReader reader = request.getReader()) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        jsonBody.append(line);
                    }
                    debug.put("jsonBody", jsonBody.toString());
                } catch (Exception e) {
                    debug.put("jsonBodyError", e.getMessage());
                }
            }
            
            debug.put("success", true);
            
        } catch (Exception e) {
            debug.put("error", e.getMessage());
            debug.put("success", false);
        }
        
        return ResponseEntity.ok(debug);
    }
    
    private Map<String, String> getHeaders(HttpServletRequest request) {
        Map<String, String> headers = new HashMap<>();
        request.getHeaderNames().asIterator().forEachRemaining(name -> 
            headers.put(name, request.getHeader(name))
        );
        return headers;
    }
}