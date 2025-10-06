package com.groupe.gestin_inscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.groupe.gestin_inscription.model.AcademicHistory;

@Repository
public interface AcademicHistoryRepository extends JpaRepository<AcademicHistory, Long> {

}
