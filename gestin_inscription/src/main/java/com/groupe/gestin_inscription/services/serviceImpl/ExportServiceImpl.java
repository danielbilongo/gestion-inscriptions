package com.groupe.gestin_inscription.services.serviceImpl;

import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import com.groupe.gestin_inscription.repository.ApplicationRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExportServiceImpl {

    @Autowired
    private ApplicationRepository applicationRepository;

    public byte[] exportToExcel(String dateFrom, String dateTo, String[] statuses) throws IOException {
        List<Application> applications = getFilteredApplications(dateFrom, dateTo, statuses);
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Candidatures");
            
            // Style pour l'en-tête
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Créer l'en-tête
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "ID", "Nom", "Prénom", "Email", "Téléphone", 
                "Nationalité", "Statut", "Date de soumission", "Dernière modification"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Remplir les données
            int rowNum = 1;
            for (Application app : applications) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(app.getId());
                row.createCell(1).setCellValue(app.getApplicantName() != null ? app.getApplicantName().getLastName() : "");
                row.createCell(2).setCellValue(app.getApplicantName() != null ? app.getApplicantName().getFirstName() : "");
                row.createCell(3).setCellValue(app.getApplicantName() != null ? app.getApplicantName().getEmail() : "");
                row.createCell(4).setCellValue(app.getApplicantName() != null ? app.getApplicantName().getPhoneNumber() : "");
                row.createCell(5).setCellValue(app.getApplicantName() != null ? app.getApplicantName().getNationality() : "");
                row.createCell(6).setCellValue(app.getStatus().toString());
                row.createCell(7).setCellValue(app.getSubmissionDate() != null ? 
                    app.getSubmissionDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
                row.createCell(8).setCellValue(app.getLastUpdated() != null ? 
                    app.getLastUpdated().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
            }
            
            // Auto-ajuster les colonnes
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    public byte[] exportToCsv(String dateFrom, String dateTo, String[] statuses) {
        List<Application> applications = getFilteredApplications(dateFrom, dateTo, statuses);
        
        StringBuilder csv = new StringBuilder();
        
        // En-tête CSV
        csv.append("ID,Nom,Prénom,Email,Téléphone,Nationalité,Statut,Date de soumission,Dernière modification\n");
        
        // Données
        for (Application app : applications) {
            csv.append(app.getId()).append(",");
            csv.append(escapeCsv(app.getApplicantName() != null ? app.getApplicantName().getLastName() : "")).append(",");
            csv.append(escapeCsv(app.getApplicantName() != null ? app.getApplicantName().getFirstName() : "")).append(",");
            csv.append(escapeCsv(app.getApplicantName() != null ? app.getApplicantName().getEmail() : "")).append(",");
            csv.append(escapeCsv(app.getApplicantName() != null ? app.getApplicantName().getPhoneNumber() : "")).append(",");
            csv.append(escapeCsv(app.getApplicantName() != null ? app.getApplicantName().getNationality() : "")).append(",");
            csv.append(app.getStatus().toString()).append(",");
            csv.append(app.getSubmissionDate() != null ? 
                app.getSubmissionDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "").append(",");
            csv.append(app.getLastUpdated() != null ? 
                app.getLastUpdated().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
            csv.append("\n");
        }
        
        return csv.toString().getBytes();
    }

    private List<Application> getFilteredApplications(String dateFrom, String dateTo, String[] statuses) {
        List<Application> applications = applicationRepository.findAll();
        
        // Filtrer par statuts si spécifiés
        if (statuses != null && statuses.length > 0) {
            List<ApplicationStatus> statusList = Arrays.stream(statuses)
                .map(ApplicationStatus::valueOf)
                .collect(Collectors.toList());
            
            applications = applications.stream()
                .filter(app -> statusList.contains(app.getStatus()))
                .collect(Collectors.toList());
        }
        
        // TODO: Filtrer par dates si nécessaire
        // if (dateFrom != null && dateTo != null) { ... }
        
        return applications;
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}