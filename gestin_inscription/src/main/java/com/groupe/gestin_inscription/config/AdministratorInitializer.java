package com.groupe.gestin_inscription.config;

import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdministratorInitializer implements CommandLineRunner {

    private final AdministratorRepository administratorRepository; // Changed from UserRepository
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;
    private final String adminPassword;
    private final String adminEmail;


    public AdministratorInitializer(AdministratorRepository administratorRepository,
                                    PasswordEncoder passwordEncoder,
                                    @Value("${app.admin.username:super-admin}") String adminUsername,
                                    @Value("${app.admin.password:adminpass}") String adminPassword,
                                    @Value("${app.admin.email:admin@example.com}") String adminEmail) {
        this.administratorRepository = administratorRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.adminEmail = adminEmail;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if an admin user already exists using the AdministratorRepository
        Optional<Administrator> adminOptional = administratorRepository.findByEmail(adminEmail);

        if (adminOptional.isEmpty()) {
            System.out.println("No default Administrator found. Creating initial admin...");

            Administrator newAdmin = Administrator.builder()
                    .userName(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .role(AdministratorRole.SUPER_ADMIN)
                    .build();

            administratorRepository.save(newAdmin);
            System.out.println("Initial Administrator user created successfully!");
        } else {
            System.out.println("Administrator user already exists. Skipping initial admin creation.");
        }
    }
}
