package com.example.TransactionService.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;



@Configuration
public class RabbitConfig {

    public static final String TRANSACTION_QUEUE = "transaction.queue";
    public static final String TRANSACTION_EXCHANGE = "transaction.exchange";
    public static final String TRANSACTION_ROUTING_KEY = "transaction.created";

    public static final String EXCHANGE = "bank.exchange";
    public static final String ROUTING_KEY = "transaction.key";



    @Bean
    public Queue transactionQueue() {
        return new Queue(TRANSACTION_QUEUE, true);
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

//    @Bean
//    public DirectExchange exchange() {
//        return new DirectExchange(TRANSACTION_EXCHANGE);
//    }

    @Bean
    public Binding binding(Queue queue, DirectExchange exchange) {
        return BindingBuilder
                .bind(queue)
                .to(exchange)
                .with(TRANSACTION_ROUTING_KEY);
    }


    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}

