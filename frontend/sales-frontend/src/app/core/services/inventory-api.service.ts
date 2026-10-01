import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_CONFIG } from "../config";
import { Observable } from "rxjs";
import { Product, PurchaseRequisition, StockItem } from "../models/inventory.model";

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
    private http = inject(HttpClient);
    private baseUrl = API_CONFIG.inventoryApiUrl;

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.baseUrl}/products`);
    }

    getStock(): Observable<StockItem[]> {
        return this.http.get<StockItem[]>(`${this.baseUrl}/stock`);
    }

    getPendingRequisitions(): Observable<PurchaseRequisition[]> {
        return this.http.get<PurchaseRequisition[]>(`${this.baseUrl}/purchase/requisitions`);
    }

    approveRequisition(id: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/purchase/requisitions/${id}/approve`, {});
    }

    rejectRequisition(id: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/purchase/requisitions/${id}/reject`, {});
    }
}