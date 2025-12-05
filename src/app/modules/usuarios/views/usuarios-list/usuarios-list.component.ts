import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService, UsuarioRequest } from '@core/services/usuario.service';
import { RolService } from '@core/services/rol.service';
import { UsuarioResponse, RolResponse } from '@core/models/usuario.model';
import { ApiResponse } from '@core/models/api-response.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss']
})
export class UsuariosListComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private readonly fb = inject(FormBuilder);

  usuarios: UsuarioResponse[] = [];
  rolesDisponibles: RolResponse[] = [];
  usuarioSeleccionado: UsuarioResponse | null = null;
  mostrarFormulario = false;
  modoEdicion = false;
  cargando = false;
  error: string | null = null;

  formulario: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.minLength(6)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.maxLength(20)]],
    rut: ['', [Validators.maxLength(12)]],
    rolesIds: [[]],
    porcentajeComision: [null]
  });

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = null;
    this.usuarioService.listarTodasSinPaginacion().subscribe({
      next: (response: ApiResponse<UsuarioResponse[]>) => {
        if (response.success && response.data) {
          this.usuarios = response.data;
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar los usuarios';
        this.cargando = false;
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  cargarRoles(): void {
    this.rolService.listarTodasSinPaginacion().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.rolesDisponibles = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
      }
    });
  }

  abrirFormularioCrear(): void {
    this.modoEdicion = false;
    this.usuarioSeleccionado = null;
    this.formulario.reset();
    this.formulario.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.formulario.get('password')?.updateValueAndValidity();
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(usuario: UsuarioResponse): void {
    this.modoEdicion = true;
    this.usuarioSeleccionado = usuario;
    this.formulario.patchValue({
      email: usuario.email,
      password: '', // No mostrar contraseña
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono || '',
      rut: usuario.rut || '',
      rolesIds: usuario.roles ? usuario.roles.map((r: RolResponse) => r.id) : [],
      porcentajeComision: usuario.porcentajeComision ?? null
    });
    // En edición, la contraseña es opcional
    this.formulario.get('password')?.clearValidators();
    this.formulario.get('password')?.setValidators([Validators.minLength(6)]);
    this.formulario.get('password')?.updateValueAndValidity();
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formulario.reset();
    this.usuarioSeleccionado = null;
    this.error = null;
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = null;
    const formValue = this.formulario.value;
    
    // Si es edición y no hay password, no enviarlo
    const request: UsuarioRequest = {
      email: formValue.email,
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      telefono: formValue.telefono || undefined,
      rut: formValue.rut || undefined,
      rolesIds: formValue.rolesIds || [],
      porcentajeComision: formValue.porcentajeComision !== null ? formValue.porcentajeComision : undefined
    };

    // Solo incluir password si se proporciona
    if (formValue.password && formValue.password.trim() !== '') {
      request.password = formValue.password;
    }

    const operacion = this.modoEdicion && this.usuarioSeleccionado
      ? this.usuarioService.actualizar(this.usuarioSeleccionado.id, request)
      : this.usuarioService.crear(request);

    operacion.subscribe({
      next: (response: ApiResponse<UsuarioResponse>) => {
        if (response.success) {
          this.cerrarFormulario();
          this.cargarUsuarios();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al guardar el usuario';
        this.cargando = false;
        console.error('Error al guardar usuario:', err);
      }
    });
  }

  eliminar(usuario: UsuarioResponse): void {
    if (!confirm(`¿Está seguro de eliminar el usuario "${usuario.nombreCompleto}"?`)) {
      return;
    }

    this.cargando = true;
    this.error = null;
    this.usuarioService.eliminar(usuario.id).subscribe({
      next: (response: ApiResponse<void>) => {
        if (response.success) {
          this.cargarUsuarios();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al eliminar el usuario';
        this.cargando = false;
        console.error('Error al eliminar usuario:', err);
      }
    });
  }

  activarDesactivar(usuario: UsuarioResponse): void {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de ${accion} el usuario "${usuario.nombreCompleto}"?`)) {
      return;
    }

    this.cargando = true;
    this.error = null;
    this.usuarioService.activarDesactivar(usuario.id, !usuario.activo).subscribe({
      next: (response: ApiResponse<UsuarioResponse>) => {
        if (response.success) {
          this.cargarUsuarios();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || `Error al ${accion} el usuario`;
        this.cargando = false;
        console.error(`Error al ${accion} usuario:`, err);
      }
    });
  }

  bloquearDesbloquear(usuario: UsuarioResponse): void {
    const accion = usuario.cuentaBloqueada ? 'desbloquear' : 'bloquear';
    if (!confirm(`¿Está seguro de ${accion} la cuenta del usuario "${usuario.nombreCompleto}"?`)) {
      return;
    }

    this.cargando = true;
    this.error = null;
    const operacion = usuario.cuentaBloqueada
      ? this.usuarioService.desbloquearCuenta(usuario.id)
      : this.usuarioService.bloquearCuenta(usuario.id);

    operacion.subscribe({
      next: (response: ApiResponse<void>) => {
        if (response.success) {
          this.cargarUsuarios();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || `Error al ${accion} la cuenta`;
        this.cargando = false;
        console.error(`Error al ${accion} cuenta:`, err);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.formulario.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  getRolesNombres(roles: RolResponse[]): string {
    return roles.map(r => r.nombre).join(', ');
  }

  toggleRol(rolId: number): void {
    const rolesIds = this.formulario.get('rolesIds')?.value || [];
    const index = rolesIds.indexOf(rolId);
    
    if (index > -1) {
      rolesIds.splice(index, 1);
    } else {
      rolesIds.push(rolId);
    }
    
    this.formulario.patchValue({ rolesIds });
  }

  tieneRolTrabajadorSeleccionado(): boolean {
    const rolesIds: number[] = this.formulario.get('rolesIds')?.value || [];
    const rolTrabajador = this.rolesDisponibles.find(r => r.codigo === 'TRABAJADOR');
    return !!rolTrabajador && rolesIds.includes(rolTrabajador.id);
  }
}
