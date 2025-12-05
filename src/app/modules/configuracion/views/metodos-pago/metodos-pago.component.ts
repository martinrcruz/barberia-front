import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetodoPagoService } from '@core/services/metodo-pago.service';
import { MetodoPagoRequest, MetodoPagoResponse, TipoMetodoPago } from '@core/models/metodo-pago.model';
import { ApiResponse } from '@core/models/api-response.model';
import { Page } from '@core/models/page.model';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-metodos-pago',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './metodos-pago.component.html',
  styleUrls: ['./metodos-pago.component.scss'],
})
export class MetodosPagoComponent implements OnInit {
  private readonly metodoPagoService = inject(MetodoPagoService);
  private readonly fb = inject(FormBuilder);

  @ViewChild('formModal') formModal!: ModalComponent;

  metodosPago: MetodoPagoResponse[] = [];
  metodoEditando: MetodoPagoResponse | null = null;
  loading = false;
  guardando = false;
  error: string | null = null;
  mensaje: string | null = null;

  totalRecords = 0;
  currentPage = 0;
  pageSize = 10;

  formulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    codigo: ['', [Validators.required, Validators.maxLength(50)]],
    descripcion: ['', [Validators.maxLength(255)]],
    tipoMetodo: [TipoMetodoPago.EFECTIVO, Validators.required],
    esElectronico: [false],
    requiereReferencia: [false],
    orden: [0, [Validators.min(0)]],
    icono: ['', [Validators.maxLength(50)]],
  });

  tiposMetodoPago = Object.values(TipoMetodoPago);

  tableColumns: TableColumn[] = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'nombre', header: 'Nombre', sortable: true },
    { field: 'codigo', header: 'Código', sortable: true },
    { field: 'tipoMetodoLabel', header: 'Tipo', sortable: true },
    { field: 'orden', header: 'Orden', sortable: true },
    { field: 'estadoLabel', header: 'Estado', sortable: true },
    { field: 'esElectronicoLabel', header: 'Electrónico', sortable: true }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'pencil',
      label: 'Editar',
      color: 'primary',
      handler: (row: MetodoPagoResponse) => this.editar(row)
    },
    {
      icon: 'check-circle',
      label: 'Activar/Desactivar',
      color: 'info',
      handler: (row: MetodoPagoResponse) => this.toggleActivo(row)
    },
    {
      icon: 'trash',
      label: 'Eliminar',
      color: 'danger',
      handler: (row: MetodoPagoResponse) => this.eliminar(row)
    }
  ];

  ngOnInit(): void {
    this.cargarMetodosPago();
  }

  cargarMetodosPago(): void {
    this.loading = true;
    this.error = null;

    this.metodoPagoService.listarTodos(this.currentPage, this.pageSize).subscribe({
      next: (res: ApiResponse<Page<MetodoPagoResponse>>) => {
        if (res.success && res.data) {
          // Formatear datos para la tabla
          this.metodosPago = res.data.content.map(metodo => ({
            ...metodo,
            tipoMetodoLabel: this.getTipoMetodoLabel(metodo.tipoMetodo),
            estadoLabel: this.getEstadoLabel(metodo.activo),
            esElectronicoLabel: metodo.esElectronico ? 'Sí' : 'No'
          }));
          this.totalRecords = res.data.totalElements;
        } else {
          this.metodosPago = [];
          this.totalRecords = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar métodos de pago:', error);
        this.error = error.error?.message || 'Error al cargar los métodos de pago';
        this.loading = false;
        this.metodosPago = [];
      }
    });
  }

  nuevo(): void {
    this.metodoEditando = null;
    this.formulario.reset({
      tipoMetodo: TipoMetodoPago.EFECTIVO,
      esElectronico: false,
      requiereReferencia: false,
      orden: 0
    });
    this.formModal.open();
  }

  editar(metodo: MetodoPagoResponse): void {
    this.metodoEditando = metodo;
    this.formulario.patchValue({
      nombre: metodo.nombre,
      codigo: metodo.codigo,
      descripcion: metodo.descripcion || '',
      tipoMetodo: metodo.tipoMetodo,
      esElectronico: metodo.esElectronico,
      requiereReferencia: metodo.requiereReferencia,
      orden: metodo.orden,
      icono: metodo.icono || ''
    });
    this.formModal.open();
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.error = null;
    this.mensaje = null;

    const raw = this.formulario.value;
    const request: MetodoPagoRequest = {
      nombre: raw.nombre,
      codigo: raw.codigo,
      descripcion: raw.descripcion || undefined,
      tipoMetodo: raw.tipoMetodo,
      esElectronico: raw.esElectronico || false,
      requiereReferencia: raw.requiereReferencia || false,
      orden: raw.orden || 0,
      icono: raw.icono || undefined
    };

    const operacion = this.metodoEditando
      ? this.metodoPagoService.actualizar(this.metodoEditando.id, request)
      : this.metodoPagoService.crear(request);

    operacion.subscribe({
      next: (res) => {
        this.guardando = false;
        this.mensaje = res.message || (this.metodoEditando ? 'Método de pago actualizado exitosamente' : 'Método de pago creado exitosamente');
        this.metodoEditando = null;
        this.formulario.reset();
        this.formModal.closeModal();
        this.cargarMetodosPago();
        setTimeout(() => {
          this.mensaje = null;
        }, 3000);
      },
      error: (error) => {
        console.error('Error al guardar método de pago:', error);
        this.error = error.error?.message || 'Error al guardar el método de pago';
        this.guardando = false;
      }
    });
  }

  eliminar(metodo: MetodoPagoResponse): void {
    if (!confirm(`¿Está seguro de eliminar el método de pago "${metodo.nombre}"?`)) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.metodoPagoService.eliminar(metodo.id).subscribe({
      next: () => {
        this.loading = false;
        this.mensaje = 'Método de pago eliminado exitosamente';
        this.cargarMetodosPago();
        setTimeout(() => {
          this.mensaje = null;
        }, 3000);
      },
      error: (error) => {
        console.error('Error al eliminar método de pago:', error);
        this.error = error.error?.message || 'Error al eliminar el método de pago';
        this.loading = false;
      }
    });
  }

  toggleActivo(metodo: MetodoPagoResponse): void {
    const nuevoEstado = !metodo.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    if (!confirm(`¿Está seguro de ${accion} el método de pago "${metodo.nombre}"?`)) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.metodoPagoService.activarDesactivar(metodo.id, nuevoEstado).subscribe({
      next: () => {
        this.loading = false;
        this.mensaje = `Método de pago ${accion}do exitosamente`;
        this.cargarMetodosPago();
        setTimeout(() => {
          this.mensaje = null;
        }, 3000);
      },
      error: (error) => {
        console.error(`Error al ${accion} método de pago:`, error);
        this.error = error.error?.message || `Error al ${accion} el método de pago`;
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.cargarMetodosPago();
  }

  getTipoMetodoLabel(tipo: TipoMetodoPago): string {
    const labels: { [key: string]: string } = {
      'EFECTIVO': 'Efectivo',
      'TARJETA_DEBITO': 'Tarjeta Débito',
      'TARJETA_CREDITO': 'Tarjeta Crédito',
      'TRANSFERENCIA': 'Transferencia',
      'CHEQUE': 'Cheque',
      'OTRO': 'Otro'
    };
    return labels[tipo] || tipo;
  }

  getEstadoLabel(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}
