export interface ProductoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaResponse | null;
  precioVenta: number;
  precioCosto: number;
  stockActual: number;
  stockMinimo: number;
  tieneIva: boolean;
  imagenUrl: string;
  sucursal: SucursalBasicResponse;
  unidadMedida: string;
  createdAt: string;
  updatedAt: string;
  stockBajo: boolean;
}

export interface ProductoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId?: number;
  precioVenta: number;
  precioCosto?: number;
  stockActual?: number;
  stockMinimo?: number;
  tieneIva?: boolean;
  imagenUrl?: string;
  sucursalId: number;
  unidadMedida?: string;
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

