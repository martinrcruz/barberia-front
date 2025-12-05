import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const SUCURSALES_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./views/sucursales-list/sucursales-list.component').then(m => m.SucursalesListComponent)
      }
    ]
  }
];

