import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../main.service';

interface Usuario {
  id: number;
  code: string;
  name: string;
  names: string;
  last_names: string;
  email: string;
  phone?: string;
  company_id?: number;
  company_name?: string;
  company_code?: string;
  user_type?: number;
  user_type_abbr?: string;
  user_type_name?: string;
  is_active: boolean;
  is_primary: boolean;
  created_at?: string;
}

interface Empresa {
  id: number;
  code: string;
  name: string;
}

interface TipoUsuario {
  id: number;
  abbr: string;
  name: string;
}

type ModalMode = 'create' | 'edit' | 'view' | null;
type FilterType = 'all' | 'active' | 'inactive' | 'primary' | 'secondary' | 'admin';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  // State signals
  isLoading = signal(true);
  isSaving = signal(false);
  usuarios = signal<Usuario[]>([]);
  empresas = signal<Empresa[]>([]);
  tiposUsuario = signal<TipoUsuario[]>([]);
  modalMode = signal<ModalMode>(null);
  selectedUsuario = signal<Usuario | null>(null);
  searchTerm = signal('');
  filterType = signal<FilterType>('all');
  filterEmpresa = signal<number | null>(null);
  
  // Messages
  successMessage = signal('');
  errorMessage = signal('');

  // Form model
  formData: Partial<Usuario> & { password?: string } = {};

  // Computed filtered list
  filteredUsuarios = computed(() => {
    let list = this.usuarios();
    const search = this.searchTerm().toLowerCase();
    const filter = this.filterType();
    const empresaId = this.filterEmpresa();

    // Filtro por búsqueda
    if (search) {
      list = list.filter(u => 
        u.name?.toLowerCase().includes(search) ||
        u.code?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search) ||
        this.getEmpresaNombre(u.company_id).toLowerCase().includes(search)
      );
    }

    // Filtro por tipo
    switch (filter) {
      case 'active':
        list = list.filter(u => u.is_active);
        break;
      case 'inactive':
        list = list.filter(u => !u.is_active);
        break;
      case 'primary':
        list = list.filter(u => u.is_primary);
        break;
      case 'secondary':
        list = list.filter(u => !u.is_primary && u.company_id);
        break;
      case 'admin':
        list = list.filter(u => u.user_type === 9);
        break;
    }

    // Filtro por empresa
    if (empresaId) {
      list = list.filter(u => u.company_id === empresaId);
    }

    return list;
  });

  // Stats computed
  totalUsuarios = computed(() => this.usuarios().length);
  activeUsuarios = computed(() => this.usuarios().filter(u => u.is_active).length);
  primaryUsuarios = computed(() => this.usuarios().filter(u => u.is_primary).length);
  inactiveUsuarios = computed(() => this.usuarios().filter(u => !u.is_active).length);

  constructor(private mainService: MainService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    // Cargar usuarios
    this.mainService.getUsers().subscribe({
      next: (response) => {
        if (response.data) {
          this.usuarios.set(response.data);
        }
      },
      error: (error) => console.error('Error loading users:', error)
    });

    // Cargar empresas
    this.mainService.getCompanies().subscribe({
      next: (response) => {
        if (response.data) {
          this.empresas.set(response.data);
        }
      },
      error: (error) => console.error('Error loading companies:', error)
    });

    // Cargar tipos de usuario
    this.mainService.getTypesByCategory('user_type').subscribe({
      next: (response) => {
        if (response.data) {
          this.tiposUsuario.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user types:', error);
        this.isLoading.set(false);
      }
    });
  }

  // Helpers para mostrar nombres
  getEmpresaNombre(companyId?: number): string {
    if (!companyId) return 'Sin empresa';
    // Primero buscar en el usuario si ya tiene company_name
    const usuariosConEmpresa = this.usuarios().filter(u => u.company_id === companyId && u.company_name);
    if (usuariosConEmpresa.length > 0) {
      return usuariosConEmpresa[0].company_name || 'Sin empresa';
    }
    // Fallback a la lista de empresas
    const empresa = this.empresas().find(e => e.id === companyId);
    return empresa ? empresa.name : 'Sin empresa';
  }

  getTipoUsuarioNombre(userType?: number): string {
    if (!userType) return 'No asignado';
    // Primero buscar en los usuarios si ya tiene el nombre del tipo
    const usuariosConTipo = this.usuarios().filter(u => u.user_type === userType && u.user_type_name);
    if (usuariosConTipo.length > 0) {
      return usuariosConTipo[0].user_type_name || 'No asignado';
    }
    // Fallback a la lista de tipos
    const tipo = this.tiposUsuario().find(t => t.id === userType);
    return tipo ? tipo.name : 'No asignado';
  }

  getTipoUsuarioAbbr(userType?: number): string {
    const usuariosConTipo = this.usuarios().filter(u => u.user_type === userType && u.user_type_abbr);
    if (usuariosConTipo.length > 0) {
      return usuariosConTipo[0].user_type_abbr || '';
    }
    const tipo = this.tiposUsuario().find(t => t.id === userType);
    return tipo ? tipo.abbr : '';
  }

  getTipoUsuarioBadgeClass(userType?: number): string {
    if (!userType) return 'badge-secondary';
    
    const abbr = this.getTipoUsuarioAbbr(userType);
    
    switch (abbr) {
      case 'ADM': return 'badge-danger';      // Administrador - Rojo
      case 'PRI': return 'badge-primary';     // Principal - Azul
      case 'SEC': return 'badge-info';        // Secundario - Celeste
      case 'OPE': return 'badge-warning';     // Operador (legacy)
      case 'SUP': return 'badge-success';     // Supervisor (legacy)
      default: return 'badge-secondary';
    }
  }

  openCreateModal(): void {
    this.formData = {
      names: '',
      last_names: '',
      email: '',
      phone: '',
      company_id: undefined,
      user_type: undefined,
      is_active: true,
      is_primary: false,
      password: ''
    };
    this.modalMode.set('create');
    this.clearMessages();
  }

  openEditModal(usuario: Usuario): void {
    this.formData = { 
      ...usuario,
      password: ''
    };
    this.selectedUsuario.set(usuario);
    this.modalMode.set('edit');
    this.clearMessages();
  }

  openViewModal(usuario: Usuario): void {
    this.selectedUsuario.set(usuario);
    this.modalMode.set('view');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedUsuario.set(null);
    this.formData = {};
    this.clearMessages();
  }

  saveUsuario(): void {
    if (!this.validateForm()) return;

    this.isSaving.set(true);
    const mode = this.modalMode();

    const userData: any = {
      names: this.formData.names,
      last_names: this.formData.last_names,
      email: this.formData.email,
      phone: this.formData.phone,
      company_id: this.formData.company_id || null,
      user_type: this.formData.user_type || null,
      is_active: this.formData.is_active,
      is_primary: this.formData.is_primary
    };

    if (mode === 'create') {
      userData.password = this.formData.password || 'temp1234';
      
      this.mainService.createEntity('users', [userData]).subscribe({
        next: (response) => {
          if (response.data) {
            const newCode = response.data[0]?.code || 'generado';
            this.showSuccess(`Usuario ${newCode} creado exitosamente`);
            this.loadData();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.showError('Error al crear el usuario: ' + (error.error?.message || ''));
          this.isSaving.set(false);
        }
      });
    } else if (mode === 'edit') {
      userData.id = this.formData.id;
      if (this.formData.password) {
        userData.password = this.formData.password;
      }
      
      this.mainService.updateEntity('users', [userData]).subscribe({
        next: () => {
          this.showSuccess('Usuario actualizado exitosamente');
          this.loadData();
          setTimeout(() => this.closeModal(), 1500);
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.showError('Error al actualizar el usuario: ' + (error.error?.message || ''));
          this.isSaving.set(false);
        }
      });
    }
  }

  toggleActive(usuario: Usuario): void {
    const updated = { id: usuario.id, is_active: !usuario.is_active };
    this.mainService.updateEntity('users', [updated]).subscribe({
      next: () => {
        this.showSuccess(`Usuario ${!usuario.is_active ? 'activado' : 'desactivado'} exitosamente`);
        this.loadData();
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.showError('Error al cambiar el estado del usuario');
      }
    });
  }

  validateForm(): boolean {
    if (!this.formData.names?.trim()) {
      this.showError('El nombre es obligatorio');
      return false;
    }
    if (!this.formData.last_names?.trim()) {
      this.showError('Los apellidos son obligatorios');
      return false;
    }
    if (!this.formData.email?.trim()) {
      this.showError('El email es obligatorio');
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.formData.email)) {
      this.showError('El email no tiene un formato válido');
      return false;
    }
    if (this.modalMode() === 'create' && !this.formData.password?.trim()) {
      this.showError('La contraseña es obligatoria para nuevos usuarios');
      return false;
    }
    return true;
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  setFilter(filter: FilterType): void {
    this.filterType.set(filter);
  }

  setEmpresaFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.filterEmpresa.set(value ? parseInt(value) : null);
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

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
