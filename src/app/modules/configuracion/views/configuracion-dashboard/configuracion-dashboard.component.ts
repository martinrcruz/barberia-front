import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ConfiguracionSistemaResponse,
  ConfiguracionSistemaRequest
} from '@core/models/configuracion-sistema.model';
import { ConfiguracionSistemaService } from '@core/services/configuracion-sistema.service';
import { ApiResponse } from '@core/models/api-response.model';

@Component({
  selector: 'app-configuracion-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-dashboard.component.html',
  styleUrls: ['./configuracion-dashboard.component.scss'],
})
export class ConfiguracionDashboardComponent implements OnInit {
  private readonly configuracionService = inject(ConfiguracionSistemaService);

  configuraciones: ConfiguracionSistemaResponse[] = [];
  configuracionEditando: ConfiguracionSistemaResponse | null = null;
  valorEditando: string | null = null;

  cargando = false;
  guardando = false;
  error: string | null = null;
  mensaje: string | null = null;

  ngOnInit(): void {
    this.cargarConfiguraciones();
  }

  cargarConfiguraciones(): void {
    this.cargando = true;
    this.error = null;
    this.mensaje = null;

    this.configuracionService.listarEditables().subscribe({
      next: (res: ApiResponse<ConfiguracionSistemaResponse[]>) => {
        if (res.success && res.data) {
          this.configuraciones = res.data;
        }
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar configuraciones';
        this.cargando = false;
      }
    });
  }

  iniciarEdicion(config: ConfiguracionSistemaResponse): void {
    this.configuracionEditando = { ...config };
    this.valorEditando = config.valor;
    this.mensaje = null;
    this.error = null;
  }

  cancelarEdicion(): void {
    this.configuracionEditando = null;
    this.valorEditando = null;
  }

  guardarCambios(): void {
    if (!this.configuracionEditando) {
      return;
    }

    this.guardando = true;
    this.error = null;
    this.mensaje = null;

    const request: ConfiguracionSistemaRequest = {
      clave: this.configuracionEditando.clave,
      valor: this.valorEditando,
      tipo: this.configuracionEditando.tipo,
      descripcion: this.configuracionEditando.descripcion,
      categoria: this.configuracionEditando.categoria,
      editable: this.configuracionEditando.editable
    };

    this.configuracionService.actualizar(this.configuracionEditando.id, request).subscribe({
      next: (res: ApiResponse<ConfiguracionSistemaResponse>) => {
        if (res.success && res.data) {
          this.mensaje = 'Configuración actualizada correctamente';
          this.cancelarEdicion();
          this.cargarConfiguraciones();
        }
        this.guardando = false;
      },
      error: () => {
        this.error = 'Error al guardar la configuración';
        this.guardando = false;
      }
    });
  }
}


