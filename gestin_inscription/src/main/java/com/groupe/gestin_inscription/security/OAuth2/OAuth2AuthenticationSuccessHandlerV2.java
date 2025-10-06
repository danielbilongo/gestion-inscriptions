package com.groupe.gestin_inscription.security.OAuth2;

import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import com.groupe.gestin_inscription.security.Jwt.JwtUtils;
import com.groupe.gestin_inscription.services.LoginAuditService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

/**
 * Version améliorée du OAuth2AuthenticationSuccessHandler
 * Supporte à la fois les candidats (User) et les agents (Administrator)
 */
@Component("oauth2AuthenticationSuccessHandlerV2")
public class OAuth2AuthenticationSuccessHandlerV2 extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginAuditService loginAuditService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        // Extraire les informations utilisateur
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");

        // Déterminer le type d'utilisateur et créer/récupérer
        UserAuthInfo userInfo = createOrUpdateUser(email, name, firstName, lastName, request);

        // Créer une authentification Spring Security pour générer le JWT
        UserDetails userPrincipal = org.springframework.security.core.userdetails.User.builder()
                .username(userInfo.getUsername())
                .password("") // Pas de mot de passe pour OAuth2
                .authorities("ROLE_" + userInfo.getRole())
                .build();

        // Créer une nouvelle authentification avec le UserDetails
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken newAuth = 
            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities());

        // Générer le JWT
        String jwt = jwtUtils.generateJwtToken(newAuth);

        // Déterminer le provider OAuth2 (Google ou Microsoft)
        String loginMethod = determineOAuth2Provider(request);
        
        // Enregistrer la connexion OAuth2 réussie
        loginAuditService.logSuccessfulLogin(userInfo.getUsername(), loginMethod, request);

        // Rediriger vers le frontend avec le token et le type d'utilisateur
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/oauth2/redirect")
                .queryParam("token", jwt)
                .queryParam("userType", userInfo.getUserType())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    /**
     * Crée ou met à jour un utilisateur (candidat ou agent) basé sur l'email
     * Logique : 
     * 1. Cherche d'abord dans Administrator (agents/admins existants)
     * 2. Cherche ensuite dans User (candidats existants)
     * 3. Détermine le type basé sur le domaine email ou paramètre de requête
     */
    private UserAuthInfo createOrUpdateUser(String email, String name, String firstName, String lastName, HttpServletRequest request) {
        // 1. Vérifier si c'est un administrateur existant
        Optional<Administrator> existingAdmin = administratorRepository.findByEmail(email);
        if (existingAdmin.isPresent()) {
            Administrator admin = existingAdmin.get();
            return new UserAuthInfo(admin.getUserName(), admin.getRole().name(), "ADMIN");
        }

        // 2. Vérifier si c'est un candidat existant
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            return new UserAuthInfo(user.getUsername(), "CANDIDATE", "USER");
        }

        // 3. Déterminer le type pour un nouvel utilisateur
        String userType = determineUserType(email, request);

        if ("ADMIN".equals(userType)) {
            // Créer un nouvel administrateur
            Administrator newAdmin = Administrator.builder()
                    .email(email)
                    .userName(email)
                    .firstName(firstName != null ? firstName : name)
                    .lastName(lastName != null ? lastName : "")
                    .password("")
                    .role(AdministratorRole.AGENT)
                    .build();
            
            Administrator savedAdmin = administratorRepository.save(newAdmin);
            return new UserAuthInfo(savedAdmin.getUserName(), savedAdmin.getRole().name(), "ADMIN");
        } else {
            // Créer un nouveau candidat
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(email);
            newUser.setFirstName(firstName != null ? firstName : name);
            newUser.setLastName(lastName != null ? lastName : "");
            newUser.setPassword(""); // OAuth2 - pas de mot de passe
            newUser.setAdministratorRole(AdministratorRole.CANDIDATE); // Rôle candidat
            
            User savedUser = userRepository.save(newUser);
            return new UserAuthInfo(savedUser.getUsername(), "CANDIDATE", "USER");
        }
    }

    /**
     * Détermine le type d'utilisateur basé sur :
     * 1. Paramètre de requête 'userType'
     * 2. Domaine de l'email (ex: @admin.sigec.cm pour admins)
     * 3. Par défaut : CANDIDATE
     */
    private String determineUserType(String email, HttpServletRequest request) {
        // 1. Vérifier le paramètre de requête
        String userTypeParam = request.getParameter("userType");
        if ("admin".equalsIgnoreCase(userTypeParam)) {
            return "ADMIN";
        }

        // 2. Vérifier le domaine email pour les admins
        if (email != null && (
            email.endsWith("@admin.sigec.cm") || 
            email.endsWith("@sigec.cm") ||
            email.endsWith("@agent.sigec.cm")
        )) {
            return "ADMIN";
        }

        // 3. Par défaut : candidat
        return "CANDIDATE";
    }

    private String determineOAuth2Provider(HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        if (requestURI.contains("google")) {
            return "GOOGLE";
        } else if (requestURI.contains("microsoft")) {
            return "MICROSOFT";
        }
        return "OAUTH2";
    }

    /**
     * Classe interne pour encapsuler les informations d'authentification
     */
    private static class UserAuthInfo {
        private final String username;
        private final String role;
        private final String userType;

        public UserAuthInfo(String username, String role, String userType) {
            this.username = username;
            this.role = role;
            this.userType = userType;
        }

        public String getUsername() { return username; }
        public String getRole() { return role; }
        public String getUserType() { return userType; }
    }
}
