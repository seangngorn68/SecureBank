package com.example.Notification_Service.reposithory;

import com.example.Notification_Service.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(
            String userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(String userId);
}

