import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MainService } from '../../main.service';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  change?: number;
  changeLabel?: string;
}

interface RecentActivity {
  date: string;
  action: string;
  entity: string;
  status: 'success' | 'warning' | 'danger';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  isLoading = signal(true);
  
  stats: StatCard[] = [
    { title: 'Empresas', value: 0, icon: 'companies', color: 'green', change: 12, changeLabel: 'vs mes anterior' },
    { title: 'Usuarios', value: 0, icon: 'users', color: 'blue', change: 8, changeLabel: 'nuevos este mes' },
    { title: 'Residuos', value: 0, icon: 'residues', color: 'purple', change: -3, changeLabel: 'pendientes' },
    { title: 'Plantas', value: 0, icon: 'plants', color: 'orange', change: 2, changeLabel: 'operativas' },
    { title: 'Operaciones', value: 0, icon: 'operations', color: 'red', change: 45, changeLabel: 'este mes' },
    { title: 'Tipos', value: 0, icon: 'types', color: 'blue', change: 0, changeLabel: 'configurados' },
  ];

  recentActivities: RecentActivity[] = [];
  
  // Data for charts/summaries
  residuesByType: { type: string; count: number; percentage: number }[] = [];
  companiesByType: { type: string; count: number }[] = [];

  constructor(private mainService: MainService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      // Load all stats in parallel
      const [companies, users, residues, plants, operations, types] = await Promise.all([
        this.mainService.getCompanies().toPromise(),
        this.mainService.getUsers().toPromise(),
        this.mainService.getResidues({}).toPromise(), // MongoDB usa objeto vacío
        this.mainService.getPlants().toPromise(),
        this.mainService.getOperations().toPromise(),
        this.mainService.getTypes().toPromise(),
      ]);

      // Update stats
      this.stats[0].value = companies?.data?.length || 0;
      this.stats[1].value = users?.data?.length || 0;
      this.stats[2].value = Array.isArray(residues?.data) ? residues.data.length : 0;
      this.stats[3].value = plants?.data?.length || 0;
      this.stats[4].value = operations?.data?.length || 0;
      this.stats[5].value = types?.data?.length || 0;

      // Generate recent activities from data
      const residuesList = Array.isArray(residues?.data) ? residues.data : [];
      this.generateRecentActivities(residuesList, companies?.data || []);

      // Calculate residues by type
      this.calculateResiduesByType(residuesList);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private generateRecentActivities(residues: any[], companies: any[]): void {
    const activities: RecentActivity[] = [];
    
    // Get last 5 residues
    const recentResidues = residues.slice(-5).reverse();
    recentResidues.forEach(r => {
      activities.push({
        date: this.formatDate(r.created_at),
        action: 'Nuevo residuo registrado',
        entity: r.name || 'Residuo',
        status: 'success'
      });
    });

    // Get last 3 companies
    const recentCompanies = companies.slice(-3).reverse();
    recentCompanies.forEach(c => {
      activities.push({
        date: this.formatDate(c.created_at),
        action: 'Nueva empresa agregada',
        entity: c.name || 'Empresa',
        status: 'success'
      });
    });

    // Sort by date and take top 5
    this.recentActivities = activities.slice(0, 5);
  }

  private calculateResiduesByType(residues: any[]): void {
    const typeCount: { [key: string]: number } = {};
    
    residues.forEach(r => {
      const type = r.resudue_type_name || 'Sin tipo';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const total = residues.length || 1;
    this.residuesByType = Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getIconSvg(icon: string): string {
    const icons: { [key: string]: string } = {
      companies: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
      users: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      residues: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 4.875 7.33a1.783 1.783 0 0 1 .013-1.782A1.83 1.83 0 0 1 6.46 4.64l8.08.004"/><path d="m10 8 3-3-3-3"/></svg>',
      plants: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>',
      operations: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>',
      types: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
    };
    return icons[icon] || '';
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'Orgánico': '#22c55e',
      'Plástico': '#3b82f6', 
      'Papel': '#eab308',
      'Vidrio': '#06b6d4',
      'Metal': '#6b7280',
      'Electrónico': '#8b5cf6',
      'Peligroso': '#ef4444',
      'Sin tipo': '#9ca3af'
    };
    return colors[type] || '#6b7280';
  }
}
