package com.groupe.gestin_inscription.security.Jwt;

import com.groupe.gestin_inscription.security.SecurityUserService.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

public class AuthTokenFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    // publics endpoints
    private static final String[] PUBLIC_URLS = {
            "/api/auth/",
            "/api/users/",  // for POST request only (accounts creation)
            "/v3/api-docs",
            "/swagger-ui"
    };

    public AuthTokenFilter(JwtUtils jwtUtils, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        logger.debug("=== AUTH FILTER DEBUG ===");
        logger.debug("Request URI: {}", requestURI);
        logger.debug("HTTP Method: {}", method);

        // Vérifier si l'endpoint est public
        boolean isPublicEndpoint = isPublicEndpoint(requestURI, method);
        logger.debug("Is public endpoint: {}", isPublicEndpoint);

        try {
            String jwt = parseJwt(request);
            if (jwt != null) {
                try {
                    boolean isValidToken = jwtUtils.validateJwtToken(jwt);
                    logger.info("JWT validation result for {}: {}", requestURI, isValidToken);

                    if (isValidToken) {
                        String username = jwtUtils.getUserNameFromJwtToken(jwt);
                        logger.info("Authenticating user: {}", username);

                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        logger.info("User loaded: {} with authorities: {}", userDetails.getUsername(), userDetails.getAuthorities());
                        
                        // Log détaillé des autorités
                        userDetails.getAuthorities().forEach(auth -> 
                            logger.info("Authority: '{}'", auth.getAuthority())
                        );

                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.info("✅ Authentication successful for: {}", username);

                    } else {
                        logger.warn("❌ Invalid JWT token for request: {}", requestURI);
                        SecurityContextHolder.clearContext();
                    }
                } catch (Exception e) {
                    logger.error("❌ JWT processing failed for {}: {}", requestURI, e.getMessage());
                    SecurityContextHolder.clearContext();
                }
            } else if (!isPublicEndpoint) {
                logger.warn("❌ No JWT token for protected endpoint: {}", requestURI);
                SecurityContextHolder.clearContext();
            }

        } catch (Exception e) {
            logger.error("❌ Authentication filter error for {}: {}", requestURI, e.getMessage());
            SecurityContextHolder.clearContext();
        }

        // Log final authentication state
        var currentAuth = SecurityContextHolder.getContext().getAuthentication();
        if (currentAuth != null && currentAuth.isAuthenticated()) {
            logger.info("✅ Final auth state: {} with roles: {}", currentAuth.getName(), currentAuth.getAuthorities());
        } else {
            logger.debug("❌ No valid authentication for: {}", requestURI);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", headerAuth != null ? "Bearer ***" : "null");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            String token = headerAuth.substring(7);
            logger.debug("Extracted JWT token (first 20 chars): {}",
                    token.length() > 20 ? token.substring(0, 20) + "..." : token);
            return token;
        }
        return null;
    }

    private boolean isPublicEndpoint(String requestURI, String method) {
        // Vérification spéciale pour POST /api/users/ (création de compte)
        if ("POST".equals(method) && "/api/users/".equals(requestURI)) {
            return true;
        }

        // Autres endpoints publics
        return Arrays.stream(PUBLIC_URLS)
                .anyMatch(publicUrl -> requestURI.startsWith(publicUrl));
    }
}
