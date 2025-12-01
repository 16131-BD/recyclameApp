import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../main.service';

interface Planta {
  id: number;
  code: string;
  name: string;
  plant_type_code?: string;
  plant_type_name?: string;
  company_code?: string;
  company_name?: string;
  address?: string;
  phone?: string;
  capacity?: number;
  capacity_unit?: string;
  operational_status?: string;
  is_active: boolean;
  created_at?: string;
}

type ModalMode = 'create' | 'edit' | 'view' | null;

@Component({
  selector: 'app-plantas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plantas.html',
  styleUrl: './plantas.css',
})
export class Plantas implements OnInit {
  // State signals
  isLoading = signal(true);
  isSaving = signal(false);
  plantas = signal<Planta[]>([]);
  modalMode = signal<ModalMode>(null);
  selectedPlanta = signal<Planta | null>(null);
  searchTerm = signal('');
  filterActive = signal<'all' | 'active' | 'inactive'>('all');
  
  // Messages
  successMessage = signal('');
  errorMessage = signal('');

  // Form model
  formData: Partial<Planta> = {};

  // Computed filtered list
  filteredPlantas = computed(() => {
    let list = this.plantas();
    const search = this.searchTerm().toLowerCase();
    const filter = this.filterActive();

    if (search) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.code.toLowerCase().includes(search)
      );
    }

    if (filter === 'active') {
      list = list.filter(p => p.is_active);
    } else if (filter === 'inactive') {
      list = list.filter(p => !p.is_active);
    }

    return list;
  });

  // Stats computed
  totalPlantas = computed(() => this.plantas().length);
  operationalPlantas = computed(() => this.plantas().filter(p => p.operational_status === 'Operativa').length);
  nonOperationalPlantas = computed(() => this.plantas().filter(p => p.operational_status !== 'Operativa').length);

  constructor(private mainService: MainService) {}

  ngOnInit(): void {
    this.loadPlantas();
  }

  loadPlantas(): void {
    this.isLoading.set(true);
    this.mainService.getPlants().subscribe({
      next: (response) => {
        if (response.data) {
          this.plantas.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading plants:', error);
        this.showError('Error al cargar las plantas');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.formData = {
      code: '',
      name: '',
      plant_type_code: '',
      company_code: '',
      address: '',
      phone: '',
      capacity: undefined,
      capacity_unit: '',
      operational_status: 'Operativa',
      is_active: true
    };
    this.modalMode.set('create');
    this.clearMessages();
  }

  openEditModal(planta: Planta): void {
    this.formData = { ...planta };
    this.selectedPlanta.set(planta);
    this.modalMode.set('edit');
    this.clearMessages();
  }

  openViewModal(planta: Planta): void {
    this.selectedPlanta.set(planta);
    this.modalMode.set('view');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedPlanta.set(null);
    this.formData = {};
    this.clearMessages();
  }

  savePlanta(): void {
    if (!this.validateForm()) return;

    this.isSaving.set(true);
    const mode = this.modalMode();

    if (mode === 'create') {
      this.mainService.createEntity('plants', this.formData).subscribe({
        next: (response) => {
          if (response.data) {
            this.showSuccess('Planta creada exitosamente');
            this.loadPlantas();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error creating plant:', error);
          this.showError('Error al crear la planta');
          this.isSaving.set(false);
        }
      });
    } else if (mode === 'edit') {
      this.mainService.updateEntity('plants', this.formData).subscribe({
        next: (response) => {
          if (response.data) {
            this.showSuccess('Planta actualizada exitosamente');
            this.loadPlantas();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error updating plant:', error);
          this.showError('Error al actualizar la planta');
          this.isSaving.set(false);
        }
      });
    }
  }

  toggleActive(planta: Planta): void {
    const updated = { ...planta, is_active: !planta.is_active };
    this.mainService.updateEntity('plants', updated).subscribe({
      next: () => {
        this.showSuccess(`Planta ${updated.is_active ? 'activada' : 'desactivada'} exitosamente`);
        this.loadPlantas();
      },
      error: (error) => {
        console.error('Error toggling plant status:', error);
        this.showError('Error al cambiar el estado de la planta');
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

  getPlantTypeLabel(type?: string): string {
    const types: { [key: string]: string } = {
      'TRA': 'Tratamiento',
      'REC': 'Reciclaje',
      'ALM': 'Almacenamiento',
      'DIS': 'Disposición Final'
    };
    return type ? types[type] || type : 'No definido';
  }

  getOperationalStatusClass(status?: string): string {
    switch (status) {
      case 'Operativa':
        return 'operational';
      case 'En Mantenimiento':
        return 'maintenance';
      case 'Inactiva':
        return 'inactive-op';
      default:
        return '';
    }
  }

  formatCapacity(planta: Planta): string {
    if (planta.capacity === undefined || planta.capacity === null) {
      return '-';
    }
    const unit = planta.capacity_unit || 'ton';
    return `${planta.capacity.toLocaleString()} ${unit}`;
  }
}
