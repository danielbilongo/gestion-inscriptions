package com.groupe.gestin_inscription.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_audit")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginAudit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String username;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @Column(name = "login_method")
    private String loginMethod; // LOCAL, GOOGLE, MICROSOFT
    
    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime;
    
    @Column(name = "success")
    private Boolean success;
    
    @Column(name = "failure_reason")
    private String failureReason;
    
    @Column(name = "session_id")
    private String sessionId;
    
    @PrePersist
    protected void onCreate() {
        loginTime = LocalDateTime.now();
    }
}
