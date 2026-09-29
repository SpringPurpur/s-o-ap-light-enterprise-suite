package com.meridian.finance_service.messaging.dto;

import java.util.List;

public record OrderCreatedPayload(long orderId, long customerId, List<OrderLineItemPayload> lineItems) {}