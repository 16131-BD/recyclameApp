import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MainService } from '../../main.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-management',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './table-management.html',
  styleUrl: './table-management.css',
})
export class TableManagement implements OnInit {

  constructor(
    private Main: MainService,
    private cdr: ChangeDetectorRef
  ) {}

  filters: any = {};

  tables: any[] = [
    {
      id: 'companies',
      name: 'Empresas'
    },
    {
      id: 'residues',
      name: 'Residuos'
    },
    {
      id: 'users',
      name: 'Usuarios'
    },
    {
      id: 'types',
      name: 'Configuración',
    },
  ];

  tableSelected: any = {};

  async ngOnInit() {}

  // async selectTable() {
  //   this.getEntities();
  // }

  async toggleFilters() {
    this.filters.showFilters = !this.filters.showFilters;
  }

  async getEntities() {
    this.tableSelected = this.tables.find((t: any) => t.id === this.filters.model);
    let body: any = {filter: []};
    if (this.filters.text) {
      body.filter = [
        { name: this.filters.text, code: this.filters.text }
      ];
    }
    let result: any = await this.Main.getEntity(this.tableSelected.id, body).toPromise();
    console.log(result);
    this.tableSelected.searched = true;
    this.tableSelected.results = result.data;
    this.cdr.detectChanges();
    // setTimeout(() => {
    // }, 500);
    console.log(this.tableSelected);

  }


}
