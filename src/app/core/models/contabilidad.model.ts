export interface RegistroContableResponse {
  id: number;
  fechaRegistro: string;
  tipoRegistro: string;
  categoria: string;
  monto: number;
  descripcion?: string;
  sucursalId?: number;
  sucursalNombre?: string;
  ventaId?: number;
  compraId?: number;
  referencia?: string;
}

export interface ResumenContableResponse {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
}


