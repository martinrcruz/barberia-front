import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UsuarioResponse, PerfilRequest, UsuarioEstadisticasResponse } from '../models/usuario.model';
import { Page } from '../models/page.model';

export interface UsuarioRequest {
  email: string;
  password?: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rut?: string;
  rolesIds?: number[];
   porcentajeComision?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  crear(request: UsuarioRequest): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.post<ApiResponse<UsuarioResponse>>(this.apiUrl, request);
  }

  actualizar(id: number, request: UsuarioRequest): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.put<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.get<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/${id}`);
  }

  listarTodos(page: number = 0, size: number = 10): Observable<ApiResponse<Page<UsuarioResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<UsuarioResponse>>>(this.apiUrl, { params });
  }

  listarTodasSinPaginacion(): Observable<ApiResponse<UsuarioResponse[]>> {
    return this.http.get<ApiResponse<UsuarioResponse[]>>(`${this.apiUrl}/todas`);
  }

  activarDesactivar(id: number, activo: boolean): Observable<ApiResponse<UsuarioResponse>> {
    const params = new HttpParams().set('activo', activo.toString());
    return this.http.patch<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/${id}/activar`, null, { params });
  }

  bloquearCuenta(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/bloquear`, null);
  }

  desbloquearCuenta(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/desbloquear`, null);
  }

  actualizarMiPerfil(request: PerfilRequest): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.put<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/mi-perfil`, request);
  }

  obtenerEstadisticas(id: number): Observable<ApiResponse<UsuarioEstadisticasResponse>> {
    return this.http.get<ApiResponse<UsuarioEstadisticasResponse>>(`${this.apiUrl}/${id}/estadisticas`);
  }
}

