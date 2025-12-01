import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../main.service';

interface Residuo {
  _id?: string;
  id?: number;
  company_id: number;
  name: string;
  residue_type: number;
  residue_type_name?: string;
  status_type?: number;
  status_type_name?: string;
  quantity: number;
  unit_measurement?: number;
  unit_measurement_name?: string;
  status: number;
  status_name?: string;
  plant_id?: number;
  plant_name?: string;
  user_operator?: number;
  user_operator_name?: string;
  status_active: boolean;
  created_at?: string;
}

type ModalMode = 'create' | 'edit' | 'view' | null;

@Component({
  selector: 'app-residuos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './residuos.html',
  styleUrl: './residuos.css',
})
export class Residuos implements OnInit {
  // State signals
  isLoading = signal(true);
  isSaving = signal(false);
  residuos = signal<Residuo[]>([]);
  modalMode = signal<ModalMode>(null);
  selectedResiduo = signal<Residuo | null>(null);
  searchTerm = signal('');
  filterActive = signal<'all' | 'active' | 'inactive'>('all');
  
  // Messages
  successMessage = signal('');
  errorMessage = signal('');

  // Form model
  formData: Partial<Residuo> = {};

  // Residue type options for select
  residueTypes = [
    { code: 'ORG', name: 'Orgánico' },
    { code: 'PLA', name: 'Plástico' },
    { code: 'PAP', name: 'Papel' },
    { code: 'VID', name: 'Vidrio' },
    { code: 'MET', name: 'Metal' },
    { code: 'ELE', name: 'Electrónico' },
    { code: 'PEL', name: 'Peligroso' }
  ];

  // Unit options
  unitOptions = ['kg', 'ton', 'lt', 'm³', 'unidad'];

  // Computed filtered list
  filteredResiduos = computed(() => {
    let list = this.residuos();
    const search = this.searchTerm().toLowerCase();
    const filter = this.filterActive();

    if (search) {
      list = list.filter(r => 
        r.name.toLowerCase().includes(search) ||
        (r.residue_type_name || '').toLowerCase().includes(search)
      );
    }

    if (filter === 'active') {
      list = list.filter(r => r.status_active);
    } else if (filter === 'inactive') {
      list = list.filter(r => !r.status_active);
    }

    return list;
  });

  // Stats computed
  totalResiduos = computed(() => this.residuos().length);
  activeResiduos = computed(() => this.residuos().filter(r => r.status_active).length);
  inactiveResiduos = computed(() => this.residuos().filter(r => !r.status_active).length);

  constructor(private mainService: MainService) {}

  ngOnInit(): void {
    this.loadResiduos();
  }

  loadResiduos(): void {
    this.isLoading.set(true);
    this.mainService.getResidues().subscribe({
      next: (response) => {
        if (response.data) {
          this.residuos.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading residues:', error);
        this.showError('Error al cargar los residuos');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.formData = {
      company_id: 1,
      name: '',
      residue_type: 12,
      residue_type_name: 'Plástico',
      quantity: 0,
      status: 13,
      status_name: 'Pendiente',
      status_active: true
    };
    this.modalMode.set('create');
    this.clearMessages();
  }

  openEditModal(residuo: Residuo): void {
    this.formData = { ...residuo };
    this.selectedResiduo.set(residuo);
    this.modalMode.set('edit');
    this.clearMessages();
  }

  openViewModal(residuo: Residuo): void {
    this.selectedResiduo.set(residuo);
    this.modalMode.set('view');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedResiduo.set(null);
    this.formData = {};
    this.clearMessages();
  }

  saveResiduo(): void {
    if (!this.validateForm()) return;

    this.isSaving.set(true);
    const mode = this.modalMode();

    if (mode === 'create') {
      this.mainService.createResidue(this.formData).subscribe({
        next: (response) => {
          if (response.data) {
            this.showSuccess('Residuo creado exitosamente');
            this.loadResiduos();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error creating residue:', error);
          this.showError('Error al crear el residuo');
          this.isSaving.set(false);
        }
      });
    } else if (mode === 'edit') {
      this.mainService.updateResidue(this.formData).subscribe({
        next: (response) => {
          if (response.data) {
            this.showSuccess('Residuo actualizado exitosamente');
            this.loadResiduos();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error updating residue:', error);
          this.showError('Error al actualizar el residuo');
          this.isSaving.set(false);
        }
      });
    }
  }

  toggleActive(residuo: Residuo): void {
    const updated = { ...residuo, status_active: !residuo.status_active };
    this.mainService.updateResidue(updated).subscribe({
      next: () => {
        this.showSuccess(`Residuo ${updated.status_active ? 'activado' : 'desactivado'} exitosamente`);
        this.loadResiduos();
      },
      error: (error) => {
        console.error('Error toggling residue status:', error);
        this.showError('Error al cambiar el estado del residuo');
      }
    });
  }

  validateForm(): boolean {
    if (!this.formData.name?.trim()) {
      this.showError('El nombre es obligatorio');
      return false;
    }
    if (!this.formData.quantity || this.formData.quantity <= 0) {
      this.showError('La cantidad debe ser mayor a 0');
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

  getResidueTypeLabel(typeName?: string): string {
    return typeName || 'No definido';
  }

  getResidueTypeBadgeClass(typeName?: string): string {
    const typeClasses: { [key: string]: string } = {
      'Orgánico': 'type-organico',
      'Plástico': 'type-plastico',
      'Plastico': 'type-plastico',
      'Papel': 'type-papel',
      'Vidrio': 'type-vidrio',
      'Metal': 'type-metal',
      'Electrónico': 'type-electronico',
      'Peligroso': 'type-peligroso'
    };
    return typeName ? typeClasses[typeName] || '' : '';
  }

  formatQuantity(quantity?: number): string {
    if (quantity === undefined || quantity === null) return '-';
    return `${quantity.toLocaleString()} kg`;
  }

  getStatusClass(statusName?: string): string {
    const statusClasses: { [key: string]: string } = {
      'Pendiente': 'status-pending',
      'En Proceso': 'status-processing',
      'Procesado': 'status-completed',
      'Rechazado': 'status-rejected'
    };
    return statusName ? statusClasses[statusName] || '' : '';
  }
}
