import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./views/usuarios-list/usuarios-list.component').then(m => m.UsuariosListComponent)
      }
    ]
  }
];

