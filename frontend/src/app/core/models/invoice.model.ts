export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'VOID';

export interface InvoiceLine {
    id: number;
    productId: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
}

export interface Invoice {
    id: number;
    orderId: number;
    customerId: number;
    status: InvoiceStatus;
    totalCents: number;
    currency: string;
    createdAt: string;
    issuedAt: string;
    paidAt: string;
    lines: InvoiceLine[];
}