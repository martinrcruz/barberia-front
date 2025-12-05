import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ClienteResponse, ClienteRequest } from '../models/cliente.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/clientes`;

  crear(request: ClienteRequest): Observable<ApiResponse<ClienteResponse>> {
    return this.http.post<ApiResponse<ClienteResponse>>(this.apiUrl, request);
  }

  actualizar(id: number, request: ClienteRequest): Observable<ApiResponse<ClienteResponse>> {
    return this.http.put<ApiResponse<ClienteResponse>>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<ClienteResponse>> {
    return this.http.get<ApiResponse<ClienteResponse>>(`${this.apiUrl}/${id}`);
  }

  listarTodos(page: number = 0, size: number = 10): Observable<ApiResponse<Page<ClienteResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<Page<ClienteResponse>>>(this.apiUrl, { params });
  }

  listarTodosSinPaginacion(): Observable<ApiResponse<ClienteResponse[]>> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '10000'); // Número grande para obtener todos
    return this.http.get<ApiResponse<Page<ClienteResponse>>>(this.apiUrl, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            const page = response.data as Page<ClienteResponse>;
            return {
              ...response,
              data: page.content || []
            } as ApiResponse<ClienteResponse[]>;
          }
          return {
            ...response,
            data: []
          } as ApiResponse<ClienteResponse[]>;
        })
      );
  }
}


