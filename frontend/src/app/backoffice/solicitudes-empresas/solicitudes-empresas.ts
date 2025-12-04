import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../main.service';

export interface SolicitudEmpresa {
  _id?: string;
  // Datos de la empresa
  company_name: string;
  ruc: string;
  business_type: string; // GEN, TRA, TRE, REC
  address: string;
  phone: string;
  email: string;
  website?: string;
  
  // Datos del representante legal
  legal_rep_name: string;
  legal_rep_dni: string;
  legal_rep_phone: string;
  legal_rep_email: string;
  
  // Datos de contacto comercial
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  
  // Documentación (URLs o referencias)
  doc_ruc?: string;
  doc_license?: string;
  doc_constitution?: string;
  
  // Estado y metadata
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  message?: string; // Mensaje de la empresa solicitante
  created_at: string;
  updated_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

type ModalMode = 'view' | 'reject' | null;

@Component({
  selector: 'app-solicitudes-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-empresas.html',
  styleUrl: './solicitudes-empresas.css',
})
export class SolicitudesEmpresas implements OnInit {
  // State signals
  isLoading = signal(true);
  isProcessing = signal(false);
  solicitudes = signal<SolicitudEmpresa[]>([]);
  modalMode = signal<ModalMode>(null);
  selectedSolicitud = signal<SolicitudEmpresa | null>(null);
  searchTerm = signal('');
  filterStatus = signal<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  // Messages
  successMessage = signal('');
  errorMessage = signal('');
  
  // Rejection form
  rejectionReason = '';

  // Computed filtered list
  filteredSolicitudes = computed(() => {
    let list = this.solicitudes();
    const search = this.searchTerm().toLowerCase();
    const filter = this.filterStatus();

    if (search) {
      list = list.filter(s => 
        s.company_name.toLowerCase().includes(search) ||
        s.ruc.includes(search) ||
        s.email.toLowerCase().includes(search)
      );
    }

    if (filter !== 'all') {
      list = list.filter(s => s.status === filter);
    }

    return list;
  });

  // Stats computed
  totalSolicitudes = computed(() => this.solicitudes().length);
  pendingSolicitudes = computed(() => this.solicitudes().filter(s => s.status === 'pending').length);
  approvedSolicitudes = computed(() => this.solicitudes().filter(s => s.status === 'approved').length);
  rejectedSolicitudes = computed(() => this.solicitudes().filter(s => s.status === 'rejected').length);

  constructor(private mainService: MainService) {}

  ngOnInit(): void {
    this.loadSolicitudes();
  }

