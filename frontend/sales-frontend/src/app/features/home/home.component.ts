import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrderApiService } from '../../core/services/order-api.service';
import { InventoryApiService } from '../../core/services/inventory-api.service';
import { InvoiceApiService } from '../../core/services/invoice-api.service';

interface SummaryCard {
  label: string;
  value: string;
  tone: 'default' | 'warn' | 'good';
  link: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private orderApi = inject(OrderApiService);
  private inventoryApi = inject(InventoryApiService);
  private invoiceApi = inject(InvoiceApiService);

  loading = signal(true);
  error = signal<string | null>(null);
  cards = signal<SummaryCard[]>([]);

  ngOnInit(): void {
    forkJoin({
      orders: this.orderApi.getOrders(),
      stock: this.inventoryApi.getStock(),
      requisitions: this.inventoryApi.getPendingRequisitions(),
      invoices: this.invoiceApi.getInvoices(),
    }).subscribe({
      next: ({ orders, stock, requisitions, invoices }) => {
        const openOrders = orders.filter(o => o.status === 'Created').length;
        const lowStock = stock.filter(s => s.quantityOnHand <= s.reorderThreshold).length;
        const outstandingCents = invoices
          .filter(i => i.status === 'ISSUED')
          .reduce((sum, i) => sum + i.totalCents, 0);

        this.cards.set([
          { label: 'Open orders', value: String(openOrders), tone: 'default', link: '/orders' },
          { label: 'Items below reorder threshold', value: String(lowStock), tone: lowStock > 0 ? 'warn' : 'good', link: '/stock' },
          { label: 'Requisitions awaiting approval', value: String(requisitions.length), tone: requisitions.length > 0 ? 'warn' : 'good', link: '/requisitions' },
          { label: 'Outstanding invoiced amount', value: (outstandingCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' }), tone: 'default', link: '/invoices' },
        ]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load the overview. One or more services may be unreachable.');
        this.loading.set(false);
      },
    });
  }
}