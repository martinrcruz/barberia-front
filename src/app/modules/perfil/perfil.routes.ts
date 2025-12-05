import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const PERFIL_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./views/perfil/perfil.component').then(
            (m) => m.PerfilComponent
          ),
      },
    ],
  },
];


