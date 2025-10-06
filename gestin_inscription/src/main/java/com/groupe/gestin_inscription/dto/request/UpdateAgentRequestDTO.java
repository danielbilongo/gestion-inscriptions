package com.groupe.gestin_inscription.dto.request;

import lombok.Data;

@Data
public class UpdateAgentRequestDTO {
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
}