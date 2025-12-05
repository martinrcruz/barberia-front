import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { RolResponse } from '../models/usuario.model';

export interface RolRequest {
  nombre: string;
  codigo: string;
  descripcion?: string;
  permisosIds?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/roles`;

  listarTodasSinPaginacion(): Observable<ApiResponse<RolResponse[]>> {
    return this.http.get<ApiResponse<RolResponse[]>>(`${this.apiUrl}/todas`);
  }

  listarTodos(page: number = 0, size: number = 10): Observable<ApiResponse<{ content: RolResponse[] }>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<{ content: RolResponse[] }>>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<ApiResponse<RolResponse>> {
    return this.http.get<ApiResponse<RolResponse>>(`${this.apiUrl}/${id}`);
  }

  crear(request: RolRequest): Observable<ApiResponse<RolResponse>> {
    return this.http.post<ApiResponse<RolResponse>>(this.apiUrl, request);
  }

  actualizar(id: number, request: RolRequest): Observable<ApiResponse<RolResponse>> {
    return this.http.put<ApiResponse<RolResponse>>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  clonarRol(rolId: number, nuevoNombre: string): Observable<ApiResponse<RolResponse>> {
    return this.http.post<ApiResponse<RolResponse>>(`${this.apiUrl}/${rolId}/clonar`, { nuevoNombre });
  }

  agregarPermiso(rolId: number, permisoId: number): Observable<ApiResponse<RolResponse>> {
    return this.http.post<ApiResponse<RolResponse>>(`${this.apiUrl}/${rolId}/permisos/${permisoId}`, {});
  }

  removerPermiso(rolId: number, permisoId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${rolId}/permisos/${permisoId}`);
  }

  agregarMultiplesPermisos(rolId: number, permisosIds: number[]): Observable<ApiResponse<RolResponse>> {
    return this.http.post<ApiResponse<RolResponse>>(`${this.apiUrl}/${rolId}/permisos/batch`, { permisosIds });
  }
}


