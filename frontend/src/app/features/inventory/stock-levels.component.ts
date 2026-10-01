import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { StockItem } from "../../core/models/inventory.model";
import { InventoryApiService } from "../../core/services/inventory-api.service";
import { forkJoin } from "rxjs";

interface StockRow extends StockItem {
    productName: string;
    sku: string;
    isLow: boolean;
}

@Component({
    selector: 'app-stock-levels',
    standalone: true,
    templateUrl: './stock-levels.component.html',
    styleUrl: './stock-levels.component.scss'
})
export class StockLevelsComponent implements OnInit {
    private inventoryApi = inject(InventoryApiService);

    rows = signal<StockRow[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);
    lowStockCount = computed(() => this.rows().filter(r => r.isLow).length);

    ngOnInit(): void {
        forkJoin({
            products: this.inventoryApi.getProducts(),
            stock: this.inventoryApi.getStock()
        }).subscribe({
            next: ({ products, stock }) => {
                const productMap = new Map(products.map(p => [p.id, p]));
                const rows: StockRow[] = stock.map(s => {
                    const product = productMap.get(s.productId);
                    return {
                        ...s,
                        productName: product?.name ?? '(unknown product',
                        sku: product?.sku ?? s.productId,
                        isLow: s.quantityOnHand <= s.reorderThreshold
                    };
                });
                this.rows.set(rows);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Could not load stock data. Is the inventory service running?');
                this.loading.set(false);
            }
        });
    }
}