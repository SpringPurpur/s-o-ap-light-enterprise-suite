package com.meridian.finance_service.service;

import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.meridian.finance_service.domain.Invoice;
import com.meridian.finance_service.messaging.dto.OrderCreatedPayload;
import com.meridian.finance_service.messaging.dto.OrderLineItemPayload;
import com.meridian.finance_service.repository.InvoiceRepository;

import jakarta.transaction.Transactional;

@Service
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;

    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional
    public Invoice createDraftFromOrder(OrderCreatedPayload payload) {
        if (invoiceRepository.existsByOrderId(payload.orderId())) {
            return invoiceRepository.findByOrderId(payload.orderId()).orElseThrow();
        }
        Invoice invoice = new Invoice(payload.orderId(), payload.customerId());
        for (OrderLineItemPayload item : payload.lineItems()) {
            invoice.addLine(item.productId(), item.quantity(), item.unitPriceCents());
        }
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public void issueForOrder(long orderId) {
        invoiceRepository.findByOrderId(orderId)
            .orElseThrow(() -> new IllegalStateException("No invoice found for order " + orderId))
            .issue();
    }

    @Transactional
    public void voidForOrder(long orderId) {
        invoiceRepository.findByOrderId(orderId)
            .orElseThrow(() -> new IllegalStateException("No invoice found for order " + orderId))
            .voidInvoice();
    }

    @Transactional
    public Invoice pay(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new NoSuchElementException("Invoice " + invoiceId + " not found"));
        invoice.markPaid();
        return invoice;
    }
}
