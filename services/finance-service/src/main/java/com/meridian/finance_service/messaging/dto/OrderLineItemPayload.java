package com.meridian.finance_service.messaging.dto;

public record OrderLineItemPayload(String productId, int quantity, long unitPriceCents) {}
