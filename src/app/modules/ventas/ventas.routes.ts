import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const VENTAS_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./views/ventas-list/ventas-list.component').then(m => m.VentasListComponent)
      },
      {
        path: 'caja',
        loadComponent: () => import('./views/caja/caja.component').then(m => m.CajaComponent)
      }
    ]
  }
];

