import { Component, inject, OnInit, signal } from "@angular/core";
import { Product, PurchaseRequisition } from "../../core/models/inventory.model";
import { DatePipe } from "@angular/common";
import { InventoryApiService } from "../../core/services/inventory-api.service";
import { forkJoin } from "rxjs";

interface RequisitionRow extends PurchaseRequisition {
    productName: string;
    sku: string;
}

@Component({
    selector: 'app-requisition-queue',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './requisition-queue.component.html',
    styleUrl: './requisition-queue.component.scss'
})
export class RequisitionQueueComponent implements OnInit {
    private inventoryApi = inject(InventoryApiService);

    rows = signal<RequisitionRow[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);
    actingOnId = signal<string | null>(null);

    ngOnInit(): void {
        this.load();
    }

    load() : void {
        this.loading.set(true);
        forkJoin({
            requisitions: this.inventoryApi.getPendingRequisitions(),
            products: this.inventoryApi.getProducts()
        }).subscribe({
            next: ({ requisitions, products }) => {
                const productMap = new Map(products.map((p: Product) => [p.id, p]));
                const rows: RequisitionRow[] = requisitions.map(r => {
                    const product = productMap.get(r.productId);
                    return {
                        ...r,
                        productName: product?.name ?? '(unknown product)',
                        sku: product?.sku ?? r.productId
                    };
                });
                this.rows.set(rows);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Could not load requisitions. Is the inventory service running?');
                this.loading.set(false);
            }
        });
    }

    approve(id: string): void {
        this.actingOnId.set(id);
        this.inventoryApi.approveRequisition(id).subscribe({
            next: () => this.removeRow(id),
            error: () => {
                this.error.set('Could not approve the requisition.');
                this.actingOnId.set(null);
            }
        });
    }

    reject(id: string): void {
        this.actingOnId.set(id);
        this.inventoryApi.rejectRequisition(id).subscribe({
            next: () => this.removeRow(id),
            error: () => {
                this.error.set('Could not reject the requisition.');
                this.actingOnId.set(null);
            }
        });
    }

    private removeRow(id: string): void {
        this.rows.update(rows => rows.filter(r => r.id !== id));
        this.actingOnId.set(null);
    }
}