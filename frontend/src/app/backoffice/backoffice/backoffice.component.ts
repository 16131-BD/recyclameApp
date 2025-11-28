import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-backoffice',
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule
  ],
  templateUrl: './backoffice.component.html',
  styleUrl: './backoffice.component.css'
})
export class BackofficeComponent implements OnInit {

  constructor(
    private ActivatedRoute: ActivatedRoute,
    private Router: Router
  ) {}

  menu: any[] = [
    {
      id: 'dashboard',
      name: 'Tablero',
      uri: '/backoffice/tablero',
      icon: 'fas fa-chart-line',
      selected: false
    },
    {
      id: 'table-management',
      name: 'Administración de Tablas',
      uri: '/backoffice/administracion-de-tablas',
      icon: 'fas fa-database',
      selected: false
    },
  ];

  ngOnInit(): void {
    let snapshot: any = this.ActivatedRoute.snapshot;
    
    console.log(snapshot._routerState.url);
    this.menu.map((m: any) => {
      if (m.uri === snapshot._routerState.url) {
        m.selected = true;
      }
    })
  }

  selectMenuItem(item: any) {
    this.menu.map((m: any) => {
      m.selected = false;
    });
    item.selected = true;
  }

  logout() {
    this.Router.navigate(['/inicio-de-sesión'])
  }
  
}
