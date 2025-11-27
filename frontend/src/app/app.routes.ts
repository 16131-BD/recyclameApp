import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { TableManagement } from './table-management/table-management';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio-de-sesion',
    pathMatch: 'full'
  },
  {
    path: 'inicio-de-sesion',
    component: Login
  }, 
  {
    path: 'inicio/tablero',
    component: Dashboard
  },
  {
    path: 'inicio/administracion-de-tablas',
    component: TableManagement
  },
  {
    path: '**',
    redirectTo: 'inicio-de-sesion'
  }
];
