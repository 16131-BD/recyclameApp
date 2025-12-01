import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../main.service';

interface Operacion {
  id: number;
  code: string;
  operation_type_code?: string;
  operation_type_name?: string;
  residue_code?: string;
  residue_name?: string;
  source_plant_code?: string;
  source_plant_name?: string;
  destination_plant_code?: string;
  destination_plant_name?: string;
  quantity?: number;
  unit?: string;
  operation_date?: string;
  status?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
}

type ModalMode = 'create' | 'edit' | 'view' | null;
type StatusFilter = 'all' | 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';

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
  operaciones = signal<Operacion[]>([]);
  modalMode = signal<ModalMode>(null);
  selectedOperacion = signal<Operacion | null>(null);
  searchTerm = signal('');
  filterStatus = signal<StatusFilter>('all');
  
  // Messages
  successMessage = signal('');
  errorMessage = signal('');

  // Form model
  formData: Partial<Operacion> = {};

  // Status options
  statusOptions = ['Pendiente', 'En Proceso', 'Completada', 'Cancelada'];

  // Computed filtered list
  filteredOperaciones = computed(() => {
    let list = this.operaciones();
    const search = this.searchTerm().toLowerCase();
    const filter = this.filterStatus();

    if (search) {
      list = list.filter(o => 
        o.code.toLowerCase().includes(search) ||
        (o.residue_name && o.residue_name.toLowerCase().includes(search)) ||
        (o.operation_type_name && o.operation_type_name.toLowerCase().includes(search))
      );
    }

    if (filter !== 'all') {
      list = list.filter(o => o.status === filter);
    }

    return list;
  });

  // Stats computed
  totalOperaciones = computed(() => this.operaciones().length);
  completedOperaciones = computed(() => this.operaciones().filter(o => o.status === 'Completada').length);
  pendingOperaciones = computed(() => this.operaciones().filter(o => o.status === 'Pendiente').length);
  inProgressOperaciones = computed(() => this.operaciones().filter(o => o.status === 'En Proceso').length);

  constructor(private mainService: MainService) {}

  ngOnInit(): void {
    this.loadOperaciones();
  }

  loadOperaciones(): void {
    this.isLoading.set(true);
    this.mainService.getOperations().subscribe({
      next: (response) => {
        if (response.data) {
          this.operaciones.set(response.data);
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

  openCreateModal(): void {
    this.formData = {
      code: '',
      operation_type_code: '',
      residue_code: '',
      source_plant_code: '',
      destination_plant_code: '',
      quantity: undefined,
      unit: 'kg',
      operation_date: new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      notes: '',
      is_active: true
    };
    this.modalMode.set('create');
    this.clearMessages();
  }

  openEditModal(operacion: Operacion): void {
    this.formData = { ...operacion };
    this.selectedOperacion.set(operacion);
    this.modalMode.set('edit');
    this.clearMessages();
  }

  openViewModal(operacion: Operacion): void {
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
      this.mainService.createEntity('operations_detail', [this.formData]).subscribe({
        next: (response) => {
          if (response.data) {
            this.showSuccess('Operación creada exitosamente');
            this.loadOperaciones();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error creating operation:', error);
          this.showError('Error al crear la operación');
          this.isSaving.set(false);
        }
      });
    } else if (mode === 'edit') {
      this.mainService.updateEntity('operations_detail', [this.formData]).subscribe({
        next: (response) => {
          if (response.data) {
            this.showSuccess('Operación actualizada exitosamente');
            this.loadOperaciones();
            setTimeout(() => this.closeModal(), 1500);
          }
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

  toggleActive(operacion: Operacion): void {
    const updated = { ...operacion, is_active: !operacion.is_active };
    this.mainService.updateEntity('operations_detail', [updated]).subscribe({
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
    if (!this.formData.code?.trim()) {
      this.showError('El código es obligatorio');
      return false;
    }
    return true;
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  setFilter(filter: StatusFilter): void {
    this.filterStatus.set(filter);
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

  getStatusClass(status?: string): string {
    const statusClasses: { [key: string]: string } = {
      'Pendiente': 'pending',
      'En Proceso': 'in-progress',
      'Completada': 'completed',
      'Cancelada': 'cancelled'
    };
    return status ? statusClasses[status] || '' : '';
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

  formatQuantity(quantity?: number, unit?: string): string {
    if (quantity === undefined || quantity === null) return '-';
    return `${quantity.toLocaleString('es-PE')} ${unit || ''}`.trim();
  }
}
