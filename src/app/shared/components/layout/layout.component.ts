import { Component, inject, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private routerSubscription?: Subscription;

  sidebarOpen = signal(true);
  currentUser = this.authService.currentUser;
  userMenuOpen = signal(false);
  isMobile = signal(false);

  ngOnInit(): void {
    // Detectar tamaño de pantalla inicial
    this.checkMobile();
    
    // Cerrar menú cuando cambia la ruta
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeUserMenu();
        // Cerrar sidebar en mobile cuando se navega
        // Verificar directamente el tamaño de pantalla
        if (window.innerWidth <= 768) {
          this.sidebarOpen.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const userMenu = document.querySelector('.user-menu');
    
    if (userMenu && !userMenu.contains(target) && this.userMenuOpen()) {
      this.closeUserMenu();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkMobile();
  }

  checkMobile(): void {
    this.isMobile.set(window.innerWidth <= 768);
    // En desktop, asegurar que el sidebar esté abierto por defecto
    if (!this.isMobile()) {
      this.sidebarOpen.set(true);
    }
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  onNavLinkClick(event: Event): void {
    // Cerrar sidebar solo en mobile cuando se hace clic en un enlace
    // Verificar directamente el tamaño de pantalla para asegurar que funcione
    const isMobileView = window.innerWidth <= 768;
    if (isMobileView) {
      // Cerrar inmediatamente al hacer clic
      this.sidebarOpen.set(false);
    }
  }

  menuItems = [
    { icon: 'bi-speedometer2', label: 'Dashboard', route: '/dashboard', permission: null },
    { icon: 'bi-cart4', label: 'Ventas', route: '/ventas', permission: 'VENTA_VER' },
    { icon: 'bi-cash-stack', label: 'Caja', route: '/ventas/caja', permission: 'VENTA_CREAR' },
    { icon: 'bi-box-seam', label: 'Productos', route: '/productos', permission: 'PRODUCTO_VER' },
    { icon: 'bi-scissors', label: 'Servicios', route: '/servicios', permission: 'PRODUCTO_VER' },
    { icon: 'bi-person-lines-fill', label: 'Clientes', route: '/clientes', permission: 'CLIENTE_VER' },
    { icon: 'bi-building', label: 'Sucursales', route: '/sucursales', permission: 'SUCURSAL_VER' },
    { icon: 'bi-people', label: 'Usuarios', route: '/usuarios', permission: 'USUARIO_VER' },
    { icon: 'bi-shield-lock', label: 'Roles y Permisos', route: '/roles', permission: 'ROL_VER' },
    { icon: 'bi-graph-up', label: 'Contabilidad', route: '/contabilidad', permission: 'CONTABILIDAD_VER' },
    { icon: 'bi-credit-card', label: 'Métodos de Pago', route: '/configuracion/metodos-pago', permission: 'CONFIG_VER' },
    { icon: 'bi-gear', label: 'Configuración', route: '/configuracion', permission: 'CONFIG_VER' }
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update(value => !value);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(value => !value);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  logout(): void {
    console.log('[LayoutComponent] Cerrar sesión solicitado');
    this.authService.logout();
    this.closeUserMenu();
  }

  hasPermission(permission: string | null): boolean {
    if (!permission) return true;
    return this.authService.hasPermission(permission);
  }

  get filteredMenuItems() {
    return this.menuItems.filter(item => this.hasPermission(item.permission));
  }
}

