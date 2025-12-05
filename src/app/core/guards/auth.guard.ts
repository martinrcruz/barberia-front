import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  console.log('[AuthGuard] Verificando acceso a ruta:', state.url);
  
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar que exista un token y que el usuario esté autenticado
  const token = authService.getToken();
  const isAuthenticated = authService.isAuthenticated();

  console.log('[AuthGuard] Estado de autenticación:', {
    tieneToken: !!token,
    tokenLength: token?.length || 0,
    isAuthenticated,
    ruta: state.url
  });

  if (token && isAuthenticated) {
    console.log('[AuthGuard] ✓ Acceso permitido - Usuario autenticado');
    return true;
  }

  console.log('[AuthGuard] ✗ Acceso denegado - Redirigiendo a login');

  // Si no hay token o no está autenticado, limpiar y redirigir a login
  if (token) {
    console.log('[AuthGuard] Token encontrado pero usuario no autenticado - Limpiando datos');
    // Si hay token pero no está autenticado, limpiar localStorage sin navegar
    authService.clearAuthData();
  }

  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

