import { Routes } from '@angular/router';
import { Login } from './login/login';

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
    path: 'backoffice',
    loadChildren: () => import("./backoffice/backoffice.module").then(m => m.BackofficeModule)
  }, 
  {
    path: '**',
    redirectTo: 'inicio-de-sesion'
  }
];
