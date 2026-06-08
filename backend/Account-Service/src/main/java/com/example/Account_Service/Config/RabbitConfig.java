package com.example.Account_Service.Config;

import org.springframework.amqp.core.*;

import org.springframework.amqp.rabbit.connection.ConnectionFactory;
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
    public static final String QUEUE = "account.queue";
    public static final String ROUTING_KEY = "transaction.key";

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Queue queue() {
        return new Queue(QUEUE, true);
    }
//    @Bean
//    public FanoutExchange exchange() {
//        return new FanoutExchange(EXCHANGE);
//    }
    @Bean
    public Binding binding() {
        return BindingBuilder
                .bind(queue())
                .to(exchange())
                .with(ROUTING_KEY);
    }


    @Bean
    public Queue transactionQueue() {
        return new Queue(TRANSACTION_QUEUE, true);
    }

//    @Bean
//    public DirectExchange exchange() {
//        return new DirectExchange(TRANSACTION_EXCHANGE);
//    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(EventConstants.EXCHANGE); // "events.exchange"
    }

  /*  @Bean
    public Binding binding(Queue queue, DirectExchange exchange) {
        return BindingBuilder
                .bind(queue)
                .to(exchange)
                .with(TRANSACTION_ROUTING_KEY);
    }*/

    // 🔥 VERY IMPORTANT for JSON conversion
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}

