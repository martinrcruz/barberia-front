import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./views/roles-list/roles-list.component').then(m => m.RolesListComponent)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./views/roles-form/roles-form.component').then(m => m.RolesFormComponent)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./views/roles-form/roles-form.component').then(m => m.RolesFormComponent)
      }
    ]
  }
];

