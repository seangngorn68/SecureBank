package com.example.Notification_Service.model;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class NotificationDto {
    private UUID id;
    private String type;
    private String title;
    private String message;
    private Object dataJson;
    private boolean isRead;
    private Instant createdAt;
}

