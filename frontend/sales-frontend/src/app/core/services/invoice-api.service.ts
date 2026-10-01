import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_CONFIG } from "../config";
import { Observable } from "rxjs";
import { Invoice } from "../models/invoice.model";

@Injectable({ providedIn: 'root' })
export class InvoiceApiService {
    private http = inject(HttpClient);
    private baseUrl = API_CONFIG.financeApiUrl;

    getInvoices(): Observable<Invoice[]> {
        return this.http.get<Invoice[]>(`${this.baseUrl}/invoices`);
    }

    pay(id: number): Observable<Invoice> {
        return this.http.post<Invoice>(`${this.baseUrl}/invoices/${id}/pay`, {});
    }
}