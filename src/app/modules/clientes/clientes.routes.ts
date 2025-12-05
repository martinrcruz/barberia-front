import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./views/clientes-list/clientes-list.component').then(
            (m) => m.ClientesListComponent
          ),
      },
    ],
  },
];


