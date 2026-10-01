import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_CONFIG } from "../config";
import { Observable } from "rxjs";
import { Product, StockItem } from "../models/inventory.model";

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
}