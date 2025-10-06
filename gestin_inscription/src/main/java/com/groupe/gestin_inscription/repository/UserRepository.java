package com.groupe.gestin_inscription.repository;



import com.groupe.gestin_inscription.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username); // Useful for registration
    Boolean existsByEmail(String email);     // Useful for registration

}
