export interface SucursalResponse {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horarioApertura: string;
  horarioCierre: string;
  diasAtencion: string;
  administrador: UsuarioBasicResponse | null;
  comisionDefecto: number;
  createdAt: string;
  updatedAt: string;
}

export interface SucursalRequest {
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  horarioApertura?: string;
  horarioCierre?: string;
  diasAtencion?: string;
  administradorId?: number;
  comisionDefecto?: number;
}

export interface UsuarioBasicResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

