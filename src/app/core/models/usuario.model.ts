export interface UsuarioResponse {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  telefono: string;
  rut: string;
  direccion?: string;
  nacionalidad?: string;
  fotoPerfil?: string;
  roles: RolResponse[];
  cuentaBloqueada: boolean;
  activo: boolean;
  porcentajeComision?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RolResponse {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  permisos?: PermisoResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PermisoResponse {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  tipo?: string;
  recurso?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PerfilRequest {
  telefono?: string;
  direccion?: string;
  nacionalidad?: string;
  fotoPerfil?: string;
}

export interface UsuarioEstadisticasResponse {
  gananciaPromedioMensual: number;
  serviciosFavoritos: ServicioFavoritoResponse[];
  totalVentas: number;
  totalGanancia: number;
}

export interface ServicioFavoritoResponse {
  servicioId: number;
  servicioNombre: string;
  cantidadVentas: number;
}

