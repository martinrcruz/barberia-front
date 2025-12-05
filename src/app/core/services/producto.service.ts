import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ProductoResponse, ProductoRequest } from '../models/producto.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  crear(request: ProductoRequest): Observable<ApiResponse<ProductoResponse>> {
    return this.http.post<ApiResponse<ProductoResponse>>(this.apiUrl, request);
  }

  actualizar(id: number, request: ProductoRequest): Observable<ApiResponse<ProductoResponse>> {
    return this.http.put<ApiResponse<ProductoResponse>>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<ProductoResponse>> {
    return this.http.get<ApiResponse<ProductoResponse>>(`${this.apiUrl}/${id}`);
  }

  listarTodos(page: number = 0, size: number = 10): Observable<ApiResponse<Page<ProductoResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<ProductoResponse>>>(this.apiUrl, { params });
  }

  listarPorSucursal(sucursalId: number, page: number = 0, size: number = 10): Observable<ApiResponse<Page<ProductoResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<ProductoResponse>>>(`${this.apiUrl}/sucursal/${sucursalId}`, { params });
  }

  listarPorSucursalSinPaginacion(sucursalId: number): Observable<ApiResponse<ProductoResponse[]>> {
    return this.http.get<ApiResponse<ProductoResponse[]>>(`${this.apiUrl}/sucursal/${sucursalId}/todos`);
  }

  listarConStockBajo(sucursalId: number): Observable<ApiResponse<ProductoResponse[]>> {
    return this.http.get<ApiResponse<ProductoResponse[]>>(`${this.apiUrl}/sucursal/${sucursalId}/stock-bajo`);
  }

  actualizarStock(id: number, cantidad: number, tipo: string): Observable<ApiResponse<ProductoResponse>> {
    const params = new HttpParams()
      .set('cantidad', cantidad.toString())
      .set('tipo', tipo);
    return this.http.patch<ApiResponse<ProductoResponse>>(`${this.apiUrl}/${id}/stock`, null, { params });
  }

  buscarPorCodigo(codigo: string): Observable<ApiResponse<ProductoResponse>> {
    return this.http.get<ApiResponse<ProductoResponse>>(`${this.apiUrl}/codigo/${codigo}`);
  }
}

