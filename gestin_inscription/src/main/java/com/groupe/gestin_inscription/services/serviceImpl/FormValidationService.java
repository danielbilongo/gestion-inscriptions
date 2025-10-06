package com.groupe.gestin_inscription.services.serviceImpl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@Slf4j
public class FormValidationService {

    // Patterns de validation
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ\\s'-]{2,50}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[1-9]\\d{1,14}$");
    
    // Nationalités valides (exemple)
    private static final List<String> VALID_NATIONALITIES = List.of(
        "CAMEROUNAISE", "FRANÇAISE", "ALLEMANDE", "ESPAGNOLE", "ITALIENNE",
        "BRITANNIQUE", "AMÉRICAINE", "CANADIENNE", "BELGE", "SUISSE",
        "IVOIRIENNE", "SÉNÉGALAISE", "MALIENNE", "BURKINABÉ", "NIGÉRIANE"
    );

    public ValidationResult validatePersonalInfo(PersonalInfoData personalInfo) {
        List<String> errors = new ArrayList<>();
        
        // Validation du nom
        if (personalInfo.getLastName() == null || personalInfo.getLastName().trim().isEmpty()) {
            errors.add("Le nom est obligatoire");
        } else if (!NAME_PATTERN.matcher(personalInfo.getLastName().trim()).matches()) {
            errors.add("Le nom ne doit contenir que des lettres, espaces, apostrophes et tirets");
        }
        
        // Validation des prénoms
        if (personalInfo.getFirstNames() == null || personalInfo.getFirstNames().length == 0) {
            errors.add("Au moins un prénom est obligatoire");
        } else {
            for (String firstName : personalInfo.getFirstNames()) {
                if (firstName != null && !firstName.trim().isEmpty() && 
                    !NAME_PATTERN.matcher(firstName.trim()).matches()) {
                    errors.add("Les prénoms ne doivent contenir que des lettres, espaces, apostrophes et tirets");
                    break;
                }
            }
        }
        
        // Validation du sexe
        if (personalInfo.getGender() == null || personalInfo.getGender().trim().isEmpty()) {
            errors.add("Le sexe est obligatoire");
        } else if (!List.of("M", "F", "NON_BINARY").contains(personalInfo.getGender().toUpperCase())) {
            errors.add("Sexe invalide");
        }
        
        // Validation de la date de naissance (≥16 ans)
        if (personalInfo.getBirthDate() == null) {
            errors.add("La date de naissance est obligatoire");
        } else {
            LocalDate birthDate = LocalDate.parse(personalInfo.getBirthDate());
            LocalDate now = LocalDate.now();
            int age = Period.between(birthDate, now).getYears();
            
            if (age < 16) {
                errors.add("L'âge minimum requis est de 16 ans");
            } else if (age > 100) {
                errors.add("Date de naissance invalide");
            }
        }
        
        // Validation de la nationalité
        if (personalInfo.getNationality() == null || personalInfo.getNationality().trim().isEmpty()) {
            errors.add("La nationalité est obligatoire");
        } else if (!VALID_NATIONALITIES.contains(personalInfo.getNationality().toUpperCase())) {
            errors.add("Nationalité non reconnue");
        }
        
        // Validation du type de pièce d'identité
        if (personalInfo.getIdType() == null || personalInfo.getIdType().trim().isEmpty()) {
            errors.add("Le type de pièce d'identité est obligatoire");
        } else if (!List.of("CNI", "PASSPORT", "BIRTH_CERTIFICATE").contains(personalInfo.getIdType().toUpperCase())) {
            errors.add("Type de pièce d'identité invalide");
        }
        
        return new ValidationResult(errors.isEmpty(), errors);
    }

