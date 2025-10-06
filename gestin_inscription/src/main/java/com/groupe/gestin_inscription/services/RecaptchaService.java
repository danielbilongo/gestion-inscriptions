package com.groupe.gestin_inscription.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecaptchaService {

    @Value("${recaptcha.secret-key}")
    private String secretKey;

    @Value("${recaptcha.verify-url}")
    private String verifyUrl;
    
    @Value("${recaptcha.enabled:true}")
    private boolean recaptchaEnabled;

    private final WebClient webClient = WebClient.builder().build();

    /**
     * Vérifie le token reCAPTCHA avec l'API Google
     */
    public boolean verifyRecaptcha(String recaptchaToken, String clientIp) {
        if (recaptchaToken == null || recaptchaToken.isEmpty()) {
            log.warn("reCAPTCHA token is empty");
            return false;
        }

        try {
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("secret", secretKey);
            formData.add("response", recaptchaToken);
            formData.add("remoteip", clientIp);

            Map<String, Object> response = webClient.post()
                    .uri(verifyUrl)
                    .bodyValue(formData)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null) {
                Boolean success = (Boolean) response.get("success");
                Double score = (Double) response.get("score");
                
                log.info("reCAPTCHA verification - Success: {}, Score: {}", success, score);
                
                // Pour reCAPTCHA v3, vérifier le score (0.0 = bot, 1.0 = humain)
                // Pour reCAPTCHA v2, seul 'success' compte
                if (success != null && success) {
                    if (score != null) {
                        // reCAPTCHA v3 - score minimum de 0.5
                        return score >= 0.5;
                    } else {
                        // reCAPTCHA v2 - pas de score
                        return true;
                    }
                }
            }

            log.warn("reCAPTCHA verification failed: {}", response);
            return false;

        } catch (Exception e) {
            log.error("Error verifying reCAPTCHA: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Vérifie si reCAPTCHA est requis basé sur les tentatives échouées
     */
    public boolean isRecaptchaRequired(String username, String ipAddress, 
                                     LoginAuditService loginAuditService) {
        // Si reCAPTCHA est désactivé (mode développement), ne jamais l'exiger
        if (!recaptchaEnabled) {
            log.debug("reCAPTCHA is disabled - skipping verification");
            return false;
        }
        
        // Exiger reCAPTCHA après 2 tentatives échouées en 15 minutes
        boolean userBlocked = loginAuditService.isUserBlocked(username, 2, 15);
        boolean ipBlocked = loginAuditService.isIpBlocked(ipAddress, 5, 15);
        
        return userBlocked || ipBlocked;
    }
}
