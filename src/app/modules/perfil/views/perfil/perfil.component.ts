import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { UsuarioService } from '@core/services/usuario.service';
import { UsuarioEstadisticasResponse } from '@core/models/usuario.model';
import { User } from '@core/models/auth.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly fb = inject(FormBuilder);

  currentUser = this.authService.currentUser;
  editMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  estadisticas = signal<UsuarioEstadisticasResponse | null>(null);
  cargandoEstadisticas = signal(false);

  perfilForm: FormGroup = this.fb.group({
    telefono: [''],
    direccion: [''],
    nacionalidad: [''],
    fotoPerfil: ['']
  });

  nombreCompleto = computed(
    () =>
      `${this.currentUser()?.nombre ?? ''} ${
        this.currentUser()?.apellido ?? ''
      }`.trim()
  );

  esAdmin = computed(() => {
    const user = this.currentUser();
    return user?.roles?.includes('ADMIN') ?? false;
  });

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarEstadisticas();
  }

  cargarDatosUsuario(): void {
    const user = this.currentUser();
    if (user) {
      this.perfilForm.patchValue({
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        nacionalidad: user.nacionalidad || '',
        fotoPerfil: user.fotoPerfil || ''
      });
    }
  }

  cargarEstadisticas(): void {
    const user = this.currentUser();
    if (user?.id) {
      this.cargandoEstadisticas.set(true);
      this.usuarioService.obtenerEstadisticas(user.id).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.estadisticas.set(response.data);
          }
          this.cargandoEstadisticas.set(false);
        },
        error: () => {
          this.cargandoEstadisticas.set(false);
        }
      });
    }
  }

  toggleEditMode(): void {
    this.editMode.set(!this.editMode());
    if (!this.editMode()) {
      this.cargarDatosUsuario();
    }
  }

  guardarPerfil(): void {
    if (this.perfilForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      this.usuarioService.actualizarMiPerfil(this.perfilForm.value).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const currentUser = this.authService.currentUser();
            if (currentUser) {
              // Actualizar el usuario en el servicio de autenticación
              const updatedUser: User = {
                id: currentUser.id,
                email: currentUser.email,
                nombre: currentUser.nombre,
                apellido: currentUser.apellido,
                telefono: response.data.telefono || currentUser.telefono,
                rut: currentUser.rut,
                direccion: response.data.direccion || currentUser.direccion,
                nacionalidad: response.data.nacionalidad || currentUser.nacionalidad,
                fotoPerfil: response.data.fotoPerfil || currentUser.fotoPerfil,
                roles: currentUser.roles,
                permisos: currentUser.permisos
              };
              this.authService.currentUser.set(updatedUser);
              // Actualizar también en localStorage
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            this.editMode.set(false);
            this.error.set(null);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar el perfil');
          this.loading.set(false);
        }
      });
    }
  }

  cancelarEdicion(): void {
    this.editMode.set(false);
    this.cargarDatosUsuario();
    this.error.set(null);
  }

  calcularTiempoAntiguedad(): string {
    const user = this.currentUser();
    if (!user || !user.createdAt) {
      return 'No disponible';
    }

    const fechaCreacion = new Date(user.createdAt);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fechaCreacion.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias < 30) {
      return `${diffDias} días`;
    } else if (diffDias < 365) {
      const meses = Math.floor(diffDias / 30);
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
      const años = Math.floor(diffDias / 365);
      const meses = Math.floor((diffDias % 365) / 30);
      if (meses > 0) {
        return `${años} ${años === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
      }
      return `${años} ${años === 1 ? 'año' : 'años'}`;
    }
  }

  formatearMoneda(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) {
      return '$0';
    }
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(valor);
  }
}
