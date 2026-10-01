import { CurrencyPipe, DatePipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { InvoiceApiService } from "../../core/services/invoice-api.service";
import { Invoice } from "../../core/models/invoice.model";

@Component({
    selector: 'app-invoice-list',
    standalone: true,
    imports: [DatePipe, CurrencyPipe],
    templateUrl: './invoice-list.component.html'
})
export class InvoiceListComponent implements OnInit {
    private invoiceApi = inject(InvoiceApiService);

    invoices = signal<Invoice[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);
    payingId = signal<number | null>(null);

    ngOnInit(): void {
        this.load();
    }

    load() : void {
        this.loading.set(true);
        this.invoiceApi.getInvoices().subscribe({
            next: (invoices) => {
                this.invoices.set(invoices);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Could not load invoices. Is the finance service running?');
                this.loading.set(false);
            }
        });
    }

    pay(id: number): void {
        this.payingId.set(id);
        this.invoiceApi.pay(id).subscribe({
            next: (updated) => {
                this.invoices.update(invoices => invoices.map(inv => (inv.id === id ? updated : inv)));
                this.payingId.set(null);
            },
            error: () => {
                this.error.set('Could not mark that invoice as paid. It may not be issued yet.');
                this.payingId.set(null);
            }
        });
    }

    statusClass(status: string): string {
        switch (status) {
            case 'PAID': return 'status-fulfilled';
            case 'VOID': return 'status-cancelled';
            case 'ISSUED': return 'status-issued';
            default: return 'status-created';
        }
    }
}