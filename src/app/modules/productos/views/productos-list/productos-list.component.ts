import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProductoService } from '@core/services/producto.service';
import { SucursalService } from '@core/services/sucursal.service';
import { ProductoResponse, ProductoRequest } from '@core/models/producto.model';
import { SucursalResponse } from '@core/models/sucursal.model';
import { ApiResponse } from '@core/models/api-response.model';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './productos-list.component.html',
  styleUrls: ['./productos-list.component.scss']
})
export class ProductosListComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly sucursalService = inject(SucursalService);
  private readonly fb = inject(FormBuilder);

  productos: ProductoResponse[] = [];
  sucursales: SucursalResponse[] = [];
  productoSeleccionado: ProductoResponse | null = null;
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
    precioVenta: [0, [Validators.required, Validators.min(0)]],
    precioCosto: [0, [Validators.min(0)]],
    stockActual: [0, [Validators.min(0)]],
    stockMinimo: [0, [Validators.min(0)]],
    tieneIva: [true],
    imagenUrl: [''],
    sucursalId: [null, [Validators.required]],
    unidadMedida: ['', [Validators.maxLength(20)]]
  });

  ngOnInit(): void {
    this.cargarSucursales();
    this.cargarProductos();
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

  cargarProductos(): void {
    this.cargando = true;
    this.error = null;
    
    const operacion: Observable<ApiResponse<ProductoResponse[] | any>> = this.filtroSucursal
      ? this.productoService.listarPorSucursalSinPaginacion(this.filtroSucursal)
      : this.productoService.listarTodos(0, 1000) as Observable<ApiResponse<any>>;

    operacion.subscribe({
      next: (response: ApiResponse<ProductoResponse[] | any>) => {
        if (response.success) {
          this.productos = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.content || []);
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar los productos';
        this.cargando = false;
        console.error('Error al cargar productos:', err);
      }
    });
  }

  abrirFormularioCrear(): void {
    this.modoEdicion = false;
    this.productoSeleccionado = null;
    this.formulario.reset({
      precioVenta: 0,
      precioCosto: 0,
      stockActual: 0,
      stockMinimo: 0,
      tieneIva: true,
      sucursalId: this.filtroSucursal
    });
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(producto: ProductoResponse): void {
    this.modoEdicion = true;
    this.productoSeleccionado = producto;
    this.formulario.patchValue({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoriaId: producto.categoria?.id || null,
      precioVenta: producto.precioVenta,
      precioCosto: producto.precioCosto || 0,
      stockActual: producto.stockActual || 0,
      stockMinimo: producto.stockMinimo || 0,
      tieneIva: producto.tieneIva !== false,
      imagenUrl: producto.imagenUrl || '',
      sucursalId: producto.sucursal?.id || null,
      unidadMedida: producto.unidadMedida || ''
    });
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formulario.reset();
    this.productoSeleccionado = null;
    this.error = null;
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = null;
    const request: ProductoRequest = this.formulario.value;

    const operacion = this.modoEdicion && this.productoSeleccionado
      ? this.productoService.actualizar(this.productoSeleccionado.id, request)
      : this.productoService.crear(request);

    operacion.subscribe({
      next: (response: ApiResponse<ProductoResponse>) => {
        if (response.success) {
          this.cerrarFormulario();
          this.cargarProductos();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al guardar el producto';
        this.cargando = false;
        console.error('Error al guardar producto:', err);
      }
    });
  }

  eliminar(producto: ProductoResponse): void {
    if (!confirm(`¿Está seguro de eliminar el producto "${producto.nombre}"?`)) {
      return;
    }

    this.cargando = true;
    this.error = null;
    this.productoService.eliminar(producto.id).subscribe({
      next: (response: ApiResponse<void>) => {
        if (response.success) {
          this.cargarProductos();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al eliminar el producto';
        this.cargando = false;
        console.error('Error al eliminar producto:', err);
      }
    });
  }

  filtrarPorSucursal(): void {
    this.cargarProductos();
  }

  limpiarFiltro(): void {
    this.filtroSucursal = null;
    this.cargarProductos();
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
}
