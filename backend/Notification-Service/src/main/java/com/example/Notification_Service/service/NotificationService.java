package com.example.Notification_Service.service;

import com.example.Notification_Service.config.SseHub;
import com.example.Notification_Service.model.Notification;
import com.example.Notification_Service.model.NotificationEvent;
import com.example.Notification_Service.reposithory.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;
    private final SseHub sseHub;
    private final ObjectMapper objectMapper;

    public Notification saveAndPush(NotificationEvent event) throws Exception {

        Notification notification = Notification.builder()
                .userId(event.getRecipientUserId())
                .type(event.getEventType())
                .title(event.getTitle())
                .message(event.getMessage())
                .dataJson(objectMapper.valueToTree(event.getData())) // 🔥 KEY
                .createdAt(event.getCreatedAt())
                .build();

        Notification saved = repository.save(notification);

        sseHub.send(saved.getUserId(), saved);

        return saved;
    }
}

