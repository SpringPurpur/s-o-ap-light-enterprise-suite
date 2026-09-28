package com.meridian.finance_service.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "invoice")
public class Invoice {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(name = "total_cents", nullable = false)
    private long totalCents;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "issued_at")
    private Instant issuedAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceLine> lines = new ArrayList<>();

    protected Invoice() { }

    public Invoice(Long orderId, Long customerId) {
        this.orderId = orderId;
        this.customerId = customerId;
    }

    public void addLine(String productId, int quantity, long unitPriceCents) {
        InvoiceLine line = new InvoiceLine(this, productId, quantity, unitPriceCents);
        lines.add(line);
        totalCents += line.getLineTotalCents();
    }

    public void issue() {
        if (status != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Only a DRAFT invoice can be issued (currently " + status + ")");
        }
        status = InvoiceStatus.ISSUED;
        issuedAt = Instant.now();
    }

    public void markPaid() {
        if (status != InvoiceStatus.ISSUED) {
            throw new IllegalStateException("Only a ISSUED invoice can be paid (currently " + status + ")");
        }
        status = InvoiceStatus.PAID;
        paidAt = Instant.now();
    }

    public void voidInvoice() {
        if (status == InvoiceStatus.PAID) {
            throw new IllegalStateException("A PAID invoice cannot be voided");
        }
        status = InvoiceStatus.VOID;
    }

    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public Long getCustomerId() { return customerId; }
    public InvoiceStatus getStatus() { return status; }
    public long getTotalCents() { return totalCents; }
    public String getCurrency() { return currency; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getIssuedAt() { return issuedAt; }
    public Instant getPaidAt() { return paidAt; }
    public List<InvoiceLine> getLines() { return lines; }
}
