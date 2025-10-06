package com.groupe.gestin_inscription.services.serviceImpl;


import com.groupe.gestin_inscription.dto.request.administratorRequestDTO;
import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdministratorServiceImpl {

    private final AdministratorRepository administratorRepository;
    private final PasswordEncoder passwordEncoder;

    // Use constructor injection for dependencies
    public AdministratorServiceImpl(AdministratorRepository administratorRepository, PasswordEncoder passwordEncoder) {
        this.administratorRepository = administratorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Administrator completeAdminProfile(String username, administratorRequestDTO profileDTO) {
        // 1. Find the existing, initialized admin record
        Administrator admin = administratorRepository.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found."));

        // 2. Update the fields in the SAME record
        admin.setFirstName(profileDTO.getFirstName());
        admin.setLastName(profileDTO.getLastName());

        // 3. Save the SAME record back to the database
        return administratorRepository.save(admin);
    }


}