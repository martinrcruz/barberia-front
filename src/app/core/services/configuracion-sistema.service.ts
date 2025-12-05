import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  ConfiguracionSistemaRequest,
  ConfiguracionSistemaResponse
} from '../models/configuracion-sistema.model';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionSistemaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/configuraciones`;

  listarTodas(): Observable<ApiResponse<ConfiguracionSistemaResponse[]>> {
    return this.http.get<ApiResponse<ConfiguracionSistemaResponse[]>>(this.apiUrl);
  }

  listarEditables(): Observable<ApiResponse<ConfiguracionSistemaResponse[]>> {
    return this.http.get<ApiResponse<ConfiguracionSistemaResponse[]>>(
      `${this.apiUrl}/editables`
    );
  }

  crear(
    request: ConfiguracionSistemaRequest
  ): Observable<ApiResponse<ConfiguracionSistemaResponse>> {
    return this.http.post<ApiResponse<ConfiguracionSistemaResponse>>(
      this.apiUrl,
      request
    );
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  listarPorCategoria(categoria: string): Observable<ApiResponse<ConfiguracionSistemaResponse[]>> {
    return this.http.get<ApiResponse<ConfiguracionSistemaResponse[]>>(
      `${this.apiUrl}/categoria/${categoria}`
    );
  }

  actualizar(
    id: number,
    request: ConfiguracionSistemaRequest
  ): Observable<ApiResponse<ConfiguracionSistemaResponse>> {
    return this.http.put<ApiResponse<ConfiguracionSistemaResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }
}


