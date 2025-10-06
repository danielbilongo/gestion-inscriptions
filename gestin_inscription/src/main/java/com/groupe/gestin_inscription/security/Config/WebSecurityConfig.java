package com.groupe.gestin_inscription.security.Config;

import com.groupe.gestin_inscription.security.Jwt.AuthEntryPointJwt;
import com.groupe.gestin_inscription.security.Jwt.AuthTokenFilter;
import com.groupe.gestin_inscription.security.Jwt.JwtUtils;
import com.groupe.gestin_inscription.security.SecurityUserService.UserDetailsServiceImpl;
import com.groupe.gestin_inscription.security.OAuth2.OAuth2AuthenticationSuccessHandler;
import com.groupe.gestin_inscription.security.OAuth2.OAuth2AuthenticationFailureHandler;
import com.groupe.gestin_inscription.security.OAuth2.OAuth2ProductionHandler;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    private final UserDetailsServiceImpl userDetailsServiceImpl;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final JwtUtils jwtUtils;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
    private final OAuth2ProductionHandler oAuth2ProductionHandler;

    public WebSecurityConfig(UserDetailsServiceImpl userDetailsServiceImpl, 
                           AuthEntryPointJwt unauthorizedHandler, 
                           JwtUtils jwtUtils,
                           OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler,
                           OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler,
                           OAuth2ProductionHandler oAuth2ProductionHandler) {
        this.userDetailsServiceImpl = userDetailsServiceImpl;
        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtUtils = jwtUtils;
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
        this.oAuth2AuthenticationFailureHandler = oAuth2AuthenticationFailureHandler;
        this.oAuth2ProductionHandler = oAuth2ProductionHandler;
    }

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter(jwtUtils, userDetailsServiceImpl);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsServiceImpl);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Autoriser les origines de développement locales sur n'importe quel port
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // Autoriser toutes les requêtes de préflight CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Endpoints publics (pas d'authentification requise)
                        .requestMatchers("/api/auth/**", "/api/users", "/api/users/").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // OAuth2 endpoints
                        .requestMatchers("/oauth2/**", "/login/oauth2/**", "/api/oauth2/**").permitAll()
                        .requestMatchers("/login/oauth2/code/**").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()
                        // Dev endpoints
                        .requestMatchers("/api/dev/**").permitAll()
                        .requestMatchers("/api/debug/**").permitAll()
                        .requestMatchers("/api/auth-test/**").permitAll()
                        .requestMatchers("/api/oauth2-test/**").permitAll()
                        .requestMatchers("/api/health/**").permitAll()
                        .requestMatchers("/api/debug/**").permitAll()
                        .requestMatchers("/api/oauth2-users/**").permitAll()
                        .requestMatchers("/api/test-applications/**").permitAll()
                        .requestMatchers("/api/admin-init/**").permitAll()
                        .requestMatchers("/api/test/**").permitAll()
                        .requestMatchers("/api/applications/test").permitAll()
                        .requestMatchers("/api/applications/test-my-applications").permitAll()
                        .requestMatchers("/api/applications/debug-my-applications").permitAll()
                        .requestMatchers("/api/applications/my-applications").permitAll()

                        // Endpoints pour les SUPER_ADMIN
                        .requestMatchers("/api/admin/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/users/all").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/users/{id}").hasAnyRole("AGENT", "SUPER_ADMIN", "CANDIDATE")
                        .requestMatchers("/api/users/username/{username}").hasAnyRole("AGENT", "SUPER_ADMIN", "CANDIDATE")

                        .requestMatchers("/api/applications/review/**").hasRole("AGENT")
                        .requestMatchers("/api/applications/all").hasAnyRole("AGENT", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/applications/*").hasAnyRole("AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/applications/*/documents").hasAnyRole("AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/applications/*/process").hasAnyRole("AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/notifications/my").hasAnyRole("CANDIDATE", "AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/notifications/*/read").hasAnyRole("CANDIDATE", "AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/documents/validate/**").hasRole("AGENT")
                        .requestMatchers("/api/documents/application/**").hasAnyRole("CANDIDATE", "AGENT", "SUPER_ADMIN")

                        // Endpoints pour les applications
                        .requestMatchers("/api/applications/submit").hasAnyRole("CANDIDATE", "AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/applications/submit-simple").permitAll()
                        .requestMatchers("/api/applications/test-submit").permitAll()
                        .requestMatchers("/api/applications/can-submit").permitAll()
                        .requestMatchers("/api/applications/my-applications").permitAll()
                        .requestMatchers("/api/applications/status/**").hasAnyRole("CANDIDATE", "AGENT")
                        
                        // Endpoints pour les utilisateurs
                        .requestMatchers("/api/user/profile").hasAnyRole("CANDIDATE", "AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/oauth2-users/**").hasAnyRole("CANDIDATE", "AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/users/me").hasAnyRole("CANDIDATE", "AGENT")
                        .requestMatchers("/api/users/me/form-data").hasAnyRole("CANDIDATE", "AGENT")
                        .requestMatchers("/api/users/{id}").hasAnyRole("CANDIDATE", "AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/users/username/{username}").hasAnyRole("CANDIDATE", "AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/users/all").hasRole("SUPER_ADMIN")
                        
                        // Endpoints pour les notifications
                        .requestMatchers("/api/notifications/utilisateur/**").hasAnyRole("CANDIDATE", "AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/notifications/*/read").hasAnyRole("CANDIDATE", "AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/notifications/create").hasAnyRole("AGENT", "SUPER_ADMIN")
                        // Endpoints pour les statistiques et dashboard
                        .requestMatchers("/api/statistics/**").hasAnyRole("AGENT", "SUPER_ADMIN")
                        .requestMatchers("/api/dashboard/candidate/**").hasRole("CANDIDATE")
                        .requestMatchers("/api/dashboard/**").hasAnyRole("AGENT", "SUPER_ADMIN")
                        
                        // Endpoints pour les agents
                        .requestMatchers("/api/agents/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/admin/profile/agent").hasRole("SUPER_ADMIN")

                        // Endpoints PUT/DELETE avec contrôle d'objet
                        .requestMatchers("/api/users/{id}").hasRole("CANDIDATE")

                        // Tous les autres endpoints nécessitent une authentification
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        // Configuration OAuth2 - utilise le handler de production
        System.out.println("=== WebSecurityConfig: OAuth2ProductionHandler available: " + (oAuth2ProductionHandler != null));
        System.out.println("=== WebSecurityConfig: Configuring OAuth2 login with production handler");
        http.oauth2Login(oauth2 -> oauth2
                .loginPage("/oauth2/authorization/google")
                .successHandler(oAuth2ProductionHandler)
                .failureHandler(oAuth2AuthenticationFailureHandler)
        );

        return http.build();
    }
}
