export interface ConfiguracionSistemaResponse {
  id: number;
  clave: string;
  valor: string | null;
  tipo: string | null;
  descripcion: string | null;
  categoria: string | null;
  editable: boolean;
}

export interface ConfiguracionSistemaRequest {
  clave: string;
  valor?: string | null;
  tipo?: string | null;
  descripcion?: string | null;
  categoria?: string | null;
  editable?: boolean;
}


