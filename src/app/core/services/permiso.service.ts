import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface Permiso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoPermiso: 'VISTA' | 'ACCION' | 'ENDPOINT';
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermisoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoPermiso: 'VISTA' | 'ACCION' | 'ENDPOINT';
}

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  private readonly http = inject(HttpClient);
  // El backend expone /permisos bajo el contexto api (environment.apiUrl ya incluye /api)
  private readonly apiUrl = `${environment.apiUrl}/permisos`;

  obtenerTodos(): Observable<ApiResponse<Permiso[]>> {
    return this.http.get<ApiResponse<any>>(this.apiUrl).pipe(
      map((response) => {
        let raw = response.data;

        // Normalizar a array plano
        const items = Array.isArray(raw)
          ? raw
          : raw?.content || [];

        const mapped: Permiso[] = items.map((p: any) => ({
          id: p.id,
          codigo: p.codigo,
          nombre: p.nombre,
          descripcion: p.descripcion,
          // En backend se llama "tipo"
          tipoPermiso: p.tipo,
          active: p.active ?? true,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }));

        return {
          ...response,
          data: mapped
        };
      })
    );
  }

  obtenerPorId(id: number): Observable<ApiResponse<Permiso>> {
    return this.http.get<ApiResponse<Permiso>>(`${this.apiUrl}/${id}`);
  }

  crear(request: PermisoRequest): Observable<ApiResponse<Permiso>> {
    return this.http.post<ApiResponse<Permiso>>(this.apiUrl, request);
  }

  actualizar(id: number, request: PermisoRequest): Observable<ApiResponse<Permiso>> {
    return this.http.put<ApiResponse<Permiso>>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}

