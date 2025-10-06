package com.groupe.gestin_inscription.services.serviceImpl;

import com.groupe.gestin_inscription.dto.response.ApplicationStatusResponseDto;
import com.groupe.gestin_inscription.dto.response.DashboardAnalyticsDTO;
import com.groupe.gestin_inscription.model.Application;
import com.groupe.gestin_inscription.model.Enums.ApplicationStatus;
import com.groupe.gestin_inscription.repository.ApplicationRepository;
import com.groupe.gestin_inscription.services.serviceInterfaces.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Autowired
    private ApplicationRepository applicationRepository;

    /**
     * Gathers and returns real-time statistics for the dashboard.
     * This method provides an overview of the application process.
     *
     * @return A DashboardAnalyticsDTO containing key statistics.
     */
    @Override
    public DashboardAnalyticsDTO getRealTimeStatistics() {
        DashboardAnalyticsDTO analyticsDTO = new DashboardAnalyticsDTO();

        // 1. Total applications and status counts
        analyticsDTO.setTotalApplications(applicationRepository.count());
        analyticsDTO.setPendingApplications(applicationRepository.findByStatus(ApplicationStatus.PRE_VALIDATION));
        analyticsDTO.setApprovedApplications(applicationRepository.findByStatus(ApplicationStatus.APPROVED));
        analyticsDTO.setRejectedApplications(applicationRepository.findByStatus(ApplicationStatus.REJECTED));

        // 2. Completion rate by stage
        Map<String, Integer> completionRates = applicationRepository.countApplicationsByStatus();
        analyticsDTO.setCompletionRateByStep(completionRates);

        // 3. Heatmap of registrations (simplified example)
        // This would require more complex queries, but for a basic example:
        // analyticsDTO.setRegistrationHeatmapData(applicationRepository.getRegistrationsByLocation());

        return analyticsDTO;
    }

    /**
     * Retrieves alerts for dossiers that have been blocked for more than 48 hours.
     *
     * @return A list of ApplicationResponseDTOs for the blocked dossiers.
     */
    @Override
    public List<ApplicationStatusResponseDto> getAlerts() {
        // Find applications in 'pre-validation' or 'manual review' status
        // that haven't been updated for > 48 hours.
        LocalDateTime cutoff = LocalDateTime.now().minusHours(48);
        List<Application> blockedApplications = applicationRepository.findBlockedApplications(cutoff);

        // Map the entities to DTOs
        return blockedApplications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Helper method to convert an Application entity to a DTO
    private ApplicationStatusResponseDto convertToDto(Application application) {
        ApplicationStatusResponseDto dto = new ApplicationStatusResponseDto();
        dto.setApplicationId(application.getId());
        dto.setStatus(application.getStatus().name());
        dto.setCompletionRate(application.getCompletionRate());
        dto.setSubmissionDate(application.getSubmissionDate());
        dto.setApplicantName(application.getApplicantName().getFirstName() + " " + application.getApplicantName().getLastName());
        return dto;
    }
}
