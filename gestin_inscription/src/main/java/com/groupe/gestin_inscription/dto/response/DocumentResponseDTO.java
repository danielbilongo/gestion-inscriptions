package com.groupe.gestin_inscription.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class DocumentResponseDTO {
    private Long id;
    private String name;
    private String fileType;
    private String validationStatus;
    private String ocrNotes;
    // Getters and Setters
}
