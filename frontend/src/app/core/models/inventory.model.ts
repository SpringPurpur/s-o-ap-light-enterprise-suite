export interface Product {
    id: string;
    sku: string;
    name: string;
    category: string;
    unitOfMeasure: string;
    specs?: Record<string, unknown>;
}

export interface StockItem {
    id: string;
    productId: string;
    warehouseId: string;
    quantityOnHand: number;
    reorderThreshold: number;
}

export type RequisitionStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PurchaseRequisition {
    id: string;
    productId: string;
    quantityRequested: number;
    status: RequisitionStatus;
    createdAt: string;
}