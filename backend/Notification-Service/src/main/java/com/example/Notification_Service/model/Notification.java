package com.example.Notification_Service.model;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String type;

    private String title;
    private String message;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode dataJson;   // 🔥 FIX HERE

    @Builder.Default
    private boolean isRead = false;

    private Instant createdAt;


}