    public ValidationResult validateContactInfo(ContactInfoData contactInfo) {
        List<String> errors = new ArrayList<>();
        
        // Validation de l'email
        if (contactInfo.getEmail() == null || contactInfo.getEmail().trim().isEmpty()) {
            errors.add("L'adresse email est obligatoire");
        } else if (!EMAIL_PATTERN.matcher(contactInfo.getEmail().trim()).matches()) {
            errors.add("Format d'email invalide");
        }
        
        // Validation de la confirmation d'email
        if (contactInfo.getEmailConfirm() == null || contactInfo.getEmailConfirm().trim().isEmpty()) {
            errors.add("La confirmation d'email est obligatoire");
        } else if (!contactInfo.getEmail().equals(contactInfo.getEmailConfirm())) {
            errors.add("Les adresses email ne correspondent pas");
        }
        
        // Validation du téléphone
        String fullPhone = (contactInfo.getCountryCode() != null ? contactInfo.getCountryCode() : "") + 
                          (contactInfo.getPhone() != null ? contactInfo.getPhone() : "");
        
        if (fullPhone.trim().isEmpty()) {
            errors.add("Le numéro de téléphone est obligatoire");
        } else if (!PHONE_PATTERN.matcher(fullPhone.replaceAll("\\s", "")).matches()) {
            errors.add("Format de téléphone invalide");
        }
        
        // Validation de l'adresse
        if (contactInfo.getAddress() == null) {
            errors.add("L'adresse est obligatoire");
        } else {
            AddressData address = contactInfo.getAddress();
            if (address.getStreet() == null || address.getStreet().trim().isEmpty()) {
                errors.add("La rue est obligatoire");
            }
            if (address.getCity() == null || address.getCity().trim().isEmpty()) {
                errors.add("La ville est obligatoire");
            }
            if (address.getCountry() == null || address.getCountry().trim().isEmpty()) {
                errors.add("Le pays est obligatoire");
            }
        }
        
        // Validation du contact d'urgence
        if (contactInfo.getEmergencyContact() == null) {
            errors.add("Le contact d'urgence est obligatoire");
        } else {
            EmergencyContactData emergency = contactInfo.getEmergencyContact();
            if (emergency.getName() == null || emergency.getName().trim().isEmpty()) {
                errors.add("Le nom du contact d'urgence est obligatoire");
            }
            if (emergency.getPhone() == null || emergency.getPhone().trim().isEmpty()) {
                errors.add("Le téléphone du contact d'urgence est obligatoire");
            } else if (!PHONE_PATTERN.matcher(emergency.getPhone().replaceAll("\\s", "")).matches()) {
                errors.add("Format de téléphone du contact d'urgence invalide");
            }
            if (emergency.getRelationship() == null || emergency.getRelationship().trim().isEmpty()) {
                errors.add("La relation avec le contact d'urgence est obligatoire");
            }
        }
        
        return new ValidationResult(errors.isEmpty(), errors);
    }

