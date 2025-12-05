import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('[ErrorInterceptor] Error HTTP capturado:', {
        url: req.url,
        status: error.status,
        statusText: error.statusText,
        message: error.message
      });

      if (error.status === 401) {
        console.warn('[ErrorInterceptor] 401 Unauthorized - Cerrando sesión y redirigiendo a login');
        authService.logout();
        router.navigate(['/auth/login']);
      }

      if (error.status === 403) {
        console.error('[ErrorInterceptor] 403 Forbidden - Acceso denegado');
      }

      if (error.status === 500) {
        console.error('[ErrorInterceptor] 500 Internal Server Error');
      }

      return throwError(() => error);
    })
  );
};

