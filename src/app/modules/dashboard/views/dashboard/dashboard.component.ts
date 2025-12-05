import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { VentaService } from '../../../../core/services/venta.service';
import { VentaResponse } from '../../../../core/models/venta.model';

interface DashboardStat {
  icon: string;
  title: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  color: string;
}

interface RecentSaleItem {
  id: string;
  worker: string;
  amount: number;
  date: string;
}

interface TopProductItem {
  name: string;
  quantity: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly ventaService = inject(VentaService);
  
  currentUser = this.authService.currentUser;

  stats: DashboardStat[] = [];
  recentSales: RecentSaleItem[] = [];
  topProducts: TopProductItem[] = [];

  loading = false;
  error?: string;

  ngOnInit(): void {
    this.cargarDashboard();
  }

  private cargarDashboard(): void {
    this.loading = true;
    this.error = undefined;

    const hoy = new Date();
    const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);
    const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);

    const fechaInicio = inicioDia.toISOString();
    const fechaFin = finDia.toISOString();

    this.ventaService.listarVentasPorFecha(fechaInicio, fechaFin).subscribe({
      next: (response) => {
        const ventas = response.data ?? [];
        this.calcularEstadisticas(ventas);
        this.cargarVentasRecientes(ventas);
        this.calcularProductosMasVendidos(ventas);
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los datos del dashboard.';
        this.loading = false;
      }
    });
  }

  private calcularEstadisticas(ventas: VentaResponse[]): void {
    const totalVentas = ventas.reduce((sum, v) => sum + (v.total ?? 0), 0);
    const clientesAtendidos = ventas.length;

    let totalProductos = 0;
    let totalComisionTrabajador = 0;

    ventas.forEach((v) => {
      totalComisionTrabajador += v.comisionTrabajador ?? 0;
      v.detalles?.forEach((d) => {
        totalProductos += d.cantidad ?? 0;
      });
    });

    const gananciaNeta = totalVentas - totalComisionTrabajador;

    this.stats = [
      {
        icon: 'bi-cart4',
        title: 'Ventas Hoy',
        value: this.formatearMoneda(totalVentas),
        color: 'primary'
      },
      {
        icon: 'bi-people',
        title: 'Clientes Atendidos',
        value: clientesAtendidos.toString(),
        color: 'success'
      },
      {
        icon: 'bi-box-seam',
        title: 'Productos Vendidos',
        value: totalProductos.toString(),
        color: 'info'
      },
      {
        icon: 'bi-cash-stack',
        title: 'Ganancia Neta (aprox.)',
        value: this.formatearMoneda(gananciaNeta),
        color: 'warning'
      }
    ];
  }

  private cargarVentasRecientes(ventas: VentaResponse[]): void {
    const ordenadas = [...ventas].sort(
      (a, b) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime()
    );

    this.recentSales = ordenadas.slice(0, 10).map((v) => ({
      id: v.numeroVenta,
      worker: v.trabajadorNombre,
      amount: v.total,
      date: v.fechaVenta
    }));
  }

  private calcularProductosMasVendidos(ventas: VentaResponse[]): void {
    const contador = new Map<string, number>();

    ventas.forEach((v) => {
      v.detalles?.forEach((d) => {
        if (d.tipoItem === 'PRODUCTO') {
          const key = d.descripcion || 'Producto';
          const actual = contador.get(key) ?? 0;
          contador.set(key, actual + (d.cantidad ?? 0));
        }
      });
    });

    this.topProducts = Array.from(contador.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));
  }

  private formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(valor || 0);
  }
}

