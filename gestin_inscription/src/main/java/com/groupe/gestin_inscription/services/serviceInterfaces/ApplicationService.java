package com.groupe.gestin_inscription.services.serviceInterfaces;

import com.groupe.gestin_inscription.dto.request.DocumentUploadRequestDTO;
import com.groupe.gestin_inscription.dto.request.RegistrationFormRequestDTO;
import com.groupe.gestin_inscription.model.Application;
import jakarta.mail.MessagingException;

import java.util.List;


public interface ApplicationService {
    public Application createApplication(RegistrationFormRequestDTO registrationFormRequestDTO, List<DocumentUploadRequestDTO> documents) throws MessagingException;
    public void performPreValidation(Application application);
    public void assignForManualReview(Application application);
    public void reviewDossier(Long applicationId, String reviewDecision) throws MessagingException;
}
