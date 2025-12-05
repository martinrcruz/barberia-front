import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    console.log('[AuthService] Inicializando servicio de autenticación');
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    console.log('[AuthService] Intentando login para:', credentials.email);
    console.log('[AuthService] URL de login:', `${this.apiUrl}/login`);
    
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('[AuthService] Respuesta del login:', {
          success: response.success,
          hasData: !!response.data,
          userId: response.data?.id
        });
        
        if (response.success && response.data) {
          console.log('[AuthService] Login exitoso - Guardando datos de autenticación');
          this.saveAuthData(response.data);
        } else {
          console.warn('[AuthService] Login fallido - Respuesta sin datos válidos');
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.saveAuthData(response.data);
        }
      })
    );
  }

  logout(): void {
    console.log('[AuthService] Ejecutando logout');
    const currentUrl = this.router.url;
    console.log('[AuthService] URL actual:', currentUrl);
    
    this.clearAuthData();
    
    // Solo navegar si no estamos ya en la página de login
    if (!currentUrl.includes('/auth/login')) {
      console.log('[AuthService] Redirigiendo a login');
      this.router.navigate(['/auth/login']);
    } else {
      console.log('[AuthService] Ya estamos en login - No redirigiendo');
    }
  }

  clearAuthData(): void {
    console.log('[AuthService] Limpiando datos de autenticación');
    const hadToken = !!localStorage.getItem('token');
    const hadUser = !!localStorage.getItem('user');
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    
    console.log('[AuthService] Datos limpiados:', {
      teniaToken: hadToken,
      teniaUsuario: hadUser
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasPermission(permission: string): boolean {
    // Si no se requiere un permiso específico, permitir acceso
    if (!permission) {
      return true;
    }

    const user = this.currentUser();

    // Regla de súper-administrador: cualquier usuario con rol ADMIN
    // tiene acceso a todas las vistas/opciones del sistema.
    if (user?.roles?.includes('ADMIN')) {
      return true;
    }

    return user?.permisos?.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.roles?.includes(role) || false;
  }

  private saveAuthData(authData: AuthResponse): void {
    console.log('[AuthService] Guardando datos de autenticación:', {
      userId: authData.id,
      email: authData.email,
      nombre: authData.nombre,
      roles: authData.roles,
      permisosCount: authData.permisos?.length || 0
    });
    
    localStorage.setItem('token', authData.token);
    localStorage.setItem('refreshToken', authData.refreshToken);

    const user: User = {
      id: authData.id,
      email: authData.email,
      nombre: authData.nombre,
      apellido: authData.apellido,
      roles: authData.roles,
      permisos: authData.permisos
    };

    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    
    console.log('[AuthService] ✓ Datos guardados correctamente - Usuario autenticado');
  }

  private loadUserFromStorage(): void {
    console.log('[AuthService] Cargando usuario desde localStorage');
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    console.log('[AuthService] Estado de localStorage:', {
      tieneToken: !!token,
      tokenLength: token?.length || 0,
      tieneUsuario: !!userStr,
      usuarioLength: userStr?.length || 0
    });

    // Solo cargar si hay token Y usuario válido
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        console.log('[AuthService] Usuario parseado:', {
          id: user?.id,
          email: user?.email,
          nombre: user?.nombre,
          tieneRoles: !!user?.roles,
          tienePermisos: !!user?.permisos
        });
        
        // Validar que el usuario tenga los campos mínimos requeridos
        if (user && user.id && user.email) {
          console.log('[AuthService] ✓ Usuario válido - Restaurando sesión');
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
        } else {
          console.warn('[AuthService] ✗ Usuario inválido - Faltan campos requeridos (id o email)');
          // Si el usuario no es válido, limpiar sin navegar
          this.clearAuthData();
        }
      } catch (error) {
        console.error('[AuthService] ✗ Error al parsear usuario desde localStorage:', error);
        // Si hay error al parsear, limpiar sin navegar
        this.clearAuthData();
      }
    } else {
      console.log('[AuthService] No hay datos de sesión en localStorage - Usuario no autenticado');
      // Si no hay token o usuario, asegurar que esté desautenticado
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
    }
  }
}

