import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./views/productos-list/productos-list.component').then(m => m.ProductosListComponent)
      }
    ]
  }
];

