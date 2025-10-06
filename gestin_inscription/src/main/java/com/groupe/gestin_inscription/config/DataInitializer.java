package com.groupe.gestin_inscription.config;

import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// @Component - Temporarily disabled to prevent startup issues
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Créer l'utilisateur willy@gmail.com s'il n'existe pas
        if (!userRepository.existsByEmail("willy@gmail.com")) {
            User user = new User();
            user.setEmail("willy@gmail.com");
            user.setUsername("willy");
            user.setFirstName("Willy");
            user.setLastName("Test");
            user.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(user);
            System.out.println("Created test CANDIDATE user: willy@gmail.com with username: willy");
        }
    }
}