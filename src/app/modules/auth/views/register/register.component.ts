import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: [''],
      rut: ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response.success) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Error al registrarse');
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}

