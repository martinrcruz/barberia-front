import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor() {
    console.log('[LoginComponent] Inicializando componente de login');
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Si el usuario ya está autenticado, redirigir al dashboard
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('[LoginComponent] Estado de autenticación al cargar:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('[LoginComponent] Usuario ya autenticado - Redirigiendo a dashboard');
      this.router.navigate(['/dashboard']);
    } else {
      console.log('[LoginComponent] Usuario no autenticado - Mostrando formulario de login');
    }
  }

  onSubmit(): void {
    console.log('[LoginComponent] Formulario enviado');
    console.log('[LoginComponent] Formulario válido:', this.loginForm.valid);
    
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      console.log('[LoginComponent] Intentando login con email:', formValue.email);
      
      this.loading.set(true);
      this.error.set(null);

      this.authService.login(formValue).subscribe({
        next: (response) => {
          console.log('[LoginComponent] Respuesta del login recibida:', {
            success: response.success,
            hasData: !!response.data
          });
          
          this.loading.set(false);
          if (response.success) {
            console.log('[LoginComponent] ✓ Login exitoso - Redirigiendo a dashboard');
            this.router.navigate(['/dashboard']);
          } else {
            console.warn('[LoginComponent] ✗ Login fallido - Respuesta sin éxito');
          }
        },
        error: (err) => {
          console.error('[LoginComponent] ✗ Error en login:', err);
          console.error('[LoginComponent] Detalles del error:', {
            status: err.status,
            message: err.error?.message,
            error: err.error
          });
          
          this.loading.set(false);
          const errorMessage = err.error?.message || 'Error al iniciar sesión';
          this.error.set(errorMessage);
          console.log('[LoginComponent] Mensaje de error mostrado al usuario:', errorMessage);
        }
      });
    } else {
      console.warn('[LoginComponent] Formulario inválido - Marcando campos como touched');
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}

