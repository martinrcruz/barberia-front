import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const CONTABILIDAD_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./views/contabilidad-dashboard/contabilidad-dashboard.component').then(
            (m) => m.ContabilidadDashboardComponent
          ),
      },
    ],
  },
];


