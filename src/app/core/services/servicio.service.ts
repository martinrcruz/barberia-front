import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ServicioResponse, ServicioRequest } from '../models/servicio.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/servicios`;

  crear(request: ServicioRequest): Observable<ApiResponse<ServicioResponse>> {
    return this.http.post<ApiResponse<ServicioResponse>>(this.apiUrl, request);
  }

  actualizar(id: number, request: ServicioRequest): Observable<ApiResponse<ServicioResponse>> {
    return this.http.put<ApiResponse<ServicioResponse>>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<ServicioResponse>> {
    return this.http.get<ApiResponse<ServicioResponse>>(`${this.apiUrl}/${id}`);
  }

  listarTodos(page: number = 0, size: number = 10): Observable<ApiResponse<Page<ServicioResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<ServicioResponse>>>(this.apiUrl, { params });
  }

  listarPorSucursal(sucursalId: number, page: number = 0, size: number = 10): Observable<ApiResponse<Page<ServicioResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<ServicioResponse>>>(`${this.apiUrl}/sucursal/${sucursalId}`, { params });
  }

  listarPorSucursalSinPaginacion(sucursalId: number): Observable<ApiResponse<ServicioResponse[]>> {
    return this.http.get<ApiResponse<ServicioResponse[]>>(`${this.apiUrl}/sucursal/${sucursalId}/todos`);
  }

  buscarPorCodigo(codigo: string): Observable<ApiResponse<ServicioResponse>> {
    return this.http.get<ApiResponse<ServicioResponse>>(`${this.apiUrl}/codigo/${codigo}`);
  }
}

