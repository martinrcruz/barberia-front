import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RolService } from '../../../../core/services/rol.service';
import { PermisoService } from '../../../../core/services/permiso.service';
import { Permiso } from '../../../../core/models/rol.model';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles-form.component.html',
  styleUrls: ['./roles-form.component.scss']
})
export class RolesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rolService = inject(RolService);
  private permisoService = inject(PermisoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  rolForm!: FormGroup;
  permisos: Permiso[] = [];
  permisosSeleccionados: number[] = [];
  isEditMode = false;
  rolId: number | null = null;
  loading = false;
  submitted = false;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarPermisos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.rolId = +id;
      this.cargarRol(this.rolId);
    }
  }

  inicializarFormulario(): void {
    this.rolForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Z_]+$/), Validators.maxLength(50)]],
      descripcion: ['', Validators.maxLength(500)]
    });
  }

  cargarPermisos(): void {
    this.permisoService.obtenerTodos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Normalizar siempre a array
          this.permisos = Array.isArray(response.data)
            ? response.data
            : (response.data as any)?.content || [];
        } else {
          this.permisos = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.permisos = [];
      }
    });
  }

  cargarRol(id: number): void {
    this.loading = true;
    this.rolService.obtenerPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.rolForm.patchValue({
            nombre: response.data.nombre,
            codigo: response.data.codigo,
            descripcion: response.data.descripcion
          });
          this.permisosSeleccionados = response.data.permisos?.map(p => p.id) || [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar rol:', error);
        alert('Error al cargar el rol');
        this.router.navigate(['/roles']);
        this.loading = false;
      }
    });
  }

  togglePermiso(permisoId: number, event: any): void {
    if (event.target.checked) {
      this.permisosSeleccionados.push(permisoId);
    } else {
      this.permisosSeleccionados = this.permisosSeleccionados.filter(id => id !== permisoId);
    }
  }

  isPermisoSeleccionado(permisoId: number): boolean {
    return this.permisosSeleccionados.includes(permisoId);
  }

  getPermisosPorTipo(tipo: string): Permiso[] {
    return this.permisos.filter(p => p.tipoPermiso === tipo);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.rolForm.invalid) {
      return;
    }

    this.loading = true;

    const formData = {
      ...this.rolForm.value,
      permisosIds: this.permisosSeleccionados
    };

    const request = this.isEditMode
      ? this.rolService.actualizar(this.rolId!, formData)
      : this.rolService.crear(formData);

    request.subscribe({
      next: () => {
        alert(this.isEditMode ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
        this.router.navigate(['/roles']);
      },
      error: (error) => {
        console.error('Error al guardar rol:', error);
        alert('Error al guardar el rol');
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/roles']);
  }

  get f() {
    return this.rolForm.controls;
  }

  generarCodigo(): void {
    const nombre = this.rolForm.get('nombre')?.value;
    if (nombre) {
      const codigo = nombre
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 50);
      this.rolForm.patchValue({ codigo });
    }
  }
}

