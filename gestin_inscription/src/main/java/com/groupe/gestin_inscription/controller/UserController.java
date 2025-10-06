package com.groupe.gestin_inscription.controller;

import com.groupe.gestin_inscription.dto.request.UserRequestDTO;
import com.groupe.gestin_inscription.dto.response.UserResponseDTO;
import com.groupe.gestin_inscription.services.serviceImpl.UserServiceImpl;
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
import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Endpoints for managing user accounts and profiles")
public class UserController {

    @Autowired
    private UserServiceImpl userService;

    @Operation(summary = "Create a new user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping(value = {"", "/"})
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody UserRequestDTO userRequestDTO) {
        UserResponseDTO createdUser = userService.createUser(userRequestDTO);
        return ResponseEntity.status(201).body(createdUser);
    }

    @Operation(summary = "Get a user by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('AGENT') or hasRole('SUPER_ADMIN') or (hasRole('CANDIDATE') and @userController.isCurrentUser(#id))")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get a user by username")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('AGENT') or hasRole('SUPER_ADMIN') or (hasRole('CANDIDATE') and @userController.isCurrentUsername(#username))")
    public ResponseEntity<UserResponseDTO> getUserByUsername(@PathVariable String username) {
        return userService.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get current user profile")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User profile retrieved"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'AGENT')")
    public ResponseEntity<UserResponseDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return userService.findByUsername(currentUsername)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get current user profile for form pre-filling")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User profile data for form pre-filling retrieved"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/me/form-data")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'AGENT')")
    public ResponseEntity<?> getCurrentUserFormData() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return userService.findByUsername(currentUsername)
                .map(user -> {
                    // Transform user data to match frontend form structure
                    return ResponseEntity.ok(userService.transformToFormData(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Update a user by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE') and @userController.isCurrentUser(#id)")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @RequestBody UserRequestDTO request) {
        UserResponseDTO updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Update current user profile")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'AGENT')")
    public ResponseEntity<UserResponseDTO> updateCurrentUser(@RequestBody UserRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        // Find user by username to get the ID
        UserResponseDTO currentUser = userService.findByUsername(currentUsername)
                .orElse(null);
        
        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }

        UserResponseDTO updatedUser = userService.updateUser(currentUser.getId(), request);
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Delete a user by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get a list of all users")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of users retrieved",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Helper methods for security checks
    public boolean isCurrentUser(Long userId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null) {
                return false;
            }
            
            String currentUsername = authentication.getName();
            if (currentUsername == null) {
                return false;
            }

            UserResponseDTO user = userService.findById(userId).orElse(null);
            return user != null && currentUsername.equals(user.getUsername());
        } catch (Exception e) {
            // Log l'erreur pour le débogage
            System.err.println("Erreur lors de la vérification de l'utilisateur: " + e.getMessage());
            return false;
        }
    }

    public boolean isCurrentUsername(String username) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null) {
                return false;
            }
            
            String currentUsername = authentication.getName();
            return currentUsername != null && currentUsername.equals(username);
        } catch (Exception e) {
            System.err.println("Erreur lors de la vérification du nom d'utilisateur: " + e.getMessage());
            return false;
        }
    }
}
