import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isAuthEndpoint = req.url.includes('/auth/');
  
  if (token && !isAuthEndpoint) {
    console.log('[AuthInterceptor] Agregando token a petición:', {
      url: req.url,
      method: req.method,
      tokenLength: token.length
    });
    
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  if (!token && !isAuthEndpoint) {
    console.log('[AuthInterceptor] Petición sin token (endpoint protegido):', req.url);
  }

  return next(req);
};