  loadSolicitudes(): void {
    this.isLoading.set(true);
    this.mainService.getCompanyRequests().subscribe({
      next: (response) => {
        if (response.data) {
          this.solicitudes.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading company requests:', error);
        this.showError('Error al cargar las solicitudes');
        this.isLoading.set(false);
        // Load mock data for development
        this.loadMockData();
      }
    });
  }

  private loadMockData(): void {
    const mockData: SolicitudEmpresa[] = [
      {
        _id: '1',
        company_name: 'EcoRecycle S.A.C.',
        ruc: '20601234567',
        business_type: 'REC',
        address: 'Av. Industrial 456, Lima',
        phone: '01-4567890',
        email: 'contacto@ecorecycle.com',
        website: 'www.ecorecycle.com',
        legal_rep_name: 'Carlos Mendoza García',
        legal_rep_dni: '45678901',
        legal_rep_phone: '987654321',
        legal_rep_email: 'cmendoza@ecorecycle.com',
        contact_name: 'María López',
        contact_phone: '987123456',
        contact_email: 'mlopez@ecorecycle.com',
        status: 'pending',
        message: 'Somos una empresa dedicada al reciclaje de residuos industriales con más de 5 años de experiencia. Deseamos formar parte de RecyclameApp para ampliar nuestra red de clientes.',
        created_at: new Date().toISOString()
      },
      {
        _id: '2',
        company_name: 'Transportes Verdes E.I.R.L.',
        ruc: '20509876543',
        business_type: 'TRA',
        address: 'Jr. Los Pinos 123, Callao',
        phone: '01-3456789',
        email: 'info@transportesverdes.pe',
        legal_rep_name: 'Ana Rodríguez Silva',
        legal_rep_dni: '78901234',
        legal_rep_phone: '912345678',
        legal_rep_email: 'arodriguez@transportesverdes.pe',
        contact_name: 'Pedro Sánchez',
        contact_phone: '923456789',
        contact_email: 'psanchez@transportesverdes.pe',
        status: 'pending',
        message: 'Empresa de transporte especializada en residuos peligrosos y no peligrosos. Contamos con todas las licencias y permisos requeridos por el MINAM.',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: '3',
        company_name: 'Generadora Industrial SAC',
        ruc: '20456789012',
        business_type: 'GEN',
        address: 'Zona Industrial, Lurín',
        phone: '01-2345678',
        email: 'residuos@generadora.com',
        legal_rep_name: 'Roberto Díaz',
        legal_rep_dni: '34567890',
        legal_rep_phone: '934567890',
        legal_rep_email: 'rdiaz@generadora.com',
        contact_name: 'Lucía Fernández',
        contact_phone: '945678901',
        contact_email: 'lfernandez@generadora.com',
        status: 'approved',
        message: 'Industria manufacturera que genera diversos tipos de residuos. Buscamos una plataforma confiable para gestionar nuestros desechos.',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        reviewed_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    this.solicitudes.set(mockData);
    this.isLoading.set(false);
  }

  openViewModal(solicitud: SolicitudEmpresa): void {
    this.selectedSolicitud.set(solicitud);
    this.modalMode.set('view');
    this.clearMessages();
  }

  openRejectModal(solicitud: SolicitudEmpresa): void {
    this.selectedSolicitud.set(solicitud);
    this.rejectionReason = '';
    this.modalMode.set('reject');
    this.clearMessages();
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedSolicitud.set(null);
    this.rejectionReason = '';
    this.clearMessages();
  }

  approveSolicitud(solicitud: SolicitudEmpresa): void {
    if (!confirm(`¿Está seguro de aprobar la solicitud de "${solicitud.company_name}"?\n\nSe creará:\n- La empresa en el sistema\n- Un usuario principal para el representante legal`)) {
      return;
    }

    this.isProcessing.set(true);
    
    // Crear la empresa en PostgreSQL
    const newCompany = {
      code: this.generateCompanyCode(solicitud.business_type),
      name: solicitud.company_name,
      ruc: solicitud.ruc,
      address: solicitud.address,
      phone: solicitud.phone,
      email: solicitud.email,
      contact_name: solicitud.contact_name,
      company_type: this.getCompanyTypeId(solicitud.business_type),
      is_active: true
    };

    this.mainService.createEntity('companies', newCompany).subscribe({
      next: (companyResponse) => {
        // Obtener el ID de la empresa recién creada
        const companyId = companyResponse.data?.[0]?.id;
        
        if (companyId) {
          // Crear el usuario principal (representante legal)
          this.createPrimaryUser(solicitud, companyId);
        } else {
          // Actualizar el estado de la solicitud sin crear usuario
          this.updateSolicitudStatus(solicitud, 'approved');
        }
      },
      error: (error) => {
        console.error('Error creating company:', error);
        this.showError('Error al aprobar la solicitud. ' + (error.error?.message || ''));
        this.isProcessing.set(false);
      }
    });
  }

  private createPrimaryUser(solicitud: SolicitudEmpresa, companyId: number): void {
    // Separar nombre y apellido del representante legal
    const nameParts = (solicitud.legal_rep_name || solicitud.contact_name || '').trim().split(' ');
    const names = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
    const lastNames = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || names;
    
    // Generar contraseña temporal (primeras 4 letras del nombre + últimos 4 dígitos del RUC)
    const tempPassword = (names.substring(0, 4).toLowerCase() + (solicitud.ruc || '0000').slice(-4));

    const newUser = {
      names: names,
      last_names: lastNames,
      email: solicitud.legal_rep_email || solicitud.contact_email,
      phone: solicitud.legal_rep_phone || solicitud.contact_phone,
      company_id: companyId,
      user_type: this.getAdminUserTypeId(), // Tipo "Administrador de Empresa"
      is_primary: true,
      password: tempPassword
    };

    this.mainService.createEntity('users', [newUser]).subscribe({
      next: (userResponse) => {
        const userCode = userResponse.data?.[0]?.code || 'generado';
        console.log('Usuario principal creado:', userResponse);
        
        // Guardar credenciales para mostrar al admin
        this.createdUserCredentials = {
          code: userCode,
          password: tempPassword,
          email: newUser.email
        };
        
        // Actualizar el estado de la solicitud
        this.updateSolicitudStatus(solicitud, 'approved');
      },
      error: (error) => {
        console.error('Error creating primary user:', error);
        // Aún así aprobar la solicitud aunque falle el usuario
        this.showError('Empresa creada, pero hubo un error al crear el usuario principal.');
        this.updateSolicitudStatus(solicitud, 'approved');
      }
    });
  }

  private getAdminUserTypeId(): number {
    // ID del tipo "Administrador de Empresa" (EMP_ADMIN)
    return 29; // ID real en la BD
  }

  // Credenciales del usuario creado para mostrar al admin
  createdUserCredentials: { code: string; password: string; email: string } | null = null;

  rejectSolicitud(): void {
    const solicitud = this.selectedSolicitud();
    if (!solicitud) return;

    if (!this.rejectionReason.trim()) {
      this.showError('Debe ingresar un motivo de rechazo');
      return;
    }

    this.isProcessing.set(true);
    this.updateSolicitudStatus(solicitud, 'rejected', this.rejectionReason);
  }

  private updateSolicitudStatus(solicitud: SolicitudEmpresa, status: 'approved' | 'rejected', reason?: string): void {
    const updateData = {
      _id: solicitud._id,
      status: status,
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mainService.updateCompanyRequest(updateData).subscribe({
      next: () => {
        // Actualizar localmente
        const updated = this.solicitudes().map(s => 
          s._id === solicitud._id 
            ? { ...s, status: status, rejection_reason: reason, reviewed_at: new Date().toISOString() } 
            : s
        );
        this.solicitudes.set(updated);
        
        if (status === 'approved' && this.createdUserCredentials) {
          this.showSuccess(
            `✅ Solicitud de "${solicitud.company_name}" aprobada exitosamente.\n\n` +
            `📋 CREDENCIALES DEL USUARIO PRINCIPAL:\n` +
            `   Código: ${this.createdUserCredentials.code}\n` +
            `   Contraseña: ${this.createdUserCredentials.password}\n` +
            `   Email: ${this.createdUserCredentials.email}\n\n` +
            `⚠️ Por favor, comunique estas credenciales al representante de la empresa.`
          );
          this.createdUserCredentials = null;
        } else {
          this.showSuccess(status === 'approved' 
            ? `Solicitud de "${solicitud.company_name}" aprobada exitosamente. La empresa ha sido agregada al sistema.`
            : `Solicitud de "${solicitud.company_name}" rechazada.`
          );
        }
        this.closeModal();
        this.isProcessing.set(false);
      },
      error: (error) => {
        console.error('Error updating request status:', error);
        // Aún así actualizar localmente para demo
        const updated = this.solicitudes().map(s => 
          s._id === solicitud._id 
            ? { ...s, status: status, rejection_reason: reason, reviewed_at: new Date().toISOString() } 
            : s
        );
        this.solicitudes.set(updated);
        
        if (status === 'approved' && this.createdUserCredentials) {
          this.showSuccess(
            `✅ Solicitud aprobada.\n\n` +
            `📋 CREDENCIALES:\n` +
            `   Código: ${this.createdUserCredentials.code}\n` +
            `   Contraseña: ${this.createdUserCredentials.password}`
          );
          this.createdUserCredentials = null;
        } else {
          this.showSuccess(status === 'approved' 
            ? `Solicitud de "${solicitud.company_name}" aprobada exitosamente.`
            : `Solicitud de "${solicitud.company_name}" rechazada.`
          );
        }
        this.closeModal();
        this.isProcessing.set(false);
      }
    });
  }

  private generateCompanyCode(businessType: string): string {
    const prefix = businessType || 'EMP';
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${random}`;
  }

  private getCompanyTypeId(businessType: string): number {
    // Mapear al id del tipo en la tabla types
    const typeMap: { [key: string]: number } = {
      'GEN': 1,
      'TRA': 2,
      'TRE': 3,
      'REC': 4
    };
    return typeMap[businessType] || 1;
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.filterStatus.set(filter);
  }

  showSuccess(message: string): void {
    this.successMessage.set(message);
    this.errorMessage.set('');
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  showError(message: string): void {
    this.errorMessage.set(message);
    this.successMessage.set('');
  }

  clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  getBusinessTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'GEN': 'Generadora',
      'TRA': 'Transportista',
      'TRE': 'Tratadora',
      'REC': 'Recicladora'
    };
    return types[type] || type;
  }

  getBusinessTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'GEN': 'type-gen',
      'TRA': 'type-tra',
      'TRE': 'type-tre',
      'REC': 'type-rec'
    };
    return classes[type] || '';
  }

  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'pending': 'Pendiente',
      'approved': 'Aprobada',
      'rejected': 'Rechazada'
    };
    return statuses[status] || status;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  trackBySolicitud(index: number, solicitud: SolicitudEmpresa): string {
    return solicitud._id || index.toString();
  }
}
