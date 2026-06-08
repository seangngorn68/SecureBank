package com.example.Notification_Service.controller;

import com.example.Notification_Service.config.SseHub;
import com.example.Notification_Service.model.Notification;
import com.example.Notification_Service.model.NotificationDto;
import com.example.Notification_Service.model.NotificationMapper;
import com.example.Notification_Service.reposithory.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page; // ✅ Correct
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationRepository repository;
    private final NotificationMapper mapper;
    private final SseHub sseHub;

    @GetMapping
     public Page<NotificationDto> list(
            @AuthenticationPrincipal Jwt jwt,
            Pageable pageable
    ) {
        log.info("JWT SUBJECT = {}", jwt.getSubject());
        return repository
                .findByUserIdOrderByCreatedAtDesc(jwt.getSubject(), pageable)
                .map(mapper::toDto);
    }

    @PatchMapping("/{id}/read")
    public void markRead(@PathVariable UUID id) {
        repository.findById(id).ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
    }

    @GetMapping("/unread/count")
    public long unreadCount(@AuthenticationPrincipal Jwt jwt) {
        return repository.countByUserIdAndIsReadFalse(jwt.getSubject());
    }

    @GetMapping("/stream")
    public SseEmitter stream(@AuthenticationPrincipal Jwt jwt) {
        return sseHub.connect(jwt.getSubject());
    }
}
