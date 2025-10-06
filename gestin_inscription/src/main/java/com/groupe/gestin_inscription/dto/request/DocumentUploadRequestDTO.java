package com.groupe.gestin_inscription.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;


@AllArgsConstructor
@NoArgsConstructor
@Data
public class DocumentUploadRequestDTO {
    private String name; // e.g., "Baccalauréat", "CNI recto"
    private MultipartFile fileContent;
    private String DocumentType;
    //private byte[] fileContent; // The actual file data
    // Getters and Setters
}