import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SucursalService } from '@core/services/sucursal.service';
import { SucursalResponse, SucursalRequest } from '@core/models/sucursal.model';
import { ApiResponse } from '@core/models/api-response.model';

@Component({
  selector: 'app-sucursales-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sucursales-list.component.html',
  styleUrls: ['./sucursales-list.component.scss']
})
export class SucursalesListComponent implements OnInit {
  private readonly sucursalService = inject(SucursalService);
  private readonly fb = inject(FormBuilder);

  sucursales: SucursalResponse[] = [];
  sucursalSeleccionada: SucursalResponse | null = null;
  mostrarFormulario = false;
  modoEdicion = false;
  cargando = false;
  error: string | null = null;

  formulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    direccion: ['', [Validators.required, Validators.maxLength(255)]],
    telefono: ['', [Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(100)]],
    horarioApertura: ['', [Validators.maxLength(10)]],
    horarioCierre: ['', [Validators.maxLength(10)]],
    diasAtencion: ['', [Validators.maxLength(100)]],
    administradorId: [null],
    comisionDefecto: [0, [Validators.min(0)]]
  });

  ngOnInit(): void {
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.cargando = true;
    this.error = null;
    this.sucursalService.listarTodasSinPaginacion().subscribe({
      next: (response: ApiResponse<SucursalResponse[]>) => {
        if (response.success && response.data) {
          this.sucursales = response.data;
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar las sucursales';
        this.cargando = false;
        console.error('Error al cargar sucursales:', err);
      }
    });
  }

  abrirFormularioCrear(): void {
    this.modoEdicion = false;
    this.sucursalSeleccionada = null;
    this.formulario.reset();
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(sucursal: SucursalResponse): void {
    this.modoEdicion = true;
    this.sucursalSeleccionada = sucursal;
    this.formulario.patchValue({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      telefono: sucursal.telefono || '',
      email: sucursal.email || '',
      horarioApertura: sucursal.horarioApertura || '',
      horarioCierre: sucursal.horarioCierre || '',
      diasAtencion: sucursal.diasAtencion || '',
      administradorId: sucursal.administrador?.id || null,
      comisionDefecto: sucursal.comisionDefecto || 0
    });
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formulario.reset();
    this.sucursalSeleccionada = null;
    this.error = null;
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = null;
    const request: SucursalRequest = this.formulario.value;

    const operacion = this.modoEdicion && this.sucursalSeleccionada
      ? this.sucursalService.actualizar(this.sucursalSeleccionada.id, request)
      : this.sucursalService.crear(request);

    operacion.subscribe({
      next: (response: ApiResponse<SucursalResponse>) => {
        if (response.success) {
          this.cerrarFormulario();
          this.cargarSucursales();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al guardar la sucursal';
        this.cargando = false;
        console.error('Error al guardar sucursal:', err);
      }
    });
  }

  eliminar(sucursal: SucursalResponse): void {
    if (!confirm(`¿Está seguro de eliminar la sucursal "${sucursal.nombre}"?`)) {
      return;
    }

    this.cargando = true;
    this.error = null;
    this.sucursalService.eliminar(sucursal.id).subscribe({
      next: (response: ApiResponse<void>) => {
        if (response.success) {
          this.cargarSucursales();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al eliminar la sucursal';
        this.cargando = false;
        console.error('Error al eliminar sucursal:', err);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.formulario.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `El valor debe ser mayor o igual a ${field.errors['min'].min}`;
    }
    return '';
  }
}
