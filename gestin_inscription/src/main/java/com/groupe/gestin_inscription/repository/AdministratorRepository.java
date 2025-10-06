package com.groupe.gestin_inscription.repository;

import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface AdministratorRepository extends JpaRepository<Administrator, Long> {
    // Custom query to find an administrator by their email or name
    Optional<Administrator> findByEmail(String email);
    List<Administrator> findByRole(AdministratorRole administratorRole);

    Optional <Administrator> findByUserName(String userName);

    boolean existsByEmail(String email);

    boolean existsByUserName(String username);
    
    long countByRole(AdministratorRole role);
}
