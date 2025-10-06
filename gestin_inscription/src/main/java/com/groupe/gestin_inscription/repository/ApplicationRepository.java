package com.groupe.gestin_inscription.repository;

import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.User;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    // Custom query methods can be added here if needed,
    /**
     * Finds all applications with a specific status.
     *
     * @param status The status of the applications to find.
     * @return A list of applications matching the status.
     */
    List findByStatus(ApplicationStatus status);

    /**
     * Finds all applications assigned to a specific administrator.
     * @param assignedAdminId The ID of the administrator.
     * @return A list of applications assigned to the administrator.
     */
    // Assuming a Many-to-One relationship from Application to Administrator
    //@Query("SELECT a FROM Application a WHERE a.assignedAdmin.id = :assignedAdminId")
    //List<Application> findByAssignedAdminId(@Param("assignedAdminId") Long assignedAdminId);
    List<Application> findByAssignedAdmin_Id(Long assignedAdminId);

    @Query("SELECT a FROM Application a WHERE a.status = 'BLOCKED' AND a.lastUpdated < :blockedDateTime")
    List<Application> findBlockedApplications(@Param("blockedDateTime") LocalDateTime blockedDateTime);
    //List<Application> findBlockedApplications(LocalDateTime cutoff);

    // Corrected method using a custom JPQL query to count applications by their status
    @Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
    Map<String, Integer> countApplicationsByStatus();
    //Map<String, Integer> countApplicationsByStage();

    List<Application> findByCompletionRateGreaterThanEqual(double rate);
    
    /**
     * Finds applications by applicant (User).
     * @param applicant The User who submitted the application.
     * @return A list of applications for the given applicant.
     */
    List<Application> findByApplicantName(User applicant);
    
    /**
     * Checks if an application exists for the given applicant.
     * @param applicant The User to check.
     * @return true if application exists, false otherwise.
     */
    boolean existsByApplicantName(User applicant);
    
    /**
     * Checks if an application exists for the given applicant, target institution and specialization.
     * @param applicant The User to check.
     * @param targetInstitution The target institution.
     * @param specialization The specialization.
     * @return true if application exists for this user, institution and specialization, false otherwise.
     */
    boolean existsByApplicantNameAndTargetInstitutionAndSpecialization(User applicant, String targetInstitution, String specialization);
    
    /**
     * Counts applications by status.
     * @param status The application status.
     * @return Count of applications with the given status.
     */
    long countByStatus(ApplicationStatus status);
}
