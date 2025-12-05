import { Routes } from '@angular/router';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent
      }
    ]
  }
];

