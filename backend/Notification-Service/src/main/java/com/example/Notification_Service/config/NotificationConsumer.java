package com.example.Notification_Service.config;

import com.example.Notification_Service.model.NotificationEvent;
import com.example.Notification_Service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(
            queues = RabbitConsumerConfig.NOTIFICATION_QUEUE,
            containerFactory = "rabbitListenerContainerFactory"
    )
    public void consume(NotificationEvent event) {
        try {
            log.info("🔥 RECEIVED EVENT: {}", event);
            notificationService.saveAndPush(event);
        } catch (Exception e) {
            log.error("❌ Failed to process notification", e);
        }
    }

 /*   @RabbitListener(queues = "notification.queue")
    public void consume(NotificationEvent event) throws Exception {
        notificationService.saveAndPush(event);
    }*/
}
