import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'orders', pathMatch: 'full' },
    { path: 'orders', loadComponent: () => import('./features/orders/order-list.component').then(m => m.OrderListComponent) },
    { path: 'orders/new', loadComponent: () => import('./features/orders/order-entry.component').then(m => m.OrderEntryComponent) }
];
