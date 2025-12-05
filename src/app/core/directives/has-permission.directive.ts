import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Directiva estructural para mostrar/ocultar elementos según permisos del usuario
 * 
 * Uso:
 * <button *hasPermission="'PERMISO_CREAR'">Crear</button>
 * <button *hasPermission="['PERMISO_EDITAR', 'PERMISO_VER']">Editar</button>
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  
  private permissions: string[] = [];
  private logicalOp: 'AND' | 'OR' = 'OR';
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  @Input()
  set hasPermission(val: string | string[]) {
    this.permissions = Array.isArray(val) ? val : [val];
    this.updateView();
  }

  @Input()
  set hasPermissionOp(op: 'AND' | 'OR') {
    this.logicalOp = op;
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const hasPermission = this.checkPermissions();
    
    // Limpiar siempre antes de crear una nueva vista para evitar duplicados
    this.viewContainer.clear();
    
    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private checkPermissions(): boolean {
    if (this.permissions.length === 0) {
      return true;
    }

    if (this.logicalOp === 'AND') {
      return this.permissions.every(permission => this.authService.hasPermission(permission));
    } else {
      return this.permissions.some(permission => this.authService.hasPermission(permission));
    }
  }
}

