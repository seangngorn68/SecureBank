package com.example.Notification_Service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {

    private String recipientUserId; // userId that will receive notification
    private String eventType;       // e.g., "TRANSACTION", "ACCOUNT"
    private String title;           // Notification title
    private String message;         // Notification message
    private Object data; // Optional extra data
    private Instant createdAt;      // Event creation timestamp
}
