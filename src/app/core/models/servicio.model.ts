export interface ServicioResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaResponse | null;
  precio: number;
  duracionMinutos: number;
  tieneIva: boolean;
  sucursal: SucursalBasicResponse;
  insumosUtilizados: InsumoBasicResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ServicioRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId?: number;
  precio: number;
  duracionMinutos?: number;
  tieneIva?: boolean;
  sucursalId: number;
  insumosUtilizadosIds?: number[];
}

export interface CategoriaResponse {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface SucursalBasicResponse {
  id: number;
  nombre: string;
}

export interface InsumoBasicResponse {
  id: number;
  nombre: string;
  codigo: string;
}

