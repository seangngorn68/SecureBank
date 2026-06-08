package com.example.Notification_Service.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseHub {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter connect(String userId) {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError(e -> emitters.remove(userId));

        return emitter;
    }

    public void send(String userId, Object data) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(
                        SseEmitter.event()
                                .name("notification")
                                .data(data)
                );
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }
    }
}