    public ValidationResult validateAcademicHistory(AcademicHistoryData academicHistory) {
        List<String> errors = new ArrayList<>();
        
        // Validation de la dernière institution
        if (academicHistory.getLastInstitution() == null || academicHistory.getLastInstitution().trim().isEmpty()) {
            errors.add("La dernière institution fréquentée est obligatoire");
        }
        
        // Validation de la spécialisation
        if (academicHistory.getSpecialization() == null || academicHistory.getSpecialization().trim().isEmpty()) {
            errors.add("La spécialisation est obligatoire");
        }
        
        // Validation des dates
        if (academicHistory.getStartDate() == null || academicHistory.getStartDate().trim().isEmpty()) {
            errors.add("La date de début de formation est obligatoire");
        }
        
        if (academicHistory.getEndDate() == null || academicHistory.getEndDate().trim().isEmpty()) {
            errors.add("La date de fin de formation est obligatoire");
        }
        
        // Validation de la cohérence des dates
        if (academicHistory.getStartDate() != null && academicHistory.getEndDate() != null &&
            !academicHistory.getStartDate().trim().isEmpty() && !academicHistory.getEndDate().trim().isEmpty()) {
            try {
                LocalDate startDate = LocalDate.parse(academicHistory.getStartDate());
                LocalDate endDate = LocalDate.parse(academicHistory.getEndDate());
                
                if (startDate.isAfter(endDate)) {
                    errors.add("La date de début ne peut pas être postérieure à la date de fin");
                }
                
                if (endDate.isAfter(LocalDate.now())) {
                    errors.add("La date de fin ne peut pas être dans le futur");
                }
                
                // Vérifier les chevauchements (logique simplifiée)
                long durationYears = Period.between(startDate, endDate).getYears();
                if (durationYears > 10) {
                    errors.add("La durée de formation semble excessive (>10 ans)");
                }
                
            } catch (Exception e) {
                errors.add("Format de date invalide");
            }
        }
        
        // Validation du niveau d'éducation
        if (academicHistory.getEducationLevel() == null || academicHistory.getEducationLevel().trim().isEmpty()) {
            errors.add("Le niveau d'éducation est obligatoire");
        }
        
        // Validation de la moyenne (si fournie)
        if (academicHistory.getGpa() != null && (academicHistory.getGpa() < 0 || academicHistory.getGpa() > 20)) {
            errors.add("La moyenne doit être comprise entre 0 et 20");
        }
        
        return new ValidationResult(errors.isEmpty(), errors);
    }

    // Classes de données pour la validation
    public static class ValidationResult {
        private final boolean valid;
        private final List<String> errors;
        
        public ValidationResult(boolean valid, List<String> errors) {
            this.valid = valid;
            this.errors = errors;
        }
        
        public boolean isValid() { return valid; }
        public List<String> getErrors() { return errors; }
    }
    
    public static class PersonalInfoData {
        private String lastName;
        private String[] firstNames;
        private String gender;
        private String birthDate;
        private String nationality;
        private String idType;
        
        // Getters et setters
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String[] getFirstNames() { return firstNames; }
        public void setFirstNames(String[] firstNames) { this.firstNames = firstNames; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getBirthDate() { return birthDate; }
        public void setBirthDate(String birthDate) { this.birthDate = birthDate; }
        public String getNationality() { return nationality; }
        public void setNationality(String nationality) { this.nationality = nationality; }
        public String getIdType() { return idType; }
        public void setIdType(String idType) { this.idType = idType; }
    }
    
    public static class ContactInfoData {
        private String email;
        private String emailConfirm;
        private String countryCode;
        private String phone;
        private AddressData address;
        private EmergencyContactData emergencyContact;
        
        // Getters et setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getEmailConfirm() { return emailConfirm; }
        public void setEmailConfirm(String emailConfirm) { this.emailConfirm = emailConfirm; }
        public String getCountryCode() { return countryCode; }
        public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public AddressData getAddress() { return address; }
        public void setAddress(AddressData address) { this.address = address; }
        public EmergencyContactData getEmergencyContact() { return emergencyContact; }
        public void setEmergencyContact(EmergencyContactData emergencyContact) { this.emergencyContact = emergencyContact; }
    }
    
    public static class AddressData {
        private String street;
        private String city;
        private String postalCode;
        private String country;
        
        // Getters et setters
        public String getStreet() { return street; }
        public void setStreet(String street) { this.street = street; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }
    
    public static class EmergencyContactData {
        private String name;
        private String phone;
        private String relationship;
        
        // Getters et setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
    }
    
    public static class AcademicHistoryData {
        private String lastInstitution;
        private String specialization;
        private String startDate;
        private String endDate;
        private String educationLevel;
        private Double gpa;
        
        // Getters et setters
        public String getLastInstitution() { return lastInstitution; }
        public void setLastInstitution(String lastInstitution) { this.lastInstitution = lastInstitution; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public String getEducationLevel() { return educationLevel; }
        public void setEducationLevel(String educationLevel) { this.educationLevel = educationLevel; }
        public Double getGpa() { return gpa; }
        public void setGpa(Double gpa) { this.gpa = gpa; }
    }
}