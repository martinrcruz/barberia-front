import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const CONFIGURACION_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./views/configuracion-dashboard/configuracion-dashboard.component').then(
            (m) => m.ConfiguracionDashboardComponent
          ),
      },
      {
        path: 'metodos-pago',
        loadComponent: () =>
          import('./views/metodos-pago/metodos-pago.component').then(
            (m) => m.MetodosPagoComponent
          ),
      },
    ],
  },
];


