package com.groupe.gestin_inscription.services;

import com.groupe.gestin_inscription.model.LoginAudit;
import com.groupe.gestin_inscription.repository.LoginAuditRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginAuditService {
    
    private final LoginAuditRepository loginAuditRepository;
    
    /**
     * Enregistre une tentative de connexion réussie
     */
    public void logSuccessfulLogin(String username, String loginMethod, HttpServletRequest request) {
        LoginAudit audit = LoginAudit.builder()
                .username(username)
                .ipAddress(getClientIpAddress(request))
                .userAgent(request.getHeader("User-Agent"))
                .loginMethod(loginMethod)
                .success(true)
                .sessionId(UUID.randomUUID().toString())
                .build();
        
        loginAuditRepository.save(audit);
        log.info("Successful login recorded for user: {} from IP: {} using method: {}", 
                username, audit.getIpAddress(), loginMethod);
    }
    
    /**
     * Enregistre une tentative de connexion échouée
     */
    public void logFailedLogin(String username, String loginMethod, String failureReason, HttpServletRequest request) {
        LoginAudit audit = LoginAudit.builder()
                .username(username)
                .ipAddress(getClientIpAddress(request))
                .userAgent(request.getHeader("User-Agent"))
                .loginMethod(loginMethod)
                .success(false)
                .failureReason(failureReason)
                .build();
        
        loginAuditRepository.save(audit);
        log.warn("Failed login attempt recorded for user: {} from IP: {} using method: {} - Reason: {}", 
                username, audit.getIpAddress(), loginMethod, failureReason);
    }
    
    /**
     * Vérifie si un utilisateur a trop de tentatives échouées récentes
     */
    public boolean isUserBlocked(String username, int maxAttempts, int timeWindowMinutes) {
        LocalDateTime since = LocalDateTime.now().minusMinutes(timeWindowMinutes);
        Long failedAttempts = loginAuditRepository.countFailedLoginAttempts(username, since);
        return failedAttempts >= maxAttempts;
    }
    
    /**
     * Vérifie si une IP a trop de tentatives échouées récentes
     */
    public boolean isIpBlocked(String ipAddress, int maxAttempts, int timeWindowMinutes) {
        LocalDateTime since = LocalDateTime.now().minusMinutes(timeWindowMinutes);
        Long failedAttempts = loginAuditRepository.countFailedLoginAttemptsByIp(ipAddress, since);
        return failedAttempts >= maxAttempts;
    }
    
    /**
     * Récupère l'historique des connexions d'un utilisateur
     */
    public List<LoginAudit> getUserLoginHistory(String username) {
        return loginAuditRepository.findByUsernameOrderByLoginTimeDesc(username);
    }
    
    /**
     * Récupère toutes les tentatives échouées
     */
    public List<LoginAudit> getFailedLoginAttempts() {
        return loginAuditRepository.findBySuccessOrderByLoginTimeDesc(false);
    }
    
    /**
     * Récupère les connexions dans une période donnée
     */
    public List<LoginAudit> getLoginsBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return loginAuditRepository.findByLoginTimeBetween(startDate, endDate);
    }
    
    /**
     * Extrait l'adresse IP réelle du client
     */
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
}
