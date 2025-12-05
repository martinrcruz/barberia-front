import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { RegistroContableResponse, ResumenContableResponse } from '../models/contabilidad.model';

@Injectable({
  providedIn: 'root'
})
export class ContabilidadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/contabilidad`;

  listarRegistros(
    sucursalId?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<ApiResponse<RegistroContableResponse[]>> {
    let params = new HttpParams();

    if (sucursalId !== undefined && sucursalId !== null) {
      params = params.set('sucursalId', sucursalId.toString());
    }
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<ApiResponse<RegistroContableResponse[]>>(
      `${this.apiUrl}/registros`,
      { params }
    );
  }

  obtenerResumen(
    sucursalId: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<ApiResponse<ResumenContableResponse>> {
    let params = new HttpParams().set('sucursalId', sucursalId.toString());

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<ApiResponse<ResumenContableResponse>>(
      `${this.apiUrl}/resumen`,
      { params }
    );
  }

  exportarPDF(
    sucursalId?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<Blob> {
    let params = new HttpParams();

    if (sucursalId !== undefined && sucursalId !== null) {
      params = params.set('sucursalId', sucursalId.toString());
    }
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get(`${this.apiUrl}/exportar/pdf`, { 
      params,
      responseType: 'blob' 
    });
  }

  exportarExcel(
    sucursalId?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<Blob> {
    let params = new HttpParams();

    if (sucursalId !== undefined && sucursalId !== null) {
      params = params.set('sucursalId', sucursalId.toString());
    }
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get(`${this.apiUrl}/exportar/excel`, { 
      params,
      responseType: 'blob' 
    });
  }
}


