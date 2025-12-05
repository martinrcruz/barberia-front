export enum TipoMetodoPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA_DEBITO = 'TARJETA_DEBITO',
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  CHEQUE = 'CHEQUE',
  OTRO = 'OTRO'
}

export interface MetodoPagoResponse {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  esElectronico: boolean;
  requiereReferencia: boolean;
  orden: number;
  icono?: string;
  tipoMetodo: TipoMetodoPago;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MetodoPagoRequest {
  nombre: string;
  codigo: string;
  descripcion?: string;
  esElectronico?: boolean;
  requiereReferencia?: boolean;
  orden?: number;
  icono?: string;
  tipoMetodo: TipoMetodoPago;
}


