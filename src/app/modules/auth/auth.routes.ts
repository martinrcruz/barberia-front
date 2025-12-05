import { Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

