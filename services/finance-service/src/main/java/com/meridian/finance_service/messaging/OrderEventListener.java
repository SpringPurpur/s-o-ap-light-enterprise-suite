package com.meridian.finance_service.messaging;

import java.nio.charset.StandardCharsets;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.meridian.finance_service.domain.ProcessedEvent;
import com.meridian.finance_service.messaging.dto.OrderCreatedPayload;
import com.meridian.finance_service.messaging.dto.OrderStatusChangedPayload;
import com.meridian.finance_service.repository.ProcessedEventRepository;
import com.meridian.finance_service.service.InvoiceService;

import jakarta.transaction.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class OrderEventListener {
    private final ObjectMapper objectMapper;
    private final ProcessedEventRepository processedEventRepository;
    private final InvoiceService invoiceService;

    public OrderEventListener(ObjectMapper objectMapper,
                              ProcessedEventRepository processedEventRepository,
                              InvoiceService invoiceService) {
        this.objectMapper = objectMapper;
        this.processedEventRepository = processedEventRepository;
        this.invoiceService = invoiceService;
    }

    @RabbitListener(queues = RabbitMqConfig.QUEUE)
    @Transactional
    public void onMessage(byte[] body) {
        JsonNode envelope = objectMapper.readTree(new String(body, StandardCharsets.UTF_8));
        String eventId = envelope.get("eventId").asString();
        String eventType = envelope.get("eventType").asString();

        if (processedEventRepository.existsById(eventId)) {
            return;
        }

        JsonNode payloadNode = envelope.get("payload");

        switch (eventType) {
            case "OrderCreated" -> {
                var payload = objectMapper.treeToValue(payloadNode, OrderCreatedPayload.class);
                invoiceService.createDraftFromOrder(payload);
            }
            case "OrderStatusChanged" -> {
                var payload = objectMapper.treeToValue(payloadNode, OrderStatusChangedPayload.class);
                switch (payload.newStatus()) {
                    case "Fulfilled" -> invoiceService.issueForOrder(payload.orderId());
                    case "Cancelled" -> invoiceService.voidForOrder(payload.orderId());
                    default -> { }
                }
            }
            default -> { }
        }

        processedEventRepository.save(new ProcessedEvent(eventId, eventType));
    }
}
