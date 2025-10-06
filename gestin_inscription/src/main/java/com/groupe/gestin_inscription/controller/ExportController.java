package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.services.serviceImpl.ExportServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/export")
@Tag(name = "Export", description = "Endpoints for data export")
public class ExportController {

    @Autowired
    private ExportServiceImpl exportService;

    @Operation(summary = "Export applications to Excel")
    @GetMapping("/excel")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('AGENT')")
    public ResponseEntity<ByteArrayResource> exportToExcel(
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) String[] statuses) {
        
        try {
            byte[] excelData = exportService.exportToExcel(dateFrom, dateTo, statuses);
            ByteArrayResource resource = new ByteArrayResource(excelData);
            
            String filename = "candidatures_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm")) + 
                ".xlsx";
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(excelData.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "Export applications to CSV")
    @GetMapping("/csv")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('AGENT')")
    public ResponseEntity<ByteArrayResource> exportToCsv(
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) String[] statuses) {
        
        try {
            byte[] csvData = exportService.exportToCsv(dateFrom, dateTo, statuses);
            ByteArrayResource resource = new ByteArrayResource(csvData);
            
            String filename = "candidatures_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm")) + 
                ".csv";
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(csvData.length)
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}