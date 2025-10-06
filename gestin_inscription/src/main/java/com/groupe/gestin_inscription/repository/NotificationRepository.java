package com.groupe.gestin_inscription.repository;

import com.groupe.gestin_inscription.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Finds all notifications for a specific user.
     * @param userId The ID of the user.
     * @return A list of notifications for the user.
     */
    List<Notification> findByUserId(Long userId);
}
