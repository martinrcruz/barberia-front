import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ServicioService } from '@core/services/servicio.service';
import { SucursalService } from '@core/services/sucursal.service';
import { ServicioResponse, ServicioRequest } from '@core/models/servicio.model';
import { SucursalResponse } from '@core/models/sucursal.model';
import { ApiResponse } from '@core/models/api-response.model';

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './servicios-list.component.html',
  styleUrls: ['./servicios-list.component.scss']
})
export class ServiciosListComponent implements OnInit {
  private readonly servicioService = inject(ServicioService);
  private readonly sucursalService = inject(SucursalService);
  private readonly fb = inject(FormBuilder);

  servicios: ServicioResponse[] = [];
  sucursales: SucursalResponse[] = [];
  servicioSeleccionado: ServicioResponse | null = null;
  mostrarFormulario = false;
  modoEdicion = false;
  cargando = false;
  error: string | null = null;
  filtroSucursal: number | null = null;

  formulario: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(50)]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: [''],
    categoriaId: [null],
    precio: [0, [Validators.required, Validators.min(0)]],
    duracionMinutos: [0, [Validators.min(0)]],
    tieneIva: [true],
    sucursalId: [null, [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarSucursales();
    this.cargarServicios();
  }

  cargarSucursales(): void {
    this.sucursalService.listarTodasSinPaginacion().subscribe({
      next: (response: ApiResponse<SucursalResponse[]>) => {
        if (response.success && response.data) {
          this.sucursales = response.data;
        }
      },
      error: (err: any) => {
        console.error('Error al cargar sucursales:', err);
      }
    });
  }

  cargarServicios(): void {
    this.cargando = true;
    this.error = null;
    
    const operacion: Observable<ApiResponse<ServicioResponse[] | any>> = this.filtroSucursal
      ? this.servicioService.listarPorSucursalSinPaginacion(this.filtroSucursal)
      : this.servicioService.listarTodos(0, 1000) as Observable<ApiResponse<any>>;

    operacion.subscribe({
      next: (response: ApiResponse<ServicioResponse[] | any>) => {
        if (response.success) {
          this.servicios = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.content || []);
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar los servicios';
        this.cargando = false;
        console.error('Error al cargar servicios:', err);
      }
    });
  }

  abrirFormularioCrear(): void {
    this.modoEdicion = false;
    this.servicioSeleccionado = null;
    this.formulario.reset({
      precio: 0,
      duracionMinutos: 0,
      tieneIva: true,
      sucursalId: this.filtroSucursal
    });
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(servicio: ServicioResponse): void {
    this.modoEdicion = true;
    this.servicioSeleccionado = servicio;
    this.formulario.patchValue({
      codigo: servicio.codigo,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      categoriaId: servicio.categoria?.id || null,
      precio: servicio.precio,
      duracionMinutos: servicio.duracionMinutos || 0,
      tieneIva: servicio.tieneIva !== false,
      sucursalId: servicio.sucursal?.id || null
    });
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formulario.reset();
    this.servicioSeleccionado = null;
    this.error = null;
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = null;
    const request: ServicioRequest = this.formulario.value;

    const operacion = this.modoEdicion && this.servicioSeleccionado
      ? this.servicioService.actualizar(this.servicioSeleccionado.id, request)
      : this.servicioService.crear(request);

    operacion.subscribe({
      next: (response: ApiResponse<ServicioResponse>) => {
        if (response.success) {
          this.cerrarFormulario();
          this.cargarServicios();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al guardar el servicio';
        this.cargando = false;
        console.error('Error al guardar servicio:', err);
      }
    });
  }

  eliminar(servicio: ServicioResponse): void {
    if (!confirm(`¿Está seguro de eliminar el servicio "${servicio.nombre}"?`)) {
      return;
    }

    this.cargando = true;
    this.error = null;
    this.servicioService.eliminar(servicio.id).subscribe({
      next: (response: ApiResponse<void>) => {
        if (response.success) {
          this.cargarServicios();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al eliminar el servicio';
        this.cargando = false;
        console.error('Error al eliminar servicio:', err);
      }
    });
  }

  filtrarPorSucursal(): void {
    this.cargarServicios();
  }

  limpiarFiltro(): void {
    this.filtroSucursal = null;
    this.cargarServicios();
  }

  getFieldError(fieldName: string): string {
    const field = this.formulario.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `El valor debe ser mayor o igual a ${field.errors['min'].min}`;
    }
    return '';
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio);
  }

  formatearDuracion(minutos: number): string {
    if (!minutos || minutos === 0) return '-';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) {
      return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
    }
    return `${mins}m`;
  }
}

