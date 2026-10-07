package com.example.eventsphere.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.eventsphere.entity.AdminNotification;

public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    List<AdminNotification> findAllByOrderByCreatedAtDesc();
    long countByIsReadFalse();
}
