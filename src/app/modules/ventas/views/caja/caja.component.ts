import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { VentaService } from '@core/services/venta.service';
import { ProductoService } from '@core/services/producto.service';
import { ServicioService } from '@core/services/servicio.service';
import { SucursalService } from '@core/services/sucursal.service';
import { UsuarioService } from '@core/services/usuario.service';
import { ClienteService } from '@core/services/cliente.service';
import { MetodoPagoService } from '@core/services/metodo-pago.service';
import { VentaRequest } from '@core/models/venta.model';
import { ProductoResponse } from '@core/models/producto.model';
import { ServicioResponse } from '@core/models/servicio.model';
import { SucursalResponse } from '@core/models/sucursal.model';
import { UsuarioResponse } from '@core/models/usuario.model';
import { ClienteResponse, ClienteRequest } from '@core/models/cliente.model';
import { MetodoPagoResponse } from '@core/models/metodo-pago.model';
import { ApiResponse } from '@core/models/api-response.model';

interface MetodoPagoOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.scss']
})
export class CajaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly productoService = inject(ProductoService);
  private readonly servicioService = inject(ServicioService);
  private readonly sucursalService = inject(SucursalService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly clienteService = inject(ClienteService);
  private readonly metodoPagoService = inject(MetodoPagoService);

  formulario: FormGroup = this.fb.group({
    sucursalId: [null, Validators.required],
    trabajadorId: [null, Validators.required],
    clienteId: [null],
    metodoPago: [null, Validators.required],
    incluyeIva: [true],
    observaciones: [''],
    detalles: this.fb.array([])
  });

  sucursales: SucursalResponse[] = [];
  trabajadores: UsuarioResponse[] = [];
  productos: ProductoResponse[] = [];
  servicios: ServicioResponse[] = [];
  clientes: ClienteResponse[] = [];

  metodosPago: MetodoPagoOption[] = [];

  cargando = false;
  guardando = false;
  error: string | null = null;
  mensaje: string | null = null;

  // Modal de cliente
  mostrarModalCliente = false;
  guardandoCliente = false;
  errorCliente: string | null = null;
  formularioCliente: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(200)]],
    rut: ['', [Validators.maxLength(12)]],
    email: ['', [Validators.email, Validators.maxLength(100)]],
    telefono: ['', [Validators.maxLength(20)]],
    direccion: ['', [Validators.maxLength(255)]],
    observaciones: ['']
  });

  ivaPorcentaje = 0.19; // se podría obtener desde configuración más adelante

  ngOnInit(): void {
    this.cargarSucursales();
    this.cargarMetodosPago();
    this.cargarClientes();
    this.agregarDetalle();

    // Recalcular totales cuando cambian los detalles o la opción de IVA
    this.formulario.get('incluyeIva')?.valueChanges.subscribe(() => this.calcularTotales());
    this.detalles.valueChanges.subscribe(() => this.calcularTotales());
  }

  get detalles(): FormArray {
    return this.formulario.get('detalles') as FormArray;
  }

  crearDetalle(): FormGroup {
    return this.fb.group({
      tipoItem: ['PRODUCTO', Validators.required],
      productoId: [null],
      servicioId: [null],
      descripcion: [''],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      aplicaIva: [true]
    });
  }

  agregarDetalle(): void {
    this.detalles.push(this.crearDetalle());
  }

  eliminarDetalle(index: number): void {
    if (this.detalles.length === 1) {
      return;
    }
    this.detalles.removeAt(index);
    this.calcularTotales();
  }

  onSucursalChange(): void {
    const sucursalId = this.formulario.get('sucursalId')?.value;
    console.log('[CajaComponent] onSucursalChange llamado con sucursalId:', sucursalId);
    if (!sucursalId) {
      this.productos = [];
      this.servicios = [];
      this.trabajadores = [];
      return;
    }

    // Cargar productos asociados a la sucursal
    this.productoService.listarPorSucursalSinPaginacion(sucursalId).subscribe({
      next: (res: ApiResponse<ProductoResponse[]>) => {
        if (res.success && res.data) {
          this.productos = res.data;
        }
      }
    });

    // Cargar servicios asociados a la sucursal
    this.servicioService.listarPorSucursalSinPaginacion(sucursalId).subscribe({
      next: (res: ApiResponse<ServicioResponse[]>) => {
        console.log('[CajaComponent] Servicios cargados:', res);
        if (res.success && res.data) {
          this.servicios = Array.isArray(res.data) ? res.data : [];
          console.log('[CajaComponent] Servicios asignados:', this.servicios);
        } else {
          console.warn('[CajaComponent] Respuesta sin éxito o sin datos:', res);
          this.servicios = [];
        }
      },
      error: (err: any) => {
        console.error('[CajaComponent] Error al cargar servicios:', err);
        this.servicios = [];
        this.error = 'Error al cargar los servicios disponibles';
      }
    });

    // Cargar usuarios con rol TRABAJADOR (actualmente no se filtra por sucursal)
    this.usuarioService.listarTodasSinPaginacion().subscribe({
      next: (res: ApiResponse<UsuarioResponse[]>) => {
        if (res.success && res.data) {
          this.trabajadores = res.data.filter(u =>
            u.roles?.some(rol => rol.codigo === 'TRABAJADOR')
          );
        }
      }
    });
  }

  cargarClientes(): void {
    this.clienteService.listarTodos(0, 1000).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.clientes = Array.isArray(res.data)
            ? res.data
            : (res.data?.content || []);
        }
      }
    });
  }

  cargarMetodosPago(): void {
    this.metodoPagoService.listarActivosOrdenados().subscribe({
      next: (res: ApiResponse<MetodoPagoResponse[]>) => {
        if (res.success && res.data && res.data.length > 0) {
          this.metodosPago = res.data.map((mp) => ({
            value: mp.codigo,
            label: mp.nombre
          }));
          
          // Establecer el primer método de pago como valor por defecto si no hay uno seleccionado
          const metodoPagoActual = this.formulario.get('metodoPago')?.value;
          if (!metodoPagoActual && this.metodosPago.length > 0) {
            this.formulario.patchValue({ metodoPago: this.metodosPago[0].value });
          }
        } else {
          console.warn('[CajaComponent] No se encontraron métodos de pago activos en la base de datos');
          this.error = 'No hay métodos de pago disponibles. Por favor, configure métodos de pago en el sistema.';
        }
      },
      error: (err) => {
        console.error('[CajaComponent] Error al cargar métodos de pago:', err);
        this.error = 'Error al cargar los métodos de pago. Por favor, intente nuevamente.';
      }
    });
  }

  onProductoChange(index: number): void {
    const detalle = this.detalles.at(index);
    const productoId = detalle.get('productoId')?.value;
    if (!productoId) {
      return;
    }
    const prod = this.productos.find(p => p.id === productoId);
    if (prod) {
      detalle.patchValue({
        servicioId: null, // Limpiar servicio si se selecciona producto
        descripcion: prod.nombre,
        precioUnitario: prod.precioVenta,
        aplicaIva: prod.tieneIva
      }, { emitEvent: false });
      this.calcularTotales();
    }
  }

  onServicioChange(index: number): void {
    const detalle = this.detalles.at(index);
    const servicioId = detalle.get('servicioId')?.value;
    if (!servicioId) {
      return;
    }
    const serv = this.servicios.find(s => s.id === servicioId);
    if (serv) {
      detalle.patchValue({
        productoId: null, // Limpiar producto si se selecciona servicio
        descripcion: serv.nombre,
        precioUnitario: serv.precio,
        aplicaIva: serv.tieneIva
      }, { emitEvent: false });
      this.calcularTotales();
    }
  }

  onTipoItemChange(index: number): void {
    const detalle = this.detalles.at(index);
    const tipoItem = detalle.get('tipoItem')?.value;
    
    // Limpiar campos cuando cambia el tipo
    if (tipoItem === 'PRODUCTO') {
      detalle.patchValue({
        servicioId: null,
        descripcion: '',
        precioUnitario: 0,
        aplicaIva: true
      }, { emitEvent: false });
    } else if (tipoItem === 'SERVICIO') {
      detalle.patchValue({
        productoId: null,
        descripcion: '',
        precioUnitario: 0,
        aplicaIva: true
      }, { emitEvent: false });
    }
  }

  calcularTotales(): void {
    const incluyeIva = this.formulario.get('incluyeIva')?.value;
    let subtotal = 0;
    let iva = 0;

    this.detalles.controls.forEach(detalleCtrl => {
      const cantidad = detalleCtrl.get('cantidad')?.value || 0;
      const precioUnitario = detalleCtrl.get('precioUnitario')?.value || 0;
      const aplicaIva = detalleCtrl.get('aplicaIva')?.value;
      const lineaSubtotal = cantidad * precioUnitario;
      subtotal += lineaSubtotal;
      if (incluyeIva && aplicaIva) {
        iva += lineaSubtotal * this.ivaPorcentaje;
      }
    });

    (this.formulario as any).subtotalCalculado = subtotal;
    (this.formulario as any).ivaCalculado = iva;
    (this.formulario as any).totalCalculado = subtotal + iva;
  }

  get subtotalCalculado(): number {
    return (this.formulario as any).subtotalCalculado || 0;
  }

  get ivaCalculado(): number {
    return (this.formulario as any).ivaCalculado || 0;
  }

  get totalCalculado(): number {
    return (this.formulario as any).totalCalculado || 0;
  }

  cargarSucursales(): void {
    this.sucursalService.listarTodasSinPaginacion().subscribe({
      next: (res: ApiResponse<SucursalResponse[]>) => {
        if (res.success && res.data) {
          this.sucursales = res.data;
        }
      },
      error: () => {
        this.error = 'Error al cargar sucursales';
      }
    });
  }

  formatearPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor || 0);
  }

  limpiarFormulario(): void {
    const sucursalId = this.formulario.get('sucursalId')?.value;
    const metodoPagoDefault = this.metodosPago.length > 0 ? this.metodosPago[0].value : null;
    this.formulario.reset({
      sucursalId,
      trabajadorId: null,
      clienteId: null,
      metodoPago: metodoPagoDefault,
      incluyeIva: true,
      observaciones: ''
    });
    this.detalles.clear();
    this.agregarDetalle();
    this.calcularTotales();
    this.error = null;
    this.mensaje = null;
  }

  guardarVenta(): void {
    console.log('[CajaComponent] Intentando guardar venta. Form value:', this.formulario.value);

    if (this.formulario.invalid || this.detalles.length === 0) {
      this.formulario.markAllAsTouched();
      this.error = 'Por favor completa los campos obligatorios (Sucursal, Trabajador y al menos un ítem con cantidad y precio).';
      this.mensaje = null;
      console.warn('[CajaComponent] Formulario inválido o sin detalles, no se envía la venta.');
      return;
    }

    this.guardando = true;
    this.error = null;
    this.mensaje = null;

    const value = this.formulario.value;

    const request: VentaRequest = {
      trabajadorId: value.trabajadorId,
      clienteId: value.clienteId,
      sucursalId: value.sucursalId,
      metodoPago: value.metodoPago,
      detalles: value.detalles.map((d: any) => ({
        tipoItem: d.tipoItem,
        productoId: d.tipoItem === 'PRODUCTO' ? d.productoId : null,
        servicioId: d.tipoItem === 'SERVICIO' ? d.servicioId : null,
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        aplicaIva: d.aplicaIva
      })),
      observaciones: value.observaciones
    };

    console.log('[CajaComponent] Enviando request de venta:', request);

    this.ventaService.crearVenta(request).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.mensaje = 'Venta registrada correctamente';
          console.log('[CajaComponent] Venta registrada correctamente:', res.data);
          this.limpiarFormulario();
        }
        this.guardando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al registrar la venta';
        console.error('[CajaComponent] Error al registrar la venta:', err);
        this.guardando = false;
      }
    });
  }

  // Métodos para el modal de cliente
  abrirModalCliente(): void {
    this.formularioCliente.reset();
    this.errorCliente = null;
    this.mostrarModalCliente = true;
  }

  cerrarModalCliente(): void {
    this.mostrarModalCliente = false;
    this.formularioCliente.reset();
    this.errorCliente = null;
  }

  guardarCliente(): void {
    if (this.formularioCliente.invalid) {
      this.formularioCliente.markAllAsTouched();
      return;
    }

    this.guardandoCliente = true;
    this.errorCliente = null;
    const request: ClienteRequest = this.formularioCliente.value;

    this.clienteService.crear(request).subscribe({
      next: (response: ApiResponse<ClienteResponse>) => {
        if (response.success && response.data) {
          // Recargar lista de clientes
          this.cargarClientes();
          // Seleccionar el cliente recién creado
          this.formulario.patchValue({ clienteId: response.data.id });
          // Cerrar modal
          this.cerrarModalCliente();
        }
        this.guardandoCliente = false;
      },
      error: (err: any) => {
        this.errorCliente = err.error?.message || 'Error al guardar el cliente';
        this.guardandoCliente = false;
        console.error('Error al guardar cliente:', err);
      }
    });
  }

  getFieldErrorCliente(fieldName: string): string {
    const field = this.formularioCliente.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['email']) return `Formato de email inválido`;
    }
    return '';
  }
}


