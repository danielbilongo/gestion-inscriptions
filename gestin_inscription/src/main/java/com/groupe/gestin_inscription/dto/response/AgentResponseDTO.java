package com.groupe.gestin_inscription.dto.response;

import com.groupe.gestin_inscription.model.Administrator;
import lombok.Data;

@Data
public class AgentResponseDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String fonction;
    private String firstName;
    private String lastName;
    private String role;

    public static AgentResponseDTO fromAdministrator(Administrator admin) {
        AgentResponseDTO dto = new AgentResponseDTO();
        dto.setId(admin.getId());
        dto.setNom(admin.getLastName());
        dto.setPrenom(admin.getFirstName());
        dto.setFirstName(admin.getFirstName());
        dto.setLastName(admin.getLastName());
        dto.setEmail(admin.getEmail());
        dto.setTelephone(null); // Pas de téléphone dans Administrator
        dto.setFonction("Agent");
        dto.setRole(admin.getRole().toString());
        return dto;
    }
}