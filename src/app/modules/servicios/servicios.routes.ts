import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const SERVICIOS_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./views/servicios-list/servicios-list.component').then(m => m.ServiciosListComponent)
      }
    ]
  }
];

