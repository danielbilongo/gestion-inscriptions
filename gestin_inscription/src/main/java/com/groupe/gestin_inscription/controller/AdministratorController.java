package com.groupe.gestin_inscription.controller;


import com.groupe.gestin_inscription.dto.request.administratorRequestDTO;
import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.security.Utils.ObjectLevelSecurity;
import com.groupe.gestin_inscription.services.serviceImpl.AdministratorServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/profile")
@Tag(name = "Admin Profile")

public class AdministratorController {

    @Autowired
    private AdministratorServiceImpl administratorService;
    private ObjectLevelSecurity objectLevelSecurity;

    @Operation(summary = "Completes the profile for the currently authenticated administrator.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden: Not authorized")
    })
    @PutMapping("/complete")
    // Ensure only an authenticated ADMIN can hit this endpoint
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Administrator> completeProfile(@RequestBody administratorRequestDTO profileDTO) {

        // Get the ID of the currently authenticated user from the Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentAdminUsername = authentication.getName(); // assuming username is stored

        Administrator updatedAdmin = administratorService.completeAdminProfile(currentAdminUsername, profileDTO);

        return ResponseEntity.ok(updatedAdmin);
    }


}
