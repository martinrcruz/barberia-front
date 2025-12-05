export interface ClienteResponse {
  id: number;
  nombreCompleto: string;
  rut?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  observaciones?: string;
}

export interface ClienteRequest {
  nombreCompleto: string;
  rut?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  observaciones?: string;
}


