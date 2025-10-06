package com.groupe.gestin_inscription.services.serviceImpl;


import com.groupe.gestin_inscription.dto.request.AcademicHistoryRequestDTO;

import com.groupe.gestin_inscription.dto.request.UserRequestDTO;
import com.groupe.gestin_inscription.dto.response.UserResponseDTO;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.model.*;
import com.groupe.gestin_inscription.model.Enums.Gender;
import com.groupe.gestin_inscription.repository.*;
import com.groupe.gestin_inscription.services.serviceInterfaces.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AcademicHistoryRepository academicHistoryRepository;

    @Override
    @Transactional
    public UserResponseDTO createUser(UserRequestDTO userRequestDTO) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(userRequestDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + userRequestDTO.getUsername());
        }
        if (userRepository.existsByEmail(userRequestDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userRequestDTO.getEmail());
        }

        User user = mapToUserEntity(userRequestDTO);
        AcademicHistory academicHistory = mapToAcademicHistoryEntity(userRequestDTO.getAcademicHistory());

        user.setAcademicHistory(academicHistory);

        // Hash the password before saving
        if (userRequestDTO.getPassword() != null && !userRequestDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userRequestDTO.getPassword()));
        }

        User savedUser = userRepository.save(user);
        return mapToUserResponseDTO(savedUser);
    }

    @Transactional(readOnly = true)
    public Optional<UserResponseDTO> findById(Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            return userOptional.map(this::mapToResponse);
        } else {
            throw new NoSuchElementException("User not found with id: " + id);
        }
    }

    @Transactional(readOnly = true)
    @Override
    public Optional<UserResponseDTO> findByUsername(String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            return userOptional.map(this::mapToResponse);
        } else {
            throw new NoSuchElementException("No User found with Username: " + username);
        }
    }

    @Transactional(readOnly = true)
    @Override
    public Optional<UserResponseDTO> findByEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            return userOptional.map(this::mapToResponse);
        } else {
            throw new NoSuchElementException("No User found with the Email: " + email);
        }
    }

    @Transactional(readOnly = true)
    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public UserResponseDTO updateUser(Long id, UserRequestDTO request) {
        User concernedUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Update fields only if provided in the request
        if (request.getUsername() != null && !request.getUsername().equals(concernedUser.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username already taken: " + request.getUsername());
            }
            concernedUser.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().equals(concernedUser.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use: " + request.getEmail());
            }
            concernedUser.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            concernedUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getFirstName() != null) {
            concernedUser.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            concernedUser.setLastName(request.getLastName());
        }

        User updatedUser = userRepository.save(concernedUser);
        return mapToResponse(updatedUser);
    }

    @Transactional
    @Override
    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public Boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public Boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }



    @Override
    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Find user entity by email (for authentication)
     */
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    // Helper method for mapping
    private UserResponseDTO mapToResponse(User user) {
        UserResponseDTO dto = new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getAdministratorRole()
        );
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }

    /**
     * Helper method to map a UserRequestDTO to a User entity.
     */
    private User mapToUserEntity(UserRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        User user = new User();
        user.setUsername(dto.getUsername()); // Add this line
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        if (dto.getGender() != null) {
            user.setGender(Gender.valueOf(dto.getGender().toUpperCase()));
        }
        if (dto.getDateOfBirth() != null) {
            user.setDateOfBirth(LocalDate.parse(dto.getDateOfBirth()));
        }
        user.setNationality(dto.getNationality());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAddress(dto.getAddress());
        user.setEmergencyContact(dto.getEmergencyContact());
        return user;
    }

    /**
     * Helper method to map a User's academic history from the DTO to an AcademicHistory entity.
     */
    private AcademicHistory mapToAcademicHistoryEntity(AcademicHistoryRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        AcademicHistory academicHistory = new AcademicHistory();
        academicHistory.setLastInstitution(dto.getLastInstitution());
        academicHistory.setSpecialization(dto.getSpecialization());
        academicHistory.setSubSpecialization(dto.getSubSpecialization());
        academicHistory.setEducationLevel(dto.getEducationLevel());
        academicHistory.setGpa(dto.getGpa());
        academicHistory.setHonors(dto.getHonors());
        
        if (dto.getFormationPeriodStart() != null) {
            academicHistory.setStartDate(LocalDate.parse(dto.getFormationPeriodStart()));
        }
        if (dto.getFormationPeriodEnd() != null) {
            academicHistory.setEndDate(LocalDate.parse(dto.getFormationPeriodEnd()));
        }
        return academicHistoryRepository.save(academicHistory);
    }

    /**
     * Helper method to map a User entity to a UserResponseDTO.
     */
    private UserResponseDTO mapToUserResponseDTO(User user) {
        if (user == null) {
            return null;
        }
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        
        // Map additional fields
        dto.setGender(user.getGender());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setNationality(user.getNationality());
        dto.setUserIdNum(user.getUserIdNum());
        dto.setEmergencyContact(user.getEmergencyContact());
        dto.setAdministratorRole(user.getAdministratorRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        
        return dto;
    }

    /**
     * Transform user data to match frontend registration form structure
     */
    public Map<String, Object> transformToFormData(UserResponseDTO user) {
        Map<String, Object> formData = new HashMap<>();
        
        // Personal Info section
        Map<String, Object> personalInfo = new HashMap<>();
        personalInfo.put("lastName", user.getLastName() != null ? user.getLastName() : "");
        
        // Split firstName into array for firstNames field
        List<String> firstNames = new ArrayList<>();
        if (user.getFirstName() != null && !user.getFirstName().trim().isEmpty()) {
            String[] names = user.getFirstName().trim().split("\\s+");
            firstNames.addAll(Arrays.asList(names));
        }
        if (firstNames.isEmpty()) {
            firstNames.add(""); // Ensure at least one empty string
        }
        personalInfo.put("firstNames", firstNames);
        
        personalInfo.put("gender", user.getGender() != null ? user.getGender().toString() : "");
        personalInfo.put("birthDate", user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : "");
        personalInfo.put("nationality", user.getNationality() != null ? user.getNationality() : "");
        personalInfo.put("idType", user.getUserIdNum() != null ? user.getUserIdNum() : "");
        
        // Contact Info section
        Map<String, Object> contactInfo = new HashMap<>();
        contactInfo.put("email", user.getEmail() != null ? user.getEmail() : "");
        contactInfo.put("emailConfirm", user.getEmail() != null ? user.getEmail() : "");
        
        // Parse phone number (assuming format: +countrycode phone)
        String phone = user.getPhoneNumber() != null ? user.getPhoneNumber() : "";
        String countryCode = "";
        String phoneNumber = "";
        if (phone.startsWith("+")) {
            // Extract country code (first 2-3 digits after +)
            int spaceIndex = phone.indexOf(" ");
            if (spaceIndex > 0) {
                countryCode = phone.substring(0, spaceIndex);
                phoneNumber = phone.substring(spaceIndex + 1);
            } else {
                // Assume first 3 characters are country code
                if (phone.length() > 3) {
                    countryCode = phone.substring(0, 3);
                    phoneNumber = phone.substring(3);
                } else {
                    countryCode = phone;
                }
            }
        } else {
            phoneNumber = phone;
        }
        contactInfo.put("countryCode", countryCode);
        contactInfo.put("phone", phoneNumber);
        
        // Parse address (assuming format: street, city, postalCode, country)
        Map<String, String> address = new HashMap<>();
        String userAddress = user.getAddress() != null ? user.getAddress() : "";
        String[] addressParts = userAddress.split(",");
        address.put("street", addressParts.length > 0 ? addressParts[0].trim() : "");
        address.put("city", addressParts.length > 1 ? addressParts[1].trim() : "");
        address.put("postalCode", addressParts.length > 2 ? addressParts[2].trim() : "");
        address.put("country", addressParts.length > 3 ? addressParts[3].trim() : "");
        contactInfo.put("address", address);
        
        // Empty emergency contact (to be filled by user)
        Map<String, String> emergencyContact = new HashMap<>();
        emergencyContact.put("name", "");
        emergencyContact.put("relationship", "");
        emergencyContact.put("phone", "");
        contactInfo.put("emergencyContact", emergencyContact);
        
        contactInfo.put("emailNotifications", true);
        contactInfo.put("smsNotifications", false);
        
        // Academic History section (empty - to be filled by user)
        Map<String, Object> academicHistory = new HashMap<>();
        academicHistory.put("lastInstitution", "");
        academicHistory.put("specialization", "");
        academicHistory.put("subSpecialization", "");
        academicHistory.put("startDate", "");
        academicHistory.put("endDate", "");
        academicHistory.put("educationLevel", "");
        academicHistory.put("gpa", null);
        academicHistory.put("honors", new ArrayList<>());
        
        // Documents section (empty - to be filled by user)
        Map<String, Object> documents = new HashMap<>();
        documents.put("higherDiplomas", new ArrayList<>());
        
        // Assemble final form data
        formData.put("personalInfo", personalInfo);
        formData.put("contactInfo", contactInfo);
        formData.put("academicHistory", academicHistory);
        formData.put("documents", documents);
        formData.put("review", new HashMap<>());
        
        return formData;
    }
}