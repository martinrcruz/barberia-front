import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContabilidadService } from '@core/services/contabilidad.service';
import { RegistroContableResponse, ResumenContableResponse } from '@core/models/contabilidad.model';
import { SucursalService } from '@core/services/sucursal.service';
import { SucursalResponse } from '@core/models/sucursal.model';
import { ApiResponse } from '@core/models/api-response.model';

@Component({
  selector: 'app-contabilidad-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contabilidad-dashboard.component.html',
  styleUrls: ['./contabilidad-dashboard.component.scss'],
})
export class ContabilidadDashboardComponent implements OnInit {
  private readonly contabilidadService = inject(ContabilidadService);
  private readonly sucursalService = inject(SucursalService);

  sucursales: SucursalResponse[] = [];
  sucursalSeleccionada: number | null = null;
  fechaInicio?: string;
  fechaFin?: string;

  resumen: ResumenContableResponse | null = null;
  registros: RegistroContableResponse[] = [];

  cargando = false;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.sucursalService.listarTodasSinPaginacion().subscribe({
      next: (response: ApiResponse<SucursalResponse[]>) => {
        if (response.success && response.data) {
          this.sucursales = response.data;
          if (this.sucursales.length > 0) {
            this.sucursalSeleccionada = this.sucursales[0].id;
            this.cargarDatos();
          }
        }
      },
      error: () => {
        this.error = 'Error al cargar sucursales';
      }
    });
  }

  cargarDatos(): void {
    if (!this.sucursalSeleccionada) {
      return;
    }

    this.cargando = true;
    this.error = null;

    const sucursalId = this.sucursalSeleccionada;

    this.contabilidadService.obtenerResumen(sucursalId, this.fechaInicio, this.fechaFin).subscribe({
      next: (res: ApiResponse<ResumenContableResponse>) => {
        if (res.success && res.data) {
          this.resumen = res.data;
        }
      },
      error: () => {
        this.error = 'Error al cargar el resumen contable';
        this.cargando = false;
      }
    });

    this.contabilidadService.listarRegistros(sucursalId, this.fechaInicio, this.fechaFin).subscribe({
      next: (res: ApiResponse<RegistroContableResponse[]>) => {
        if (res.success && res.data) {
          this.registros = res.data;
        }
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los registros contables';
        this.cargando = false;
      }
    });
  }

  limpiarFechas(): void {
    this.fechaInicio = undefined;
    this.fechaFin = undefined;
    this.cargarDatos();
  }

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
  }

  exportarPDF(): void {
    if (!this.sucursalSeleccionada) {
      this.error = 'Debe seleccionar una sucursal';
      return;
    }

    this.cargando = true;
    this.error = null;

    this.contabilidadService.exportarPDF(
      this.sucursalSeleccionada,
      this.fechaInicio,
      this.fechaFin
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const fechaActual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const nombreSucursal = this.sucursales.find(s => s.id === this.sucursalSeleccionada)?.nombre || 'Contabilidad';
        link.download = `Contabilidad_${nombreSucursal.replace(/\s+/g, '_')}_${fechaActual}.pdf`;
        
        link.click();
        window.URL.revokeObjectURL(url);
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al generar el PDF';
        this.cargando = false;
        console.error('Error al exportar PDF:', err);
      }
    });
  }

  exportarExcel(): void {
    if (!this.sucursalSeleccionada) {
      this.error = 'Debe seleccionar una sucursal';
      return;
    }

    this.cargando = true;
    this.error = null;

    this.contabilidadService.exportarExcel(
      this.sucursalSeleccionada,
      this.fechaInicio,
      this.fechaFin
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const fechaActual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const nombreSucursal = this.sucursales.find(s => s.id === this.sucursalSeleccionada)?.nombre || 'Contabilidad';
        link.download = `Contabilidad_${nombreSucursal.replace(/\s+/g, '_')}_${fechaActual}.xlsx`;
        
        link.click();
        window.URL.revokeObjectURL(url);
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al generar el Excel';
        this.cargando = false;
        console.error('Error al exportar Excel:', err);
      }
    });
  }
}


