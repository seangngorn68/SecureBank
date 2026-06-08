package com.example.Notification_Service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConsumerConfig {

    // ===== Constants (3 variables) =====
    public static final String EXCHANGE = "events.exchange";
    public static final String TX_ROUTING_KEY = "tx.*";
    public static final String ACCT_ROUTING_KEY = "acct.*";
    public static final String NOTIFICATION_QUEUE = "notification.queue";

    // ===== Exchange =====
    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(EXCHANGE);
    }

    // ===== Queue =====
    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true);
    }

    // ===== Bindings =====
    @Bean
    public Binding txBinding(Queue notificationQueue, TopicExchange eventsExchange) {
        return BindingBuilder
                .bind(notificationQueue)
                .to(eventsExchange)
                .with(TX_ROUTING_KEY);
    }

    @Bean
    public Binding acctBinding(Queue notificationQueue, TopicExchange eventsExchange) {
        return BindingBuilder
                .bind(notificationQueue)
                .to(eventsExchange)
                .with(ACCT_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
