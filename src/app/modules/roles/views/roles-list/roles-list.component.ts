import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RolService } from '../../../../core/services/rol.service';
import { PermisoService } from '../../../../core/services/permiso.service';
import { Rol, Permiso } from '../../../../core/models/rol.model';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ModalComponent, HasPermissionDirective, FormsModule],
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss']
})
export class RolesListComponent implements OnInit {
  private rolService = inject(RolService);
  private permisoService = inject(PermisoService);
  private router = inject(Router);

  @ViewChild('clonarModal') clonarModal!: ModalComponent;
  @ViewChild('permisosModal') permisosModal!: ModalComponent;

  roles: Rol[] = [];
  permisos: Permiso[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 0;
  pageSize = 10;

  // Para clonar rol
  rolAClonar: Rol | null = null;
  nombreNuevoRol = '';
  clonarLoading = false;

  // Para gestionar permisos
  rolSeleccionado: Rol | null = null;
  permisosSeleccionados: number[] = [];
  permisosLoading = false;

  tableColumns: TableColumn[] = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'nombre', header: 'Nombre', sortable: true },
    { field: 'codigo', header: 'Código', sortable: true },
    { field: 'descripcion', header: 'Descripción' },
    { field: 'permisos.length', header: '# Permisos' }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'pencil',
      label: 'Editar',
      color: 'primary',
      handler: (row: Rol) => this.editarRol(row),
      permission: 'ROL_EDITAR'
    },
    {
      icon: 'key',
      label: 'Permisos',
      color: 'info',
      handler: (row: Rol) => this.gestionarPermisos(row),
      permission: 'ROL_EDITAR'
    },
    {
      icon: 'files',
      label: 'Clonar',
      color: 'secondary',
      handler: (row: Rol) => this.abrirModalClonar(row),
      permission: 'ROL_CREAR'
    },
    {
      icon: 'trash',
      label: 'Eliminar',
      color: 'danger',
      handler: (row: Rol) => this.eliminarRol(row),
      permission: 'ROL_ELIMINAR'
    }
  ];

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarPermisos();
  }

  cargarRoles(): void {
    this.loading = true;
    this.rolService.listarTodos(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.roles = response.data.content;
          this.totalRecords = response.data.content.length;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.loading = false;
      }
    });
  }

  cargarPermisos(): void {
    this.permisoService.obtenerTodos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Normalizar siempre a array
          this.permisos = Array.isArray(response.data)
            ? response.data
            : (response.data as any)?.content || [];
        } else {
          this.permisos = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.permisos = [];
      }
    });
  }

  nuevoRol(): void {
    this.router.navigate(['/roles/nuevo']);
  }

  editarRol(rol: Rol): void {
    this.router.navigate(['/roles', rol.id, 'editar']);
  }

  eliminarRol(rol: Rol): void {
    if (confirm(`¿Está seguro de eliminar el rol "${rol.nombre}"?`)) {
      this.rolService.eliminar(rol.id).subscribe({
        next: () => {
          alert('Rol eliminado exitosamente');
          this.cargarRoles();
        },
        error: (error) => {
          console.error('Error al eliminar rol:', error);
          alert('Error al eliminar el rol');
        }
      });
    }
  }

  abrirModalClonar(rol: Rol): void {
    this.rolAClonar = rol;
    this.nombreNuevoRol = `${rol.nombre} (Copia)`;
    this.clonarModal.open();
  }

  clonarRol(): void {
    if (!this.rolAClonar || !this.nombreNuevoRol.trim()) {
      alert('Debe ingresar un nombre para el nuevo rol');
      return;
    }

    this.clonarLoading = true;
    this.rolService.clonarRol(this.rolAClonar.id, this.nombreNuevoRol).subscribe({
      next: () => {
        alert('Rol clonado exitosamente');
        this.clonarModal.closeModal();
        this.clonarLoading = false;
        this.cargarRoles();
      },
      error: (error) => {
        console.error('Error al clonar rol:', error);
        alert('Error al clonar el rol');
        this.clonarLoading = false;
      }
    });
  }

  gestionarPermisos(rol: Rol): void {
    this.rolSeleccionado = rol;
    this.permisosSeleccionados = rol.permisos?.map(p => p.id) || [];
    this.permisosModal.open();
  }

  togglePermiso(permisoId: number, event: any): void {
    if (event.target.checked) {
      this.permisosSeleccionados.push(permisoId);
    } else {
      this.permisosSeleccionados = this.permisosSeleccionados.filter(id => id !== permisoId);
    }
  }

  guardarPermisos(): void {
    if (!this.rolSeleccionado) return;

    this.permisosLoading = true;
    
    // Obtener permisos actuales del rol
    const permisosActuales = this.rolSeleccionado.permisos?.map(p => p.id) || [];
    
    // Calcular permisos a agregar y remover
    const permisosAgregar = this.permisosSeleccionados.filter(id => !permisosActuales.includes(id));
    const permisosRemover = permisosActuales.filter(id => !this.permisosSeleccionados.includes(id));

    // Procesar cambios
    const requests = [];
    
    // Agregar nuevos permisos
    if (permisosAgregar.length > 0) {
      requests.push(
        this.rolService.agregarMultiplesPermisos(this.rolSeleccionado.id, permisosAgregar)
      );
    }
    
    // Remover permisos
    permisosRemover.forEach(permisoId => {
      requests.push(
        this.rolService.removerPermiso(this.rolSeleccionado!.id, permisoId)
      );
    });

    if (requests.length === 0) {
      this.permisosModal.closeModal();
      this.permisosLoading = false;
      return;
    }

    // Ejecutar todas las peticiones
    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        alert('Permisos actualizados exitosamente');
        this.permisosModal.closeModal();
        this.permisosLoading = false;
        this.cargarRoles();
      })
      .catch((error) => {
        console.error('Error al actualizar permisos:', error);
        alert('Error al actualizar los permisos');
        this.permisosLoading = false;
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.cargarRoles();
  }

  isPermisoSeleccionado(permisoId: number): boolean {
    return this.permisosSeleccionados.includes(permisoId);
  }

  getPermisosPorTipo(tipo: string): Permiso[] {
    return this.permisos.filter(p => p.tipoPermiso === tipo);
  }
}

