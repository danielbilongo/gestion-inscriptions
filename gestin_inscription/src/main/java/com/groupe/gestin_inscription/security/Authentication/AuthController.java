package com.groupe.gestin_inscription.security.Authentication;

import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.security.Jwt.JwtUtils;
import com.groupe.gestin_inscription.services.LoginAuditService;
import com.groupe.gestin_inscription.services.RecaptchaService;
import com.groupe.gestin_inscription.services.serviceImpl.UserServiceImpl;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200") // Allow CORS for your Angular app
@RestController
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private LoginAuditService loginAuditService;

    @Autowired
    private RecaptchaService recaptchaService;

    @Autowired
    private UserServiceImpl userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Operation(summary = "User login")
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);
        
        // Vérifier si reCAPTCHA est requis
        boolean recaptchaRequired = recaptchaService.isRecaptchaRequired(
            loginRequest.getUsername(), clientIp, loginAuditService);
        
        if (recaptchaRequired && (loginRequest.getRecaptchaToken() == null || 
            !recaptchaService.verifyRecaptcha(loginRequest.getRecaptchaToken(), clientIp))) {
            
            loginAuditService.logFailedLogin(loginRequest.getUsername(), "LOCAL", 
                "reCAPTCHA verification failed", request);
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", "reCAPTCHA verification required");
            error.put("recaptchaRequired", true);
            return ResponseEntity.badRequest().body(error);
        }
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            // Enregistrer la connexion réussie
            loginAuditService.logSuccessfulLogin(userDetails.getUsername(), "LOCAL", request);

            // Récupérer les vraies informations utilisateur depuis la base de données
            User user = userService.findUserByEmail(userDetails.getUsername());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("type", "Bearer");
            response.put("username", userDetails.getUsername());
            response.put("roles", roles);
            response.put("id", user != null ? user.getId() : 1);
            response.put("nom", user != null ? user.getLastName() : "User");
            response.put("prenom", user != null ? user.getFirstName() : "User");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Enregistrer la tentative de connexion échouée
            loginAuditService.logFailedLogin(loginRequest.getUsername(), "LOCAL", e.getMessage(), request);
            
            // Vérifier si l'utilisateur existe dans User ou Administrator
            boolean userExists = userService.existsByEmail(loginRequest.getUsername()) || 
                               userService.existsByUsername(loginRequest.getUsername()) ||
                               administratorRepository.findByEmail(loginRequest.getUsername()).isPresent();
            
            Map<String, String> error = new HashMap<>();
            if (!userExists) {
                error.put("error", "Aucun compte trouvé avec cet email. Vérifiez votre adresse email ou créez un compte.");
            } else {
                // Vérifier si c'est un utilisateur OAuth2
                if (administratorRepository.findByEmail(loginRequest.getUsername()).isPresent()) {
                    Administrator admin = administratorRepository.findByEmail(loginRequest.getUsername()).get();
                    if (admin.getPassword() == null || admin.getPassword().isEmpty()) {
                        error.put("error", "Ce compte utilise l'authentification Google. Veuillez vous connecter avec Google.");
                    } else {
                        error.put("error", "Mot de passe incorrect. Vérifiez votre mot de passe et réessayez.");
                    }
                } else {
                    error.put("error", "Mot de passe incorrect. Vérifiez votre mot de passe et réessayez.");
                }
            }
            
            return ResponseEntity.status(401).body(error);
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    @Operation(summary = "User registration for candidates")
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        try {
            // Vérifier si l'utilisateur existe déjà
            if (userService.existsByUsername(registerRequest.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Un compte avec cet email existe déjà.");
                return ResponseEntity.badRequest().body(error);
            }

            // Créer un nouvel utilisateur candidat
            User newUser = new User();
            newUser.setUsername(registerRequest.getEmail());
            newUser.setEmail(registerRequest.getEmail());
            newUser.setLastName(registerRequest.getNom());
            newUser.setFirstName(registerRequest.getPrenom());
            newUser.setPhoneNumber(registerRequest.getTelephone());
            
            // Encoder le mot de passe
            newUser.setPassword(passwordEncoder.encode(registerRequest.getMotDePasse()));
            
            // Note: Les utilisateurs normaux n'ont pas de rôle administrateur
            // Ils sont identifiés comme candidats par défaut
            
            // Sauvegarder l'utilisateur
            User savedUser = userService.save(newUser);
            
            // Connecter automatiquement l'utilisateur après inscription
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    registerRequest.getEmail(),
                    registerRequest.getMotDePasse()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            // Enregistrer la connexion automatique
            loginAuditService.logSuccessfulLogin(savedUser.getUsername(), "AUTO_LOGIN_AFTER_REGISTER", request);
            
            // Préparer la réponse avec token
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Inscription réussie ! Connexion automatique...");
            response.put("token", jwt);
            response.put("type", "Bearer");
            response.put("userId", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("email", savedUser.getEmail());
            response.put("nom", savedUser.getLastName());
            response.put("prenom", savedUser.getFirstName());
            response.put("roles", List.of("ROLE_CANDIDATE"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors de l'inscription: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // DTO classes
    public static class RegisterRequest {
        @NotBlank(message = "Le nom est obligatoire")
        @Size(min = 2, max = 50, message = "Le nom doit contenir entre 2 et 50 caractères")
        private String nom;
        
        @NotBlank(message = "Le prénom est obligatoire")
        @Size(min = 2, max = 50, message = "Le prénom doit contenir entre 2 et 50 caractères")
        private String prenom;
        
        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        private String email;
        
        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", message = "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre")
        private String motDePasse;
        
        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Format de téléphone invalide")
        private String telephone;

        // Getters and setters
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getMotDePasse() { return motDePasse; }
        public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
        
        public String getTelephone() { return telephone; }
        public void setTelephone(String telephone) { this.telephone = telephone; }
    }

    public static class LoginRequest {
        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        private String username;
        
        @NotBlank(message = "Le mot de passe est obligatoire")
        private String password;
        
        private String recaptchaToken;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getRecaptchaToken() {
            return recaptchaToken;
        }

        public void setRecaptchaToken(String recaptchaToken) {
            this.recaptchaToken = recaptchaToken;
        }
    }
}