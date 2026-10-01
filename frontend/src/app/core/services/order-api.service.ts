import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_CONFIG } from "../config";
import { Observable } from "rxjs";
import { CreateOrderRequest, Customer, Order } from "../models/order.model";

@Injectable({ providedIn: 'root' })
export class OrderApiService {
    private http = inject(HttpClient);
    private baseUrl = API_CONFIG.salesApiUrl;

    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.baseUrl}/orders`);
    }

    createOrder(request: CreateOrderRequest): Observable<Order> {
        return this.http.post<Order>(`${this.baseUrl}/orders`, request);
    }

    getCustomers(): Observable<Customer[]> {
        return this.http.get<Customer[]>(`${this.baseUrl}/customers`);
    }
}