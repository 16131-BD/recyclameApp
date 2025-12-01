import { RouterModule, Routes } from '@angular/router';
import { BackofficeComponent } from './backoffice/backoffice.component';
import { Dashboard } from './dashboard/dashboard';
import { TableManagement } from './table-management/table-management';
import { Empresas } from './empresas/empresas';
import { Usuarios } from './usuarios/usuarios';
import { Residuos } from './residuos/residuos';
import { Plantas } from './plantas/plantas';
import { Operaciones } from './operaciones/operaciones';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    {
        path: '',
        component: BackofficeComponent,
        children: [
          {
              path: '',
              redirectTo: 'tablero',
              pathMatch: 'full'
          },
          {
              path: 'tablero',
              component: Dashboard,
              data: { title: 'Tablero' }
          },
          {
              path: 'empresas',
              component: Empresas,
              data: { title: 'Empresas' }
          },
          {
              path: 'usuarios',
              component: Usuarios,
              data: { title: 'Usuarios' }
          },
          {
              path: 'residuos',
              component: Residuos,
              data: { title: 'Residuos' }
          },
          {
              path: 'plantas',
              component: Plantas,
              data: { title: 'Plantas' }
          },
          {
              path: 'operaciones',
              component: Operaciones,
              data: { title: 'Operaciones' }
          },
          // Temporalmente oculto - puede ser útil en el futuro
          // {
          //     path: 'administracion-de-tablas',
          //     component: TableManagement,
          //     data: { title: 'Administración' }
          // },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BackofficeRoutingModule {}
