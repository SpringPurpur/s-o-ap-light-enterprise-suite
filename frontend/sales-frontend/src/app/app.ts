import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('sales-frontend');
  protected readonly navItems = [
    { path: '/', label: 'Overview', exact: true },
    { path: '/orders', label: 'Orders', exact: false },
    { path: '/stock', label: 'Stock', exact: false },
    { path: '/requisitions', label: 'Requisitions', exact: false },
    { path: '/invoices', label: 'Invoices', exact: false },
  ]
}
