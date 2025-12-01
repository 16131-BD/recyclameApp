import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../main.service';

interface Usuario {
  id: number;
  code: string;
  name: string;
  email: string;
  role_code?: string;
  role_name?: string;
  company_code?: string;
  company_name?: string;
  is_active: boolean;
  created_at?: string;
}

type ModalMode = 'create' | 'edit' | 'view' | null;

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
  modalMode = signal<ModalMode>(null);
  selectedUsuario = signal<Usuario | null>(null);
  searchTerm = signal('');
  filterActive = signal<'all' | 'active' | 'inactive'>('all');
  
  // Messages
  successMessage = signal('');
  errorMessage = signal('');

  // Form model
  formData: Partial<Usuario> = {};

  // Computed filtered list
  filteredUsuarios = computed(() => {
    let list = this.usuarios();
    const search = this.searchTerm().toLowerCase();
    const filter = this.filterActive();

    if (search) {
      list = list.filter(u => 
        u.name.toLowerCase().includes(search) ||
        u.code.toLowerCase().includes(search) ||
        (u.email && u.email.toLowerCase().includes(search))
      );
    }

    if (filter === 'active') {
      list = list.filter(u => u.is_active);
    } else if (filter === 'inactive') {
      list = list.filter(u => !u.is_active);
    }

    return list;
  });

  // Stats computed
  totalUsuarios = computed(() => this.usuarios().length);
  activeUsuarios = computed(() => this.usuarios().filter(u => u.is_active).length);
  inactiveUsuarios = computed(() => this.usuarios().filter(u => !u.is_active).length);

  constructor(private mainService: MainService) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.isLoading.set(true);
    this.mainService.getUsers().subscribe({
      next: (response) => {
        if (response.data) {
          this.usuarios.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showError('Error al cargar los usuarios');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.formData = {
      code: '',
      name: '',
      email: '',
      role_code: '',
      company_code: '',
      is_active: true
    };
    this.modalMode.set('create');
    this.clearMessages();
  }

  openEditModal(usuario: Usuario): void {
    this.formData = { ...usuario };
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

    if (mode === 'create') {
      this.mainService.createEntity('users', [this.formData]).subscribe({
        next: (response) => {
          if (response.data) {
            this.showSuccess('Usuario creado exitosamente');
            this.loadUsuarios();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.showError('Error al crear el usuario');
          this.isSaving.set(false);
        }
      });
    } else if (mode === 'edit') {
      this.mainService.updateEntity('users', [this.formData]).subscribe({
        next: (response) => {
          if (response.data) {
            this.showSuccess('Usuario actualizado exitosamente');
            this.loadUsuarios();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.showError('Error al actualizar el usuario');
          this.isSaving.set(false);
        }
      });
    }
  }

  toggleActive(usuario: Usuario): void {
    const updated = { ...usuario, is_active: !usuario.is_active };
    this.mainService.updateEntity('users', [updated]).subscribe({
      next: () => {
        this.showSuccess(`Usuario ${updated.is_active ? 'activado' : 'desactivado'} exitosamente`);
        this.loadUsuarios();
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.showError('Error al cambiar el estado del usuario');
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
    if (!this.formData.email?.trim()) {
      this.showError('El email es obligatorio');
      return false;
    }
    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.formData.email)) {
      this.showError('El email no tiene un formato válido');
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

  getRoleLabel(roleCode?: string): string {
    const roles: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'USER': 'Usuario',
      'OPERATOR': 'Operador',
      'SUPERVISOR': 'Supervisor',
      'VIEWER': 'Visualizador'
    };
    return roleCode ? roles[roleCode] || roleCode : 'No asignado';
  }
}
