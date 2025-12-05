export interface Rol {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  permisos?: Permiso[];
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Permiso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  // En el backend viene como "tipo" y puede faltar, por eso lo dejamos opcional
  tipoPermiso?: 'VISTA' | 'ACCION' | 'ENDPOINT';
  // El backend también puede no enviar este campo en algunas respuestas
  active?: boolean;
}

export interface RolFormData {
  nombre: string;
  codigo: string;
  descripcion?: string;
  permisosIds?: number[];
}

