import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES)
  },
  {
    path: 'clientes',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/perfil/perfil.routes').then(m => m.PERFIL_ROUTES)
  },
  {
    path: 'ventas',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/ventas/ventas.routes').then(m => m.VENTAS_ROUTES)
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/productos/productos.routes').then(m => m.PRODUCTOS_ROUTES)
  },
  {
    path: 'servicios',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/servicios/servicios.routes').then(m => m.SERVICIOS_ROUTES)
  },
  {
    path: 'contabilidad',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/contabilidad/contabilidad.routes').then(m => m.CONTABILIDAD_ROUTES)
  },
  {
    path: 'configuracion',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/configuracion/configuracion.routes').then(m => m.CONFIGURACION_ROUTES)
  },
  {
    path: 'sucursales',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/sucursales/sucursales.routes').then(m => m.SUCURSALES_ROUTES)
  },
  {
    path: 'roles',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/roles/roles.routes').then(m => m.ROLES_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

