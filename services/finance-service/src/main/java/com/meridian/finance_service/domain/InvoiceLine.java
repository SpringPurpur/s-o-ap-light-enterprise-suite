package com.meridian.finance_service.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "invoice_line")
public class InvoiceLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "product_id", nullable = false, length = 64)
    private String productId;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "unit_price_cents", nullable = false)
    private long unitPriceCents;

    @Column(name = "line_total_cents", nullable = false)
    private long lineTotalCents;

    protected InvoiceLine() { }

    InvoiceLine(Invoice invoice, String productId, int quantity, long unitPriceCents) {
        this.invoice = invoice;
        this.productId = productId;
        this.quantity = quantity;
        this.unitPriceCents = unitPriceCents;
        this.lineTotalCents = Math.multiplyExact((long) quantity, unitPriceCents);
    }

    public Long getId() { return id; }
    public String getProductId() { return productId; }
    public int getQuantity() { return quantity; }
    public long getUnitPriceCents() { return unitPriceCents; }
    public long getLineTotalCents() { return lineTotalCents; }
}
