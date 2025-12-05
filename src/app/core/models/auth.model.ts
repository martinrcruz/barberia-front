export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rut?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  tipo: string;
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  roles: string[];
  permisos: string[];
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rut?: string;
  direccion?: string;
  nacionalidad?: string;
  fotoPerfil?: string;
  roles: string[];
  permisos: string[];
  porcentajeComision?: number;
  createdAt?: string;
}

