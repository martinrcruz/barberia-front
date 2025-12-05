import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '@core/services/cliente.service';
import { ClienteResponse, ClienteRequest } from '@core/models/cliente.model';
import { ApiResponse } from '@core/models/api-response.model';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.scss']
})
export class ClientesListComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly fb = inject(FormBuilder);

  clientes: ClienteResponse[] = [];
  clienteSeleccionado: ClienteResponse | null = null;
  mostrarFormulario = false;
  modoEdicion = false;
  cargando = false;
  error: string | null = null;

  formulario: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(200)]],
    rut: ['', [Validators.maxLength(12)]],
    email: ['', [Validators.email, Validators.maxLength(100)]],
    telefono: ['', [Validators.maxLength(20)]],
    direccion: ['', [Validators.maxLength(255)]],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.cargando = true;
    this.error = null;

    this.clienteService.listarTodos(0, 1000).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.clientes = Array.isArray(response.data)
            ? response.data
            : (response.data?.content || []);
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar los clientes';
        this.cargando = false;
        console.error('Error al cargar clientes:', err);
      }
    });
  }

  abrirFormularioCrear(): void {
    this.modoEdicion = false;
    this.clienteSeleccionado = null;
    this.formulario.reset();
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(cliente: ClienteResponse): void {
    this.modoEdicion = true;
    this.clienteSeleccionado = cliente;
    this.formulario.patchValue({
      nombreCompleto: cliente.nombreCompleto,
      rut: cliente.rut || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      observaciones: cliente.observaciones || ''
    });
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formulario.reset();
    this.clienteSeleccionado = null;
    this.error = null;
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = null;
    const request: ClienteRequest = this.formulario.value;

    const operacion = this.modoEdicion && this.clienteSeleccionado
      ? this.clienteService.actualizar(this.clienteSeleccionado.id, request)
      : this.clienteService.crear(request);

    operacion.subscribe({
      next: (response: ApiResponse<ClienteResponse>) => {
        if (response.success) {
          this.cerrarFormulario();
          this.cargarClientes();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al guardar el cliente';
        this.cargando = false;
        console.error('Error al guardar cliente:', err);
      }
    });
  }

  eliminar(cliente: ClienteResponse): void {
    if (!confirm(`¿Está seguro de eliminar al cliente "${cliente.nombreCompleto}"?`)) {
      return;
    }

    this.cargando = true;
    this.error = null;
    this.clienteService.eliminar(cliente.id).subscribe({
      next: (response: ApiResponse<void>) => {
        if (response.success) {
          this.cargarClientes();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al eliminar el cliente';
        this.cargando = false;
        console.error('Error al eliminar cliente:', err);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.formulario.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['email']) return `Formato de email inválido`;
    }
    return '';
  }
}


