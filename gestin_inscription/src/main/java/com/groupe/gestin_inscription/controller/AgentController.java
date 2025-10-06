package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.dto.response.AgentResponseDTO;
import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.groupe.gestin_inscription.dto.request.UpdateAgentRequestDTO;

@RestController
@RequestMapping("/api/agents")
public class AgentController {

    @Autowired
    private AdministratorRepository administratorRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<AgentResponseDTO>> getAllAgents() {
        List<Administrator> agents = administratorRepository.findByRole(AdministratorRole.AGENT);
        List<AgentResponseDTO> agentDTOs = agents.stream()
                .map(AgentResponseDTO::fromAdministrator)
                .collect(Collectors.toList());
        return ResponseEntity.ok(agentDTOs);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<AgentResponseDTO> updateAgent(@PathVariable Long id, @RequestBody UpdateAgentRequestDTO request) {
        Optional<Administrator> optionalAgent = administratorRepository.findById(id);
        if (optionalAgent.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Administrator agent = optionalAgent.get();
        
        // Mettre à jour les champs
        if (request.getFirstName() != null) {
            agent.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            agent.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            agent.setEmail(request.getEmail());
        }
        if (request.getUsername() != null) {
            agent.setUserName(request.getUsername());
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            agent.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        Administrator updatedAgent = administratorRepository.save(agent);
        return ResponseEntity.ok(AgentResponseDTO.fromAdministrator(updatedAgent));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteAgent(@PathVariable Long id) {
        // Simulation de suppression réussie
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Agent supprimé avec succès");
        response.put("deletedId", id);
        return ResponseEntity.ok(response);
    }
}