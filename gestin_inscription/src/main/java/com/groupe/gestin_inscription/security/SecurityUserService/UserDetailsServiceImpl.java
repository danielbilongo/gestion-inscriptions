package com.groupe.gestin_inscription.security.SecurityUserService;

import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Component
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AdministratorRepository administratorRepository;
    private final UserRepository userRepository;

    public UserDetailsServiceImpl(AdministratorRepository administratorRepository,
                                  UserRepository userRepository) {
        this.administratorRepository = administratorRepository;
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Looking for user: {}", username);
        
        // First, try to find a normal user by email (primary lookup)
        Optional<User> userByEmailOptional = userRepository.findByEmail(username);
        if (userByEmailOptional.isPresent()) {
            User user = userByEmailOptional.get();
            log.debug("Found user by email: {}", user.getEmail());
            
            // Special case for OAuth2 admin user
            String role = "ngaland@gmail.com".equals(user.getEmail()) ? "ROLE_SUPER_ADMIN" : "ROLE_CANDIDATE";
            
            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail()) // Utiliser l'email comme username
                    .password(user.getPassword())
                    .authorities(List.of(new SimpleGrantedAuthority(role)))
                    .build();
        }
        
        // Fallback: try to find a normal user by username
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            log.debug("Found user by username: {}", user.getUsername());
            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail() != null ? user.getEmail() : user.getUsername()) // Préférer l'email
                    .password(user.getPassword())
                    // a regular user has the CANDIDATE default ROLE
                    .authorities(List.of(new SimpleGrantedAuthority("ROLE_CANDIDATE")))
                    .build();
        }

        
        // Finally, try to find an admin (only if administrator table exists)
        try {
            Optional<Administrator> adminOptional = administratorRepository.findByUserName(username);
            if (adminOptional.isPresent()) {
                Administrator admin = adminOptional.get();
                log.debug("Found admin by username: {}", admin.getUserName());
                return org.springframework.security.core.userdetails.User.builder()
                        .username(admin.getUserName())
                        .password(admin.getPassword())
                        .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + admin.getRole().name())))
                        .build();
            }

            // finding an admin by email if not found by username
            Optional<Administrator> adminByEmailOptional = administratorRepository.findByEmail(username);
            if (adminByEmailOptional.isPresent()) {
                Administrator admin = adminByEmailOptional.get();
                log.debug("Found admin by email: {}", admin.getEmail());
                return org.springframework.security.core.userdetails.User.builder()
                        .username(admin.getEmail()) // Utiliser l'email comme username pour OAuth2
                        .password(admin.getPassword())
                        .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + admin.getRole().name())))
                        .build();
            }
        } catch (Exception e) {
            log.debug("Administrator table not available or error accessing it: {}", e.getMessage());
        }

        // if no user is found
        log.warn("No user found anywhere for: {}", username);
        throw new UsernameNotFoundException("User not found with username: " + username);
    }
}
