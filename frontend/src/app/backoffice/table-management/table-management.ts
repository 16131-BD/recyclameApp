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
      name: 'Empresas',
      source: 'postgres' // PostgreSQL usa filter: []
    },
    {
      id: 'residues',
      name: 'Residuos',
      source: 'mongo' // MongoDB usa filter: {}
    },
    {
      id: 'users',
      name: 'Usuarios',
      source: 'postgres'
    },
    {
      id: 'types',
      name: 'Configuración',
      source: 'postgres'
    },
    {
      id: 'plants',
      name: 'Plantas',
      source: 'postgres'
    },
  ];

  tableSelected: any = { results: [] };

  async ngOnInit() {}

  async toggleFilters() {
    this.filters.showFilters = !this.filters.showFilters;
  }

  async getEntities() {
    if (!this.filters.model) {
      this.tableSelected = { results: [] };
      return;
    }
    
    const table = this.tables.find((t: any) => t.id === this.filters.model);
    if (!table) return;
    
    this.tableSelected = { ...table, results: [], searched: false };
    
    let body: any;
    
    // Determinar formato según el source
    if (table.source === 'mongo') {
      // MongoDB usa filter como objeto
      body = { filter: {} };
      if (this.filters.text) {
        body.filter = { name: { $regex: this.filters.text, $options: 'i' } };
      }
    } else {
      // PostgreSQL usa filter como array
      body = { filter: [] };
      if (this.filters.text) {
        body.filter = [{ name: this.filters.text }];
      }
    }
    
    try {
      let result: any = await this.Main.getEntity(table.id, body).toPromise();
      console.log(result);
      
      // Normalizar resultado (MongoDB puede devolver array o objeto con data)
      let data = result?.data || [];
      if (!Array.isArray(data)) {
        data = data.data || [];
      }
      
      this.tableSelected.searched = true;
      this.tableSelected.results = data;
      this.cdr.detectChanges();
      console.log(this.tableSelected);
    } catch (error) {
      console.error('Error loading entities:', error);
      this.tableSelected.searched = true;
      this.tableSelected.results = [];
    }
  }

  // Track function para ngFor
  trackById(index: number, item: any): string {
    return item._id || item.id || index.toString();
  }

  trackByTableId(index: number, item: any): string {
    return item.id;
  }
}
