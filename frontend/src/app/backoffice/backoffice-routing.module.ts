import { RouterModule, Routes } from '@angular/router';
import { BackofficeComponent } from './backoffice/backoffice.component';
import { Dashboard } from './dashboard/dashboard';
import { TableManagement } from './table-management/table-management';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    {
        path: '',
        component: BackofficeComponent,
        children: [
          {
              path: 'tablero',
              component: Dashboard,
              data: { title: 'Tablero' }
          },
          {
              path: 'administracion-de-tablas',
              component: TableManagement,
              data: { title: 'Administración' }
          },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BackofficeRoutingModule {}
