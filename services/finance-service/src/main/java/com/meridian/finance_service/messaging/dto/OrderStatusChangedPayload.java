package com.meridian.finance_service.messaging.dto;

public record OrderStatusChangedPayload(long orderId, String previousStatus, String newStatus) {}