import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { SucursalResponse, SucursalRequest } from '../models/sucursal.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sucursales`;

  crear(request: SucursalRequest): Observable<ApiResponse<SucursalResponse>> {
    return this.http.post<ApiResponse<SucursalResponse>>(this.apiUrl, request);
  }

  actualizar(id: number, request: SucursalRequest): Observable<ApiResponse<SucursalResponse>> {
    return this.http.put<ApiResponse<SucursalResponse>>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<SucursalResponse>> {
    return this.http.get<ApiResponse<SucursalResponse>>(`${this.apiUrl}/${id}`);
  }

  listarTodos(page: number = 0, size: number = 10): Observable<ApiResponse<Page<SucursalResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<SucursalResponse>>>(this.apiUrl, { params });
  }

  listarTodasSinPaginacion(): Observable<ApiResponse<SucursalResponse[]>> {
    return this.http.get<ApiResponse<SucursalResponse[]>>(`${this.apiUrl}/todas`);
  }
}

