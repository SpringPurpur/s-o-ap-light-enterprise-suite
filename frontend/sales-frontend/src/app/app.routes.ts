import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'orders', pathMatch: 'full' },
    { path: 'orders', loadComponent: () => import('./features/orders/order-list.component').then(m => m.OrderListComponent) },
    { path: 'orders/new', loadComponent: () => import('./features/orders/order-entry.component').then(m => m.OrderEntryComponent) },
    { path: 'stock', loadComponent: () => import('./features/inventory/stock-levels.component').then(m => m.StockLevelsComponent) },
    { path: 'requisitions', loadComponent: () => import('./features/requisitions/requisition-queue.component').then(m => m.RequisitionQueueComponent) },
    { path: 'invoices', loadComponent: () => import('./features/invoices/invoice-list.component').then(m => m.InvoiceListComponent) }
];
