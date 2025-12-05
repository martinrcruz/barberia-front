import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Page } from '../models/page.model';
import { MetodoPagoRequest, MetodoPagoResponse } from '../models/metodo-pago.model';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/metodos-pago`;

  listarTodos(page: number = 0, size: number = 10): Observable<ApiResponse<Page<MetodoPagoResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<MetodoPagoResponse>>>(this.apiUrl, { params });
  }

  listarActivosOrdenados(): Observable<ApiResponse<MetodoPagoResponse[]>> {
    return this.http.get<ApiResponse<MetodoPagoResponse[]>>(`${this.apiUrl}/activos`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<MetodoPagoResponse>> {
    return this.http.get<ApiResponse<MetodoPagoResponse>>(`${this.apiUrl}/${id}`);
  }

  crear(request: MetodoPagoRequest): Observable<ApiResponse<MetodoPagoResponse>> {
    return this.http.post<ApiResponse<MetodoPagoResponse>>(this.apiUrl, request);
  }

  actualizar(id: number, request: MetodoPagoRequest): Observable<ApiResponse<MetodoPagoResponse>> {
    return this.http.put<ApiResponse<MetodoPagoResponse>>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  activarDesactivar(id: number, activo: boolean): Observable<ApiResponse<MetodoPagoResponse>> {
    return this.http.patch<ApiResponse<MetodoPagoResponse>>(
      `${this.apiUrl}/${id}/activar`,
      null,
      { params: new HttpParams().set('activo', activo.toString()) }
    );
  }
}




