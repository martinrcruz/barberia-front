import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { VentaResponse, VentaRequest } from '../models/venta.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private readonly http = inject(HttpClient);
  // El VentaController usa @RequestMapping("/ventas") pero el context-path es /api
  // Por lo tanto el endpoint completo es /api/ventas
  private readonly apiUrl = `${environment.apiUrl}/ventas`;

  crearVenta(request: VentaRequest): Observable<ApiResponse<VentaResponse>> {
    return this.http.post<ApiResponse<VentaResponse>>(this.apiUrl, request);
  }

  obtenerVentaPorId(id: number): Observable<ApiResponse<VentaResponse>> {
    return this.http.get<ApiResponse<VentaResponse>>(`${this.apiUrl}/${id}`);
  }

  listarVentas(page: number = 0, size: number = 10): Observable<ApiResponse<Page<VentaResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<VentaResponse>>>(this.apiUrl, { params });
  }

  listarVentasPorSucursal(sucursalId: number): Observable<ApiResponse<VentaResponse[]>> {
    return this.http.get<ApiResponse<VentaResponse[]>>(`${this.apiUrl}/sucursal/${sucursalId}`);
  }

  listarVentasPorFecha(fechaInicio: string, fechaFin: string): Observable<ApiResponse<VentaResponse[]>> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<ApiResponse<VentaResponse[]>>(`${this.apiUrl}/fecha`, { params });
  }

  anularVenta(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  generarComprobante(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/comprobante`, { responseType: 'blob' });
  }
}

