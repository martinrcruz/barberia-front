export interface VentaResponse {
  id: number;
  numeroVenta: string;
  fechaVenta: string;
  trabajadorNombre: string;
  clienteNombre?: string | null;
  sucursalNombre: string;
  subtotal: number;
  iva: number;
  total: number;
  comisionTrabajador: number;
  metodoPago: string;
  observaciones: string;
  detalles: DetalleVentaResponse[];
  comprobanteUrl: string;
}

export interface DetalleVentaResponse {
  id: number;
  tipoItem: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  aplicaIva: boolean;
}

export interface VentaRequest {
  trabajadorId: number;
  clienteId?: number | null;
  sucursalId: number;
  metodoPago: string;
  detalles: DetalleVentaRequest[];
  observaciones?: string;
}

export interface DetalleVentaRequest {
  tipoItem: string; // PRODUCTO o SERVICIO
  productoId?: number;
  servicioId?: number;
  descripcion?: string;
  cantidad: number;
  precioUnitario: number;
  aplicaIva?: boolean;
}

