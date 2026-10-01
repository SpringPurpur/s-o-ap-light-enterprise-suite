import { CurrencyPipe, DatePipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { OrderApiService } from "../../core/services/order-api.service";
import { Order } from "../../core/models/order.model";

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [RouterLink, DatePipe, CurrencyPipe],
    templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
    private orderApi = inject(OrderApiService);

    orders = signal<Order[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);

    ngOnInit(): void {
        this.orderApi.getOrders().subscribe({
            next: (orders) => {
                this.orders.set(orders);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Could not load order. Is the Sales service running?');
                this.loading.set(false);
            }
        });
    }

    statusClass(status: string): string {
        switch (status) {
            case 'Fulfilled': return 'status-fulfilled';
            case 'Cancelled': return 'status-cancelled';
            default: return 'status-created';
        }
    }

    totalFor(order: Order): number {
        if (!order.lineItems) return 0;
        return order.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPriceCents, 0);
    }
}