import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../main.service';

interface Empresa {
  id: number;
  code: string;
  name: string;
  company_type?: number;
  company_type_abbr?: string;
  company_type_name?: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_name?: string;
  is_active: boolean;
  primary_user_id?: number;
  primary_user_name?: string;
  total_users?: number;
  created_at?: string;
}

interface TipoEmpresa {
  id: number;
  abbr: string;
  name: string;
}

type ModalMode = 'create' | 'edit' | 'view' | null;

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empresas.html',
  styleUrl: './empresas.css',
})
export class Empresas implements OnInit {
  // State signals
  isLoading = signal(true);
  isSaving = signal(false);
  empresas = signal<Empresa[]>([]);
  tiposEmpresa = signal<TipoEmpresa[]>([]);
  modalMode = signal<ModalMode>(null);
  selectedEmpresa = signal<Empresa | null>(null);
  searchTerm = signal('');
  filterActive = signal<'all' | 'active' | 'inactive'>('all');
  
  // Messages
  successMessage = signal('');
  errorMessage = signal('');

  // Form model
  formData: Partial<Empresa> = {};

  // Computed filtered list
  filteredEmpresas = computed(() => {
    let list = this.empresas();
    const search = this.searchTerm().toLowerCase();
    const filter = this.filterActive();

    if (search) {
      list = list.filter(e => 
        e.name.toLowerCase().includes(search) ||
        e.code.toLowerCase().includes(search) ||
        (e.ruc && e.ruc.includes(search))
      );
    }

    if (filter === 'active') {
      list = list.filter(e => e.is_active);
    } else if (filter === 'inactive') {
      list = list.filter(e => !e.is_active);
    }

    return list;
  });

  // Stats computed
  totalEmpresas = computed(() => this.empresas().length);
  activeEmpresas = computed(() => this.empresas().filter(e => e.is_active).length);
  inactiveEmpresas = computed(() => this.empresas().filter(e => !e.is_active).length);

  constructor(private mainService: MainService) {}

  ngOnInit(): void {
    this.loadEmpresas();
    this.loadTiposEmpresa();
  }

  loadEmpresas(): void {
    this.isLoading.set(true);
    this.mainService.getCompanies().subscribe({
      next: (response) => {
        if (response.data) {
          this.empresas.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.showError('Error al cargar las empresas');
        this.isLoading.set(false);
      }
    });
  }

  loadTiposEmpresa(): void {
    this.mainService.getTypesByCategory('company_type').subscribe({
      next: (response) => {
        if (response.data) {
          this.tiposEmpresa.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading company types:', error);
      }
    });
  }

  openCreateModal(): void {
    this.formData = {
      code: '',
      name: '',
      ruc: '',
      address: '',
      phone: '',
      email: '',
      contact_name: '',
      is_active: true
    };
    this.modalMode.set('create');
    this.clearMessages();
  }

  openEditModal(empresa: Empresa): void {
    this.formData = { ...empresa };
    this.selectedEmpresa.set(empresa);
    this.modalMode.set('edit');
    this.clearMessages();
  }

  openViewModal(empresa: Empresa): void {
    this.selectedEmpresa.set(empresa);
    this.modalMode.set('view');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedEmpresa.set(null);
    this.formData = {};
    this.clearMessages();
  }

  saveEmpresa(): void {
    if (!this.validateForm()) return;

    this.isSaving.set(true);
    const mode = this.modalMode();

    if (mode === 'create') {
      this.mainService.createEntity('companies', this.formData).subscribe({
        next: (response) => {
          if (response.data) {
            this.showSuccess('Empresa creada exitosamente');
            this.loadEmpresas();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error creating company:', error);
          this.showError('Error al crear la empresa');
          this.isSaving.set(false);
        }
      });
    } else if (mode === 'edit') {
      this.mainService.updateEntity('companies', this.formData).subscribe({
        next: (response) => {
          if (response.data) {
            this.showSuccess('Empresa actualizada exitosamente');
            this.loadEmpresas();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error updating company:', error);
          this.showError('Error al actualizar la empresa');
          this.isSaving.set(false);
        }
      });
    }
  }

  toggleActive(empresa: Empresa): void {
    const updated = { ...empresa, is_active: !empresa.is_active };
    this.mainService.updateEntity('companies', updated).subscribe({
      next: () => {
        this.showSuccess(`Empresa ${updated.is_active ? 'activada' : 'desactivada'} exitosamente`);
        this.loadEmpresas();
      },
      error: (error) => {
        console.error('Error toggling company status:', error);
        this.showError('Error al cambiar el estado de la empresa');
      }
    });
  }

  validateForm(): boolean {
    if (!this.formData.code?.trim()) {
      this.showError('El código es obligatorio');
      return false;
    }
    if (!this.formData.name?.trim()) {
      this.showError('El nombre es obligatorio');
      return false;
    }
    return true;
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  setFilter(filter: 'all' | 'active' | 'inactive'): void {
    this.filterActive.set(filter);
  }

  showSuccess(message: string): void {
    this.successMessage.set(message);
    this.errorMessage.set('');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  showError(message: string): void {
    this.errorMessage.set(message);
    this.successMessage.set('');
  }

  clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  getCompanyTypeLabel(abbr?: string): string {
    if (!abbr) {
      return 'No definido';
    }
    // Solo mostrar Generador y Operador
    const types: { [key: string]: string } = {
      'GEN': 'Generador',
      'OPE': 'Operador'
    };
    return types[abbr] || abbr;
  }

  getCompanyTypeBadgeClass(abbr?: string): string {
    if (!abbr) return 'type-badge-default';
    switch (abbr) {
      case 'GEN': return 'type-badge-gen';
      case 'OPE': return 'type-badge-ope';
      default: return 'type-badge-default';
    }
  }
}
