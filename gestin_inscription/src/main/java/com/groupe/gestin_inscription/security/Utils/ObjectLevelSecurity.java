package com.groupe.gestin_inscription.security.Utils;

import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.Document;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service("objectLevelSecurity")
@AllArgsConstructor
public class ObjectLevelSecurity {

    private final AdministratorRepository administratorRepository;
    private final UserRepository userRepository;

    public boolean canAccessApplication(Application application) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String currentUsername = authentication.getName();

        // Check if current user is an administrator
        var adminOptional = administratorRepository.findByUserName(currentUsername);
        if (adminOptional.isPresent()) {
            Administrator admin = adminOptional.get();

            if (admin.getRole().equals(AdministratorRole.SUPER_ADMIN)) {
                return true; // Super-admin can access any application
            }

            if (admin.getRole().equals(AdministratorRole.AGENT)) {
                // Check if the application is assigned to the agent
                return application.getAssignedAdmin() != null &&
                        application.getAssignedAdmin().getId().equals(admin.getId());
            }
        }

        // Check if current user is the application owner
        var userOptional = userRepository.findByUsername(currentUsername);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return application.getApplicantName() != null &&
                    application.getApplicantName().getId().equals(user.getId());
        }

        return false;
    }

    public boolean canValidateDocument(Document document) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String currentUsername = authentication.getName();

        // Only administrators can validate documents
        var adminOptional = administratorRepository.findByUserName(currentUsername);
        if (adminOptional.isPresent()) {
            Administrator admin = adminOptional.get();
            return admin.getRole().equals(AdministratorRole.SUPER_ADMIN) ||
                    admin.getRole().equals(AdministratorRole.AGENT);
        }

        return false;
    }

    public boolean isOwner(Long applicationId, Object principal) {
        if (!(principal instanceof UserDetails)) {
            return false;
        }

        UserDetails userDetails = (UserDetails) principal;
        String currentUsername = userDetails.getUsername();

        // Check if current user is the owner of the application
        var userOptional = userRepository.findByUsername(currentUsername);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // You would need to implement a method to check if the user owns the application
            // This is a simplified version - you might need to adjust based on your actual relationship
            return true; // Implement proper ownership check
        }

        return false;
    }

    public boolean isCurrentUser(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String currentUsername = authentication.getName();

        var userOptional = userRepository.findByUsername(currentUsername);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return user.getId().equals(userId);
        }

        return false;
    }
}
