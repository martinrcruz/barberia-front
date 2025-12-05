import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '@core/services/venta.service';  
import { SucursalService } from '@core/services/sucursal.service';
import { ClienteService } from '@core/services/cliente.service';
import { VentaResponse } from '@core/models/venta.model';
import { SucursalResponse } from '@core/models/sucursal.model';
import { ClienteResponse } from '@core/models/cliente.model';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas-list.component.html',
  styleUrls: ['./ventas-list.component.scss']
})
export class VentasListComponent implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly sucursalService = inject(SucursalService);
  private readonly clienteService = inject(ClienteService);

  ventas: VentaResponse[] = [];
  ventasFiltradas: VentaResponse[] = [];
  sucursales: SucursalResponse[] = [];
  clientes: ClienteResponse[] = [];
  ventaSeleccionada: VentaResponse | null = null;
  clienteSeleccionado: ClienteResponse | null = null;
  mostrarDetalle = false;
  cargando = false;
  error: string | null = null;
  filtroSucursal: number | null = null;
  filtroCliente: number | null = null;

  ngOnInit(): void {
    this.cargarSucursales();
    this.cargarClientes();
    this.cargarVentas();
  }

  cargarSucursales(): void {
    this.sucursalService.listarTodasSinPaginacion().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.sucursales = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar sucursales:', err);
      }
    });
  }

  cargarClientes(): void {
    this.clienteService.listarTodosSinPaginacion().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clientes = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      }
    });
  }

  cargarVentas(): void {
    this.cargando = true;
    this.error = null;
    
    const operacion:any = this.filtroSucursal
      ? this.ventaService.listarVentasPorSucursal(this.filtroSucursal)
      : this.ventaService.listarVentas(0, 1000);

    operacion.subscribe({
      next: (response: any) => {
        if (response.success) {
          this.ventas = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.content || []);
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar las ventas';
        this.cargando = false;
        console.error('Error al cargar ventas:', err);
      }
    });
  }

  aplicarFiltros(): void {
    this.ventasFiltradas = [...this.ventas];
    
    // Filtrar por cliente si está seleccionado
    if (this.filtroCliente) {
      this.ventasFiltradas = this.ventasFiltradas.filter(venta => {
        // Buscar el cliente en la venta por nombre o ID
        const cliente = this.clientes.find(c => c.id === this.filtroCliente);
        if (cliente) {
          return venta.clienteNombre === cliente.nombreCompleto;
        }
        return false;
      });
    }
  }

  verDetalle(venta: VentaResponse): void {
    this.ventaSeleccionada = venta;
    // Buscar el cliente completo si existe
    if (venta.clienteNombre) {
      this.clienteSeleccionado = this.clientes.find(c => c.nombreCompleto === venta.clienteNombre) || null;
    } else {
      this.clienteSeleccionado = null;
    }
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.ventaSeleccionada = null;
  }

  anularVenta(venta: VentaResponse): void {
    if (!confirm(`¿Está seguro de anular la venta "${venta.numeroVenta}"?`)) {
      return;
    }

    this.cargando = true;
    this.error = null;
    this.ventaService.anularVenta(venta.id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.cargarVentas();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al anular la venta';
        this.cargando = false;
        console.error('Error al anular venta:', err);
      }
    });
  }

  descargarComprobante(venta: VentaResponse): void {
    this.cargando = true;
    this.ventaService.generarComprobante(venta.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `comprobante-${venta.numeroVenta}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al generar el comprobante';
        this.cargando = false;
        console.error('Error al generar comprobante:', err);
      }
    });
  }

  filtrarPorSucursal(): void {
    this.cargarVentas();
  }

  filtrarPorCliente(): void {
    this.aplicarFiltros();
  }

  limpiarFiltro(): void {
    this.filtroSucursal = null;
    this.filtroCliente = null;
    this.cargarVentas();
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CL');
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio);
  }
}
