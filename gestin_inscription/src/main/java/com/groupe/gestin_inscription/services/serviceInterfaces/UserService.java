package com.groupe.gestin_inscription.services.serviceInterfaces;

import com.groupe.gestin_inscription.dto.request.UserRequestDTO;
import com.groupe.gestin_inscription.dto.response.UserResponseDTO;
import com.groupe.gestin_inscription.model.User;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


public interface UserService {
    public UserResponseDTO createUser(UserRequestDTO userRequestDTO);
    public Optional<UserResponseDTO> findById(Long id);
    public List<UserResponseDTO> getAllUsers();
    public void deleteUserById(Long id);
    public Optional<UserResponseDTO> findByUsername(String username);
    public Optional<UserResponseDTO> findByEmail(String email);
    @Transactional
    public UserResponseDTO updateUser(Long id, UserRequestDTO request);
    
    // Methods needed for authentication
    public Boolean existsByUsername(String username);
    public Boolean existsByEmail(String email);
    public User save(User user);
}