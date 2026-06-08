package com.example.Account_Service.Model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String eventId;           // unique ID for the event
    private String eventType;         // e.g., "acct.created", "tx.success"
    private String recipientUserId;   // the user to notify
    private String title;             // notification title
    private String message;           // notification message
    private Object data;              // optional additional payload
    private Instant createdAt;        // event creation timestamp
}

