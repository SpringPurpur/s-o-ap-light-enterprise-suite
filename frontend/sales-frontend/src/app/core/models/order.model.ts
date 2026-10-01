export interface Customer {
    id: number;
    name: string;
    contactInfo: string | null;
}

export type OrderStatus = 'Created' | 'Fulfilled' | 'Cancelled';

export interface OrderLineItem {
    id: number;
    orderId: number;
    productId: string;
    quantity: number;
    unitPriceCents: number;
}

export interface Order {
    id: number;
    customerId: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
    lineItems?: OrderLineItem[];
}

export interface CreateOrderRequest {
    customerId: number;
    lineItems: { productId: string; quantity: number; unitPriceCents: number }[];
}