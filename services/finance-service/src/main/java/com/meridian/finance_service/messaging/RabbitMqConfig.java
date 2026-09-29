package com.meridian.finance_service.messaging;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {
    public static final String EXCHANGE = "enterprise.events";
    public static final String QUEUE = "finance.order-events";

    @Bean
    public TopicExchange enterpriseEventsExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue orderEventsQueue() {
        return new Queue(QUEUE, true);
    }

    @Bean
    public Binding orderCreatedBinding(Queue orderEventsQueue, TopicExchange enterpriseEventsExchange) {
        return BindingBuilder.bind(orderEventsQueue).to(enterpriseEventsExchange).with("order.created");
    }

    @Bean
    public Binding orderStatusChangedBinding(Queue orderEventsQueue, TopicExchange enterpriseEventsExchange) {
        return BindingBuilder.bind(orderEventsQueue).to(enterpriseEventsExchange).with("order.status-changed");
    }
}
