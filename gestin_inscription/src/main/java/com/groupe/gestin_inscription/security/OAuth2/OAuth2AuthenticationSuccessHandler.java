package com.groupe.gestin_inscription.security.OAuth2;

import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.repository.UserRepository;
import com.groupe.gestin_inscription.security.Jwt.JwtUtils;
import com.groupe.gestin_inscription.services.LoginAuditService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

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

        // Créer ou récupérer l'utilisateur
        User user = createOrUpdateUser(email, name, firstName, lastName);

        // Créer une authentification Spring Security pour générer le JWT
        org.springframework.security.core.userdetails.UserDetails userPrincipal = 
            org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail()) // Utiliser l'email pour OAuth2
                .password("") // Pas de mot de passe pour OAuth2
                .authorities("ROLE_CANDIDATE")
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
        loginAuditService.logSuccessfulLogin(user.getEmail(), loginMethod, request);

        // Rediriger vers le frontend avec le token
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/oauth2/redirect")
                .queryParam("token", jwt)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private User createOrUpdateUser(String email, String name, String firstName, String lastName) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        // Créer un nouvel utilisateur OAuth2
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setUsername(email); // Utiliser l'email comme username
        newUser.setFirstName(firstName != null ? firstName : name);
        newUser.setLastName(lastName != null ? lastName : "");
        newUser.setPassword(""); // Pas de mot de passe pour OAuth2
        // Les utilisateurs OAuth2 sont des candidats par défaut

        return userRepository.save(newUser);
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
}
