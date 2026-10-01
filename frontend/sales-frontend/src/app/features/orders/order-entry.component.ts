import { Component, inject, OnInit, signal } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { OrderApiService } from "../../core/services/order-api.service";
import { Router } from "@angular/router";
import { Customer } from "../../core/models/order.model";
import { CurrencyPipe, DatePipe } from "@angular/common";

@Component({
    selector: 'app-order-entry',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './order-entry.component.html'
})
export class OrderEntryComponent implements OnInit {
    private fb = inject(FormBuilder);
    private orderApi = inject(OrderApiService);
    private router = inject(Router);

    customers = signal<Customer[]>([]);
    submitting = signal(false);
    error = signal<string | null>(null);

    form: FormGroup = this.fb.group({
        customerId: [null, Validators.required],
        lineItems: this.fb.array([this.createLineItem()])
    });

    ngOnInit(): void {
        this.orderApi.getCustomers().subscribe({
            next: (customers) => this.customers.set(customers),
            error: () => this.error.set('Could not load customers.')
        });
    }

    get lineItems(): FormArray {
        return this.form.get('lineItems') as FormArray;
    }

    createLineItem(): FormGroup {
        return this.fb.group({
            productId: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [0, [Validators.required, Validators.min(0)]]
        });
    }

    addLineItem(): void {
        this.lineItems.push(this.createLineItem());
    }

    removeLineItem(index: number): void {
        if (this.lineItems.length > 1) this.lineItems.removeAt(index);
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.submitting.set(true);
        this.error.set(null);

        const raw = this.form.value;
        const request = {
            customerId: Number(raw.customerId),
            lineItems: raw.lineItems.map((li: any) => ({
                productId: li.productId,
                quantity: Number(li.quantity),
                unitPriceCents: Math.round(Number(li.unitPrice) * 100)
            }))
        };

        this.orderApi.createOrder(request).subscribe({
            next: () => this.router.navigate(['/orders']),
            error: (err) => {
                const message = err?.error?.error ?? 'Could not create order.';
                this.error.set(message);
                this.submitting.set(false);
            }
        });
    }
}