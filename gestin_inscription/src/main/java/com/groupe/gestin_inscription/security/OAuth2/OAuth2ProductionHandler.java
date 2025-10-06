package com.groupe.gestin_inscription.security.OAuth2;

import com.groupe.gestin_inscription.model.Administrator;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.model.Enums.AdministratorRole;
import com.groupe.gestin_inscription.repository.AdministratorRepository;
import com.groupe.gestin_inscription.repository.UserRepository;
import com.groupe.gestin_inscription.security.Jwt.JwtUtils;
import com.groupe.gestin_inscription.services.LoginAuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2ProductionHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2ProductionHandler.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AdministratorRepository administratorRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginAuditService loginAuditService;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                       Authentication authentication) throws IOException {
        
        System.out.println("=== OAuth2ProductionHandler.onAuthenticationSuccess CALLED ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Authentication: " + authentication.getClass().getSimpleName());
        
        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            System.out.println("OAuth2User attributes: " + oauth2User.getAttributes());
            
            // Extraire les informations utilisateur
            String email = oauth2User.getAttribute("email");
            String firstName = oauth2User.getAttribute("given_name");
            String lastName = oauth2User.getAttribute("family_name");
            String provider = determineProvider(request);
            
            logger.info("OAuth2 authentication successful for: {} via {}", email, provider);
            
            // Créer ou récupérer l'utilisateur
            Administrator user = createOrUpdateUser(email, firstName, lastName, provider);
            
            // Créer un UserDetails pour le JWT avec le rôle CANDIDATE
            logger.info("🔑 Creating JWT for user: {} with role: {}", user.getEmail(), user.getRole());
            org.springframework.security.core.userdetails.User userDetails = 
                new org.springframework.security.core.userdetails.User(
                    user.getUserName(),
                    "", // Pas de mot de passe pour OAuth2
                    java.util.Collections.singletonList(
                        new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                    )
                );
            
            // Générer le JWT
            org.springframework.security.authentication.UsernamePasswordAuthenticationToken authToken = 
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
                );
            
            String jwt = jwtUtils.generateJwtToken(authToken);
            logger.info("🔑 JWT generated for user: {} with authorities: {}", user.getEmail(), userDetails.getAuthorities());
            
            // Enregistrer la connexion (optionnel)
            try {
                loginAuditService.logSuccessfulLogin(user.getUserName(), provider + "_OAUTH2", request);
            } catch (Exception e) {
                logger.warn("⚠️ Failed to log OAuth2 login audit: {}", e.getMessage());
            }
            
            // Rediriger vers le frontend avec le token et le rôle
            String redirectUrl = frontendUrl + "/oauth2/redirect?token=" + jwt + 
                "&user=" + java.net.URLEncoder.encode(user.getEmail(), "UTF-8") +
                "&name=" + java.net.URLEncoder.encode(user.getFirstName() + " " + user.getLastName(), "UTF-8") +
                "&role=" + user.getRole().name();
            logger.info("🔗 Redirecting to: {} with role: {}", frontendUrl + "/oauth2/redirect", user.getRole());
            response.sendRedirect(redirectUrl);
            
            logger.info("✅ OAuth2 login successful for: {} (ID: {})", user.getEmail(), user.getId());
            
        } catch (Exception e) {
            logger.error("❌ OAuth2 authentication failed", e);
            String errorUrl = frontendUrl + "/auth/login?error=oauth2_failed";
            response.sendRedirect(errorUrl);
        }
    }

    private Administrator createOrUpdateUser(String email, String firstName, String lastName, String provider) {
        try {
            Optional<Administrator> existingUser = administratorRepository.findByEmail(email);
            
            if (existingUser.isPresent()) {
                Administrator user = existingUser.get();
                
                // Mettre à jour le rôle et les noms pour les utilisateurs OAuth2
                logger.info("🔄 Updating OAuth2 user: {} (current role: {})", email, user.getRole());
                user.setRole(AdministratorRole.CANDIDATE);
                
                // Mettre à jour les noms si disponibles, sinon utiliser l'email
                if (firstName != null && !firstName.isEmpty()) {
                    user.setFirstName(firstName);
                } else if (user.getFirstName() == null || user.getFirstName().equals("User")) {
                    user.setFirstName(email);
                }
                
                if (lastName != null && !lastName.isEmpty()) {
                    user.setLastName(lastName);
                } else if (user.getLastName() == null || user.getLastName().equals("OAuth2")) {
                    user.setLastName("");
                }
                
                user = administratorRepository.save(user);
                
                // S'assurer que l'utilisateur existe aussi dans la table User
                createUserRecord(user);
                
                logger.info("✅ Updated OAuth2 user: {} {} with CANDIDATE role", user.getFirstName(), user.getLastName());
                
                return user;
            }
            
            // Créer un nouvel utilisateur avec le rôle CANDIDATE
            Administrator newUser = new Administrator();
            newUser.setEmail(email);
            newUser.setUserName(email);
            // Utiliser l'email si pas de nom disponible
            newUser.setFirstName(firstName != null && !firstName.isEmpty() ? firstName : email);
            newUser.setLastName(lastName != null && !lastName.isEmpty() ? lastName : "");
            newUser.setPassword(""); // Pas de mot de passe pour OAuth2
            newUser.setRole(AdministratorRole.CANDIDATE);
            
            logger.info("🆕 Creating new OAuth2 user: {} {} with role: {}", 
                newUser.getFirstName(), newUser.getLastName(), newUser.getRole());
            
            Administrator savedUser = administratorRepository.save(newUser);
            
            // Créer aussi dans la table User pour éviter les erreurs de soumission
            createUserRecord(savedUser);
            
            logger.info("✅ New OAuth2 user created: {} via {} with role: {}", 
                email, provider, savedUser.getRole());
            return savedUser;
        } catch (Exception e) {
            logger.error("❌ Error creating/updating OAuth2 user: {}", email, e);
            throw new RuntimeException("Failed to create OAuth2 user", e);
        }
    }

    private String determineProvider(HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        if (requestURI.contains("google")) {
            return "GOOGLE";
        } else if (requestURI.contains("microsoft")) {
            return "MICROSOFT";
        }
        return "UNKNOWN";
    }
    
    private void createUserRecord(Administrator admin) {
        try {
            // Vérifier si l'utilisateur existe déjà dans la table User
            Optional<User> existingUser = userRepository.findByEmail(admin.getEmail());
            if (existingUser.isEmpty()) {
                User user = new User();
                user.setEmail(admin.getEmail());
                user.setUsername(admin.getUserName());
                user.setFirstName(admin.getFirstName());
                user.setLastName(admin.getLastName());
                user.setPassword("oauth2_user"); // Required field
                
                userRepository.save(user);
                logger.info("✅ Created User record for OAuth2 user: {}", admin.getEmail());
            }
        } catch (Exception e) {
            logger.warn("⚠️ Failed to create User record for OAuth2 user: {}", admin.getEmail(), e);
        }
    }

}