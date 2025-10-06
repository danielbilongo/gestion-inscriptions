package com.groupe.gestin_inscription.repository;

import com.groupe.gestin_inscription.model.LoginAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginAuditRepository extends JpaRepository<LoginAudit, Long> {
    
    List<LoginAudit> findByUsernameOrderByLoginTimeDesc(String username);
    
    List<LoginAudit> findBySuccessOrderByLoginTimeDesc(Boolean success);
    
    @Query("SELECT la FROM LoginAudit la WHERE la.loginTime BETWEEN :startDate AND :endDate ORDER BY la.loginTime DESC")
    List<LoginAudit> findByLoginTimeBetween(@Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(la) FROM LoginAudit la WHERE la.username = :username AND la.success = false AND la.loginTime > :since")
    Long countFailedLoginAttempts(@Param("username") String username, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(la) FROM LoginAudit la WHERE la.ipAddress = :ipAddress AND la.success = false AND la.loginTime > :since")
    Long countFailedLoginAttemptsByIp(@Param("ipAddress") String ipAddress, @Param("since") LocalDateTime since);
}
