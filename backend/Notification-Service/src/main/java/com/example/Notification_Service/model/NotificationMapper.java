package com.example.Notification_Service.model;

import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .dataJson(n.getDataJson())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
