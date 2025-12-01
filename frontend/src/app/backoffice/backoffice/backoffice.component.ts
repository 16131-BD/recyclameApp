import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { MainService } from '../../main.service';
import { filter } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface MenuItem {
  id: string;
  name: string;
  uri: string;
  iconSvg: SafeHtml;
  selected: boolean;
  badge?: number;
}

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule
  ],
  templateUrl: './backoffice.component.html',
  styleUrl: './backoffice.component.css'
})
export class BackofficeComponent implements OnInit {
  sidebarOpen = false;
  showUserMenu = false;
  currentPageTitle = 'Tablero';
  
  // User info
  userName = 'Usuario';
  userRole = 'Administrador';
  userInitials = 'US';

  // SVG Icons
  private icons = {
    dashboard: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    companies: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    residues: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 4.875 7.33a1.783 1.783 0 0 1 .013-1.782A1.83 1.83 0 0 1 6.46 4.64l8.08.004"/><path d="m10 8 3-3-3-3"/></svg>',
    plants: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>',
    operations: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>',
    types: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    tables: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>'
  };

  menuPrincipal: MenuItem[] = [];
  menuGestion: MenuItem[] = [];
  menuConfig: MenuItem[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private mainService: MainService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.initializeMenu();
    this.loadUserInfo();
    this.updateCurrentPage();
    
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentPage();
    });
  }

  private initializeMenu(): void {
    this.menuPrincipal = [
      {
        id: 'dashboard',
        name: 'Tablero',
        uri: '/backoffice/tablero',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(this.icons.dashboard),
        selected: false
      }
    ];

    this.menuGestion = [
      {
        id: 'companies',
        name: 'Empresas',
        uri: '/backoffice/empresas',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(this.icons.companies),
        selected: false
      },
      {
        id: 'users',
        name: 'Usuarios',
        uri: '/backoffice/usuarios',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(this.icons.users),
        selected: false
      },
      {
        id: 'residues',
        name: 'Residuos',
        uri: '/backoffice/residuos',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(this.icons.residues),
        selected: false,
        badge: 12
      },
      {
        id: 'plants',
        name: 'Plantas',
        uri: '/backoffice/plantas',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(this.icons.plants),
        selected: false
      },
      {
        id: 'operations',
        name: 'Operaciones',
        uri: '/backoffice/operaciones',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(this.icons.operations),
        selected: false
      }
    ];

    this.menuConfig = [
      {
        id: 'types',
        name: 'Configuración',
        uri: '/backoffice/configuracion',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(this.icons.types),
        selected: false
      }
      // Temporalmente oculto - puede ser útil en el futuro
      // {
      //   id: 'tables',
      //   name: 'Administración',
      //   uri: '/backoffice/administracion-de-tablas',
      //   iconSvg: this.sanitizer.bypassSecurityTrustHtml(this.icons.tables),
      //   selected: false
      // }
    ];
  }

  private loadUserInfo(): void {
    const user = this.mainService.currentUser();
    if (user) {
      this.userName = `${user.names || ''} ${user.last_names || ''}`.trim() || 'Usuario';
      this.userInitials = this.getInitials(this.userName);
      // Map user_type to role name
      this.userRole = 'Administrador';
    }
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  private updateCurrentPage(): void {
    const url = this.router.url;
    const allMenus = [...this.menuPrincipal, ...this.menuGestion, ...this.menuConfig];
    
    allMenus.forEach(item => {
      item.selected = url.includes(item.uri);
      if (item.selected) {
        this.currentPageTitle = item.name;
      }
    });
  }

  selectMenuItem(item: MenuItem): void {
    const allMenus = [...this.menuPrincipal, ...this.menuGestion, ...this.menuConfig];
    allMenus.forEach(m => m.selected = false);
    item.selected = true;
    this.currentPageTitle = item.name;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.mainService.logout();
  }
}
