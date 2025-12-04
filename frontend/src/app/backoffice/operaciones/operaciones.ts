import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../main.service';

interface OperacionAutorizada {
  _id?: string;
  order: number;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

type ModalMode = 'create' | 'edit' | 'view' | null;

@Component({
  selector: 'app-operaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operaciones.html',
  styleUrl: './operaciones.css',
})
export class Operaciones implements OnInit {
  // State signals
  isLoading = signal(true);
  isSaving = signal(false);
  operaciones = signal<OperacionAutorizada[]>([]);
  modalMode = signal<ModalMode>(null);
  selectedOperacion = signal<OperacionAutorizada | null>(null);
  searchTerm = signal('');
  
  // Messages
  successMessage = signal('');
  errorMessage = signal('');

  // Form model
  formData: Partial<OperacionAutorizada> = {};

  // Computed filtered list
  filteredOperaciones = computed(() => {
    let list = this.operaciones();
    const search = this.searchTerm().toLowerCase();

    if (search) {
      list = list.filter(o => 
        o.code.toLowerCase().includes(search) ||
        o.name.toLowerCase().includes(search) ||
        (o.description && o.description.toLowerCase().includes(search))
      );
    }

    // Ordenar por campo 'order'
    return list.sort((a, b) => a.order - b.order);
  });

  // Stats
  totalOperaciones = computed(() => this.operaciones().length);
  activeOperaciones = computed(() => this.operaciones().filter(o => o.is_active).length);

  constructor(private mainService: MainService) {}

  ngOnInit(): void {
    this.loadOperaciones();
  }

  loadOperaciones(): void {
    this.isLoading.set(true);
    this.mainService.getAuthorizedOperations({}).subscribe({
      next: (response) => {
        if (response.data && Array.isArray(response.data)) {
          this.operaciones.set(response.data);
        } else {
          this.operaciones.set([]);
        }
        
        // Si está vacío, sembrar datos iniciales
        if (this.operaciones().length === 0) {
          this.seedInitialData();
        }
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading operations:', error);
        this.showError('Error al cargar las operaciones');
        this.isLoading.set(false);
      }
    });
  }

  // Sembrar datos iniciales si la colección está vacía
  private seedInitialData(): void {
    const defaultData: Omit<OperacionAutorizada, '_id'>[] = [
      { order: 1, code: 'REC', name: 'Recolección y transporte', description: 'Operaciones de recolección y transporte de residuos', is_active: true },
      { order: 2, code: 'VAL', name: 'Valorización', description: 'Operaciones de valorización de residuos', is_active: true },
      { order: 3, code: 'TRA', name: 'Tratamiento', description: 'Operaciones de tratamiento de residuos', is_active: true },
      { order: 4, code: 'DIS', name: 'Disposición Final', description: 'Operaciones de disposición final de residuos', is_active: true },
      { order: 5, code: 'IMP', name: 'Importación y Exportación', description: 'Operaciones de importación y exportación de residuos', is_active: true }
    ];

    defaultData.forEach(item => {
      this.mainService.createAuthorizedOperation(item).subscribe({
        next: () => console.log(`Creado: ${item.code}`),
        error: (err) => console.log(`Error o duplicado: ${item.code}`)
      });
    });

    // Recargar después de 1 segundo
    setTimeout(() => this.loadOperaciones(), 1000);
  }

  openCreateModal(): void {
    // Calcular siguiente orden
    const maxOrder = this.operaciones().reduce((max, o) => Math.max(max, o.order || 0), 0);
    
    this.formData = {
      order: maxOrder + 1,
      code: '',
      name: '',
      description: '',
      is_active: true
    };
    this.modalMode.set('create');
    this.clearMessages();
  }

  openEditModal(operacion: OperacionAutorizada): void {
    this.formData = { ...operacion };
    this.selectedOperacion.set(operacion);
    this.modalMode.set('edit');
    this.clearMessages();
  }

  openViewModal(operacion: OperacionAutorizada): void {
    this.selectedOperacion.set(operacion);
    this.modalMode.set('view');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedOperacion.set(null);
    this.formData = {};
    this.clearMessages();
  }

  saveOperacion(): void {
    if (!this.validateForm()) return;

    this.isSaving.set(true);
    const mode = this.modalMode();

    if (mode === 'create') {
      this.mainService.createAuthorizedOperation(this.formData).subscribe({
        next: (response) => {
          this.showSuccess('Operación autorizada creada exitosamente');
          this.loadOperaciones();
          setTimeout(() => this.closeModal(), 1500);
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error creating operation:', error);
          if (error.status === 409) {
            this.showError('Ya existe una operación con ese código');
          } else {
            this.showError('Error al crear la operación');
          }
          this.isSaving.set(false);
        }
      });
    } else if (mode === 'edit') {
      this.mainService.updateAuthorizedOperation(this.formData).subscribe({
        next: (response) => {
          this.showSuccess('Operación autorizada actualizada exitosamente');
          this.loadOperaciones();
          setTimeout(() => this.closeModal(), 1500);
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error updating operation:', error);
          this.showError('Error al actualizar la operación');
          this.isSaving.set(false);
        }
      });
    }
  }

  toggleActive(operacion: OperacionAutorizada): void {
    const updated = { ...operacion, is_active: !operacion.is_active };
    this.mainService.updateAuthorizedOperation(updated).subscribe({
      next: () => {
        this.showSuccess(`Operación ${updated.is_active ? 'activada' : 'desactivada'} exitosamente`);
        this.loadOperaciones();
      },
      error: (error) => {
        console.error('Error toggling operation status:', error);
        this.showError('Error al cambiar el estado de la operación');
      }
    });
  }

  validateForm(): boolean {
    if (!this.formData.order || this.formData.order < 1) {
      this.showError('El orden es obligatorio y debe ser mayor a 0');
      return false;
    }
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

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
}
