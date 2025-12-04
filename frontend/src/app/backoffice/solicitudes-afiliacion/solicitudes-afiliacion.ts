import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../main.service';

// Interfaz para la estructura de módulos/permisos
export interface ModulesPermissions {
  dashboard: boolean;
  companies: boolean;
  users: boolean;
  residues: boolean;
  plants: boolean;
  operations: boolean;
  affiliation_requests: boolean;
  company_requests: boolean;
  settings: boolean;
}

// Interfaz para permisos granulares por entidad
export interface EntityPermission {
  entity: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

// Interfaz para solicitud de afiliación
export interface SolicitudAfiliacion {
  _id?: string;
  code?: string;
  company_id: number;
  company_name?: string;
  applicant_user_id: number;
  applicant_user_name?: string;
  applicant_user_email?: string;
  applicant_user_code?: string;
  requested_role?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by_id?: number;
  approved_at?: string;
  rejected_by_id?: number;
  rejected_at?: string;
  assigned_permissions?: ModulesPermissions;
  created_at?: string;
  updated_at?: string;
  created_user_id?: number;
}

// Interfaz para usuario afiliado con permisos
export interface UsuarioAfiliado {
  _id?: string;
  user_id: number;
  user_name?: string;
  user_email?: string;
  user_code?: string;
  company_id: number;
  company_name?: string;
  role: string;
  is_primary?: boolean;
  modules: ModulesPermissions;
  permissions: EntityPermission[];
  restrictions?: {
    can_approve_affiliations: boolean;
    can_manage_permissions: boolean;
    max_operations_per_day?: number;
  };
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

type ModalMode = 'view' | 'reject' | 'permissions' | null;
type TabMode = 'solicitudes' | 'usuarios';

@Component({
  selector: 'app-solicitudes-afiliacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-afiliacion.html',
  styleUrl: './solicitudes-afiliacion.css',
})
export class SolicitudesAfiliacion implements OnInit {
  // State signals
  isLoading = signal(true);
  isProcessing = signal(false);
  currentTab = signal<TabMode>('solicitudes');
  
  // Solicitudes
  solicitudes = signal<SolicitudAfiliacion[]>([]);
  modalMode = signal<ModalMode>(null);
  selectedSolicitud = signal<SolicitudAfiliacion | null>(null);
  searchTerm = signal('');
  filterStatus = signal<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  // Usuarios afiliados
  usuariosAfiliados = signal<UsuarioAfiliado[]>([]);
  selectedUsuario = signal<UsuarioAfiliado | null>(null);
  searchTermUsuarios = signal('');
  
  // Empresa actual (para filtrar por empresa del admin)
  currentCompanyId = signal<number>(0);
  currentUserId = signal<number>(0);
  isAdmin = signal<boolean>(false); // Es administrador del sistema
  isPrimary = signal<boolean>(false); // Es usuario principal de empresa
  
  // Messages
  successMessage = signal('');
  errorMessage = signal('');
  
  // Form data
  rejectionReason = '';
  
  // Permisos temporales para edición
  tempModules: ModulesPermissions = this.getDefaultModules();
  tempPermissions: EntityPermission[] = [];
  tempRestrictions = {
    can_approve_affiliations: false,
    can_manage_permissions: false
  };

  // Lista de módulos disponibles para el UI
  modulesList = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'companies', label: 'Empresas', icon: 'building' },
    { key: 'users', label: 'Usuarios', icon: 'users' },
    // { key: 'residues', label: 'Residuos', icon: 'recycle' }, // MÓDULO DESHABILITADO
    { key: 'plants', label: 'Plantas', icon: 'factory' },
    { key: 'operations', label: 'Operaciones', icon: 'clipboard' },
    { key: 'affiliation_requests', label: 'Solicitudes de Afiliación', icon: 'user-plus' },
    { key: 'company_requests', label: 'Solicitudes de Empresas', icon: 'building-plus' },
    { key: 'settings', label: 'Configuración', icon: 'settings' }
  ];

  // Lista de empresas para filtrar (solo admin)
  empresasList: { id: number; name: string }[] = [];
  filterCompanyId = signal<number | null>(null);

  // Computed filtered lists
  filteredSolicitudes = computed(() => {
    let list = this.solicitudes();
    const search = this.searchTerm().toLowerCase();
    const filter = this.filterStatus();

    if (search) {
      list = list.filter(s => 
        (s.company_name || '').toLowerCase().includes(search) ||
        (s.applicant_user_name || '').toLowerCase().includes(search) ||
        (s.applicant_user_email || '').toLowerCase().includes(search) ||
        (s.applicant_user_code || '').includes(search)
      );
    }

    if (filter !== 'all') {
      list = list.filter(s => s.status === filter);
    }

    return list;
  });

  filteredUsuarios = computed(() => {
    let list = this.usuariosAfiliados();
    const search = this.searchTermUsuarios().toLowerCase();
    const companyFilter = this.filterCompanyId();

    // Filtrar por empresa si hay un filtro seleccionado
    if (companyFilter) {
      list = list.filter(u => u.company_id === companyFilter);
    }

    if (search) {
      list = list.filter(u => 
        (u.user_name || '').toLowerCase().includes(search) ||
        (u.user_email || '').toLowerCase().includes(search) ||
        (u.user_code || '').includes(search) ||
        (u.role || '').toLowerCase().includes(search) ||
        (u.company_name || '').toLowerCase().includes(search)
      );
    }

    return list;
  });

  // Stats computed
  totalSolicitudes = computed(() => this.solicitudes().length);
  pendingSolicitudes = computed(() => this.solicitudes().filter(s => s.status === 'pending').length);
  approvedSolicitudes = computed(() => this.solicitudes().filter(s => s.status === 'approved').length);
  rejectedSolicitudes = computed(() => this.solicitudes().filter(s => s.status === 'rejected').length);
  totalUsuarios = computed(() => this.usuariosAfiliados().length);
  activeUsuarios = computed(() => this.usuariosAfiliados().filter(u => u.is_active).length);

  constructor(private mainService: MainService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSolicitudes();
    this.loadUsuariosAfiliados();
    this.loadEmpresas();
  }

  private loadCurrentUser(): void {
    const user = this.mainService.currentUser();
    if (user) {
      this.currentUserId.set(user.id);
      this.currentCompanyId.set(user.company_id);
      
      // Determinar si es admin o principal
      const userType = user.user_type;
      const userTypeAbbr = (user as any).user_type_abbr;
      this.isAdmin.set(userType === 9 || userTypeAbbr === 'ADM');
      this.isPrimary.set((user as any).is_primary || userType === 31 || userTypeAbbr === 'PRI');
    }
  }

  private loadEmpresas(): void {
    if (!this.isAdmin()) return;
    
    this.mainService.getCompanies().subscribe({
      next: (response) => {
        if (response.data) {
          this.empresasList = response.data.map((e: any) => ({
            id: e.id,
            name: e.name
          }));
        }
      },
      error: (err) => console.error('Error loading companies:', err)
    });
  }

  filterByCompany(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const companyId = select.value ? parseInt(select.value) : null;
    this.filterCompanyId.set(companyId);
  }

  getEmpresaNombre(companyId?: number): string {
    if (!companyId) return 'Sin empresa';
    const empresa = this.empresasList.find(e => e.id === companyId);
    return empresa ? empresa.name : `Empresa ${companyId}`;
  }

  getDefaultModules(): ModulesPermissions {
    return {
      dashboard: true,
      companies: false,
      users: false,
      residues: false,
      plants: false,
      operations: false,
      affiliation_requests: false,
      company_requests: false,
      settings: false
    };
  }

  loadSolicitudes(): void {
    this.isLoading.set(true);
    // Por ahora cargar sin filtro para desarrollo, luego filtrar por company_id
    const filter = {};
    
    console.log('[SolicitudesAfiliacion] Loading solicitudes with filter:', filter);
    
    this.mainService.getAffiliationRequests(filter).subscribe({
      next: (response) => {
        console.log('[SolicitudesAfiliacion] API Response:', response);
        if (response.data) {
          // Mapear datos del backend al formato esperado por el frontend
          const mappedData = this.mapSolicitudesFromBackend(response.data);
          console.log('[SolicitudesAfiliacion] Mapped data:', mappedData);
          this.solicitudes.set(mappedData);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('[SolicitudesAfiliacion] Error loading affiliation requests:', error);
        this.showError('Error al cargar las solicitudes de afiliación');
        this.isLoading.set(false);
        // Load mock data for development
        this.loadMockSolicitudes();
      }
    });
  }

  // Mapear datos del backend al formato del frontend
  private mapSolicitudesFromBackend(data: any[]): SolicitudAfiliacion[] {
    return data.map(item => ({
      _id: item._id,
      code: item.code,
      company_id: item.company_id,
      company_name: item.company_name || item.company_id, // Usar company_id como fallback
      applicant_user_id: item.applicant?.user_id || item.applicant_user_id,
      applicant_user_name: item.applicant?.name || item.applicant_user_name,
      applicant_user_email: item.applicant?.email || item.applicant_user_email,
      applicant_user_code: item.applicant?.user_id || item.applicant_user_code,
      requested_role: item.applicant?.requested_role || item.requested_role,
      message: item.message,
      status: item.status,
      rejection_reason: item.rejection_reason,
      approved_by_id: item.approved_by_id,
      approved_at: item.reviewed_at || item.approved_at,
      rejected_by_id: item.rejected_by_id,
      rejected_at: item.reviewed_at || item.rejected_at,
      assigned_permissions: item.modules || item.assigned_permissions,
      created_at: item.createdAt || item.created_at,
      updated_at: item.updatedAt || item.updated_at
    }));
  }

  loadUsuariosAfiliados(): void {
    // Cargar usuarios SECUNDARIOS desde PostgreSQL (user_type=32)
    const filter: any[] = [{ user_type: 32 }];
    
    // Si no es admin, filtrar también por empresa
    if (!this.isAdmin() && this.currentCompanyId() > 0) {
      filter[0].company_id = this.currentCompanyId();
    }
    
    console.log('[Afiliación] Cargando usuarios secundarios desde PostgreSQL:', filter);
    
    this.mainService.getUsers(filter).subscribe({
      next: (response) => {
        console.log('[Afiliación] Usuarios secundarios cargados:', response.data);
        if (response.data && Array.isArray(response.data)) {
          // Mapear usuarios de PostgreSQL al formato UsuarioAfiliado
          const mappedUsers = (response.data as any[]).map(u => {
            return {
              _id: String(u.id),
              user_id: u.id,
              user_name: u.name || `${u.names || ''} ${u.last_names || ''}`.trim(),
              user_email: u.email || '',
              user_code: u.code || '',
              company_id: u.company_id,
              company_name: u.company_name || '',
              role: u.user_type_name || 'Secundario',
              is_primary: false,
              modules: this.getDefaultModules(), // Por defecto, luego se cargan de MongoDB
              permissions: [],
              restrictions: {
                can_approve_affiliations: false,
                can_manage_permissions: false
              },
              is_active: u.is_active !== false,
              created_at: u.created_at
            };
          });
          
          this.usuariosAfiliados.set(mappedUsers as UsuarioAfiliado[]);
          
          // Cargar permisos de módulos desde MongoDB (user_permissions)
          this.loadUserPermissions(mappedUsers.map(u => u.user_id));
        }
      },
      error: (error) => {
        console.error('Error loading secondary users:', error);
        this.loadMockUsuarios();
      }
    });
  }

  // Cargar permisos de módulos desde MongoDB
  private loadUserPermissions(userIds: number[]): void {
    if (userIds.length === 0) return;
    
    this.mainService.getUserPermissions({ user_id: { $in: userIds } }).subscribe({
      next: (response) => {
        console.log('[Afiliación] Permisos cargados:', response.data);
        if (response.data && Array.isArray(response.data)) {
          // Crear mapa de permisos por user_id
          const permissionsMap = new Map<number, any>();
          response.data.forEach((p: any) => {
            permissionsMap.set(p.user_id, p);
          });
          
          // Actualizar usuarios con sus permisos
          const updatedUsers = this.usuariosAfiliados().map(u => {
            const perms = permissionsMap.get(u.user_id);
            if (perms) {
              return {
                ...u,
                modules: perms.modules || this.getDefaultModules(),
                restrictions: perms.restrictions || u.restrictions
              };
            }
            return u;
          });
          
          this.usuariosAfiliados.set(updatedUsers);
        }
      },
      error: (error) => {
        console.log('[Afiliación] No hay permisos guardados aún (esto es normal):', error.message);
      }
    });
  }

  private loadMockSolicitudes(): void {
    const mockData: SolicitudAfiliacion[] = [
      {
        _id: '1',
        code: 'AFIL001',
        company_id: 1,
        company_name: 'EcoRecycle S.A.C.',
        applicant_user_id: 10,
        applicant_user_name: 'Juan Pérez García',
        applicant_user_email: 'jperez@example.com',
        applicant_user_code: 'USR10',
        requested_role: 'Operador',
        message: 'Solicito acceso al sistema para gestionar las operaciones de residuos de mi área.',
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        _id: '2',
        code: 'AFIL002',
        company_id: 1,
        company_name: 'EcoRecycle S.A.C.',
        applicant_user_id: 11,
        applicant_user_name: 'María López Sánchez',
        applicant_user_email: 'mlopez@example.com',
        applicant_user_code: 'USR11',
        requested_role: 'Supervisor',
        message: 'Necesito acceso para supervisar las operaciones del área de tratamiento.',
        status: 'pending',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: '3',
        code: 'AFIL003',
        company_id: 1,
        company_name: 'EcoRecycle S.A.C.',
        applicant_user_id: 12,
        applicant_user_name: 'Carlos Mendoza',
        applicant_user_email: 'cmendoza@example.com',
        applicant_user_code: 'USR12',
        requested_role: 'Consultor',
        status: 'approved',
        approved_at: new Date(Date.now() - 172800000).toISOString(),
        created_at: new Date(Date.now() - 259200000).toISOString()
      }
    ];
    this.solicitudes.set(mockData);
    this.isLoading.set(false);
  }

  private loadMockUsuarios(): void {
    const mockData: UsuarioAfiliado[] = [
      {
        _id: 'auth1',
        user_id: 5,
        user_name: 'Admin Principal',
        user_email: 'admin@ecorecycle.com',
        user_code: 'ADM001',
        company_id: 1,
        company_name: 'EcoRecycle S.A.C.',
        role: 'Administrador',
        is_primary: true,
        modules: {
          dashboard: true,
          companies: true,
          users: true,
          residues: true,
          plants: true,
          operations: true,
          affiliation_requests: true,
          company_requests: true,
          settings: true
        },
        permissions: [],
        restrictions: {
          can_approve_affiliations: true,
          can_manage_permissions: true
        },
        is_active: true,
        created_at: new Date(Date.now() - 2592000000).toISOString()
      },
      {
        _id: 'auth2',
        user_id: 12,
        user_name: 'Carlos Mendoza',
        user_email: 'cmendoza@example.com',
        user_code: 'USR12',
        company_id: 1,
        company_name: 'EcoRecycle S.A.C.',
        role: 'Consultor',
        is_primary: false,
        modules: {
          dashboard: true,
          companies: false,
          users: false,
          residues: true,
          plants: true,
          operations: true,
          affiliation_requests: false,
          company_requests: false,
          settings: false
        },
        permissions: [],
        restrictions: {
          can_approve_affiliations: false,
          can_manage_permissions: false
        },
        is_active: true,
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    this.usuariosAfiliados.set(mockData);
  }

  // Tab navigation
  setTab(tab: TabMode): void {
    this.currentTab.set(tab);
    this.clearMessages();
  }

  // Solicitudes modals
  openViewModal(solicitud: SolicitudAfiliacion): void {
    this.selectedSolicitud.set(solicitud);
    this.modalMode.set('view');
    this.clearMessages();
  }

  openRejectModal(solicitud: SolicitudAfiliacion): void {
    this.selectedSolicitud.set(solicitud);
    this.rejectionReason = '';
    this.modalMode.set('reject');
    this.clearMessages();
  }

  openPermissionsModal(usuario: UsuarioAfiliado): void {
    this.selectedUsuario.set(usuario);
    // Copiar permisos actuales a variables temporales
    this.tempModules = { ...usuario.modules };
    this.tempPermissions = usuario.permissions ? [...usuario.permissions] : [];
    this.tempRestrictions = usuario.restrictions ? { ...usuario.restrictions } : {
      can_approve_affiliations: false,
      can_manage_permissions: false
    };
    this.modalMode.set('permissions');
    this.clearMessages();
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedSolicitud.set(null);
    this.selectedUsuario.set(null);
    this.rejectionReason = '';
    this.clearMessages();
  }

  // Aprobar solicitud
  approveSolicitud(solicitud: SolicitudAfiliacion): void {
    // Preparar permisos por defecto
    this.selectedSolicitud.set(solicitud);
    this.tempModules = this.getDefaultModules();
    this.tempRestrictions = {
      can_approve_affiliations: false,
      can_manage_permissions: false
    };
    this.modalMode.set('permissions');
    this.clearMessages();
  }

  confirmApproval(): void {
    const solicitud = this.selectedSolicitud();
    if (!solicitud) return;

    this.isProcessing.set(true);
    
    // Separar nombres si vienen juntos
    const fullName = solicitud.applicant_user_name || '';
    const nameParts = fullName.split(' ');
    const names = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
    const lastNames = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || names;

    // Usar el nuevo endpoint que crea el usuario real en PostgreSQL
    const approveData = {
      affiliationRequestId: solicitud._id!,
      names: names,
      last_names: lastNames,
      email: solicitud.applicant_user_email || '',
      phone: undefined, // Se puede agregar si está disponible
      company_id: typeof solicitud.company_id === 'string' 
        ? parseInt(solicitud.company_id) || 1 
        : solicitud.company_id,
      password: 'temp1234', // Contraseña temporal
      modules: this.tempModules
    };

    console.log('[Afiliación] Aprobando solicitud y creando usuario:', approveData);

    this.mainService.approveAndCreateUser(approveData).subscribe({
      next: (response) => {
        console.log('[Afiliación] Usuario creado exitosamente:', response);
        this.updateLocalSolicitud(solicitud, 'approved');
        this.loadUsuariosAfiliados();
        
        const userCode = response.data?.user?.code || 'nuevo';
        this.showSuccess(`✅ Usuario ${userCode} creado exitosamente. Contraseña temporal: temp1234. El usuario ahora puede acceder al sistema según los permisos configurados.`);
        this.closeModal();
        this.isProcessing.set(false);
      },
      error: (error) => {
        console.error('[Afiliación] Error al crear usuario:', error);
        
        // Fallback: Solo actualizar la solicitud sin crear usuario (para demo/desarrollo)
        const fallbackData = {
          _id: solicitud._id,
          status: 'approved',
          approved_by_id: this.currentUserId(),
          approved_at: new Date().toISOString(),
          assigned_permissions: this.tempModules
        };

        this.mainService.updateAffiliationRequest(fallbackData).subscribe({
          next: () => {
            this.updateLocalSolicitud(solicitud, 'approved');
            this.showSuccess(`Solicitud aprobada. Nota: El usuario debe ser creado manualmente en el módulo de Usuarios.`);
            this.closeModal();
            this.isProcessing.set(false);
          },
          error: () => {
            // Demo mode - actualizar localmente
            this.updateLocalSolicitud(solicitud, 'approved');
            this.showSuccess(`Solicitud aprobada (modo demo).`);
            this.closeModal();
            this.isProcessing.set(false);
          }
        });
      }
    });
  }

  private updateLocalSolicitud(solicitud: SolicitudAfiliacion, status: 'approved' | 'rejected'): void {
    const updated = this.solicitudes().map(s => 
      s._id === solicitud._id 
        ? { 
            ...s, 
            status: status, 
            rejection_reason: status === 'rejected' ? this.rejectionReason : undefined,
            approved_at: status === 'approved' ? new Date().toISOString() : undefined,
            rejected_at: status === 'rejected' ? new Date().toISOString() : undefined
          } 
        : s
    );
    this.solicitudes.set(updated);
  }

  rejectSolicitud(): void {
    const solicitud = this.selectedSolicitud();
    if (!solicitud) return;

    if (!this.rejectionReason.trim()) {
      this.showError('Debe ingresar un motivo de rechazo');
      return;
    }

    this.isProcessing.set(true);
    
    const rejectData = {
      _id: solicitud._id,
      status: 'rejected',
      rejected_by_id: this.currentUserId(),
      rejected_at: new Date().toISOString(),
      rejection_reason: this.rejectionReason
    };

    this.mainService.updateAffiliationRequest(rejectData).subscribe({
      next: () => {
        this.updateLocalSolicitud(solicitud, 'rejected');
        this.showSuccess(`Solicitud de "${solicitud.applicant_user_name}" rechazada.`);
        this.closeModal();
        this.isProcessing.set(false);
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        this.updateLocalSolicitud(solicitud, 'rejected');
        this.showSuccess(`Solicitud rechazada (demo).`);
        this.closeModal();
        this.isProcessing.set(false);
      }
    });
  }

  // Guardar permisos de usuario en MongoDB (user_permissions)
  saveUserPermissions(): void {
    const usuario = this.selectedUsuario();
    if (!usuario) return;

    this.isProcessing.set(true);

    // Buscar si ya existe un registro de permisos para este usuario
    this.mainService.getUserPermissions({ user_id: usuario.user_id }).subscribe({
      next: (response) => {
        const existingPermission = response.data && response.data.length > 0 ? response.data[0] : null;
        
        if (existingPermission) {
          // Actualizar permisos existentes
          const updateData = {
            _id: existingPermission._id,
            modules: this.tempModules,
            restrictions: this.tempRestrictions,
            updated_at: new Date().toISOString()
          };
          
          this.mainService.updateUserPermission(updateData).subscribe({
            next: () => this.onPermissionsSaved(usuario),
            error: (err) => this.onPermissionsError(err, usuario)
          });
        } else {
          // Crear nuevo registro de permisos
          const createData = {
            user_id: usuario.user_id,
            user_code: usuario.user_code,
            user_name: usuario.user_name,
            company_id: usuario.company_id,
            modules: this.tempModules,
            restrictions: this.tempRestrictions,
            created_at: new Date().toISOString()
          };
          
          this.mainService.createUserPermission(createData).subscribe({
            next: () => this.onPermissionsSaved(usuario),
            error: (err) => this.onPermissionsError(err, usuario)
          });
        }
      },
      error: (error) => {
        // Si falla la búsqueda, intentar crear nuevo
        const createData = {
          user_id: usuario.user_id,
          user_code: usuario.user_code,
          user_name: usuario.user_name,
          company_id: usuario.company_id,
          modules: this.tempModules,
          restrictions: this.tempRestrictions,
          created_at: new Date().toISOString()
        };
        
        this.mainService.createUserPermission(createData).subscribe({
          next: () => this.onPermissionsSaved(usuario),
          error: (err) => this.onPermissionsError(err, usuario)
        });
      }
    });
  }

  private onPermissionsSaved(usuario: UsuarioAfiliado): void {
    // Actualizar localmente
    const updated = this.usuariosAfiliados().map(u => 
      u.user_id === usuario.user_id 
        ? { 
            ...u, 
            modules: { ...this.tempModules },
            restrictions: { ...this.tempRestrictions }
          } 
        : u
    );
    this.usuariosAfiliados.set(updated);
    this.showSuccess(`Permisos de "${usuario.user_name}" actualizados correctamente.`);
    this.closeModal();
    this.isProcessing.set(false);
  }

  private onPermissionsError(error: any, usuario: UsuarioAfiliado): void {
    console.error('Error saving permissions:', error);
    // Actualizar localmente de todos modos (para que el usuario vea el cambio)
    const updated = this.usuariosAfiliados().map(u => 
      u.user_id === usuario.user_id 
        ? { 
            ...u, 
            modules: { ...this.tempModules },
            restrictions: { ...this.tempRestrictions }
          } 
        : u
    );
    this.usuariosAfiliados.set(updated);
    this.showSuccess(`Permisos actualizados localmente.`);
    this.closeModal();
    this.isProcessing.set(false);
  }

  // Toggle usuario activo/inactivo
  toggleUsuarioActive(usuario: UsuarioAfiliado): void {
    if (usuario.is_primary) {
      this.showError('No se puede desactivar al usuario principal de la empresa.');
      return;
    }

    const newStatus = !usuario.is_active;
    const action = newStatus ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Está seguro de ${action} al usuario "${usuario.user_name}"?`)) {
      return;
    }

    const updateData = {
      _id: usuario._id,
      is_active: newStatus,
      updated_at: new Date().toISOString()
    };

    this.mainService.updateAuthorizedOperation(updateData).subscribe({
      next: () => {
        const updated = this.usuariosAfiliados().map(u => 
          u._id === usuario._id ? { ...u, is_active: newStatus } : u
        );
        this.usuariosAfiliados.set(updated);
        this.showSuccess(`Usuario "${usuario.user_name}" ${newStatus ? 'activado' : 'desactivado'}.`);
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        // Demo mode
        const updated = this.usuariosAfiliados().map(u => 
          u._id === usuario._id ? { ...u, is_active: newStatus } : u
        );
        this.usuariosAfiliados.set(updated);
        this.showSuccess(`Usuario ${newStatus ? 'activado' : 'desactivado'} (demo).`);
      }
    });
  }

  // Toggle módulo individual
  toggleModule(moduleKey: string): void {
    (this.tempModules as any)[moduleKey] = !(this.tempModules as any)[moduleKey];
  }

  // Verificar si un módulo está activo (helper para el template)
  isModuleActive(moduleKey: string): boolean {
    return (this.tempModules as any)[moduleKey] === true;
  }

  // Toggle all modules
  toggleAllModules(value: boolean): void {
    Object.keys(this.tempModules).forEach(key => {
      (this.tempModules as any)[key] = value;
    });
  }

  // Helpers
  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  updateSearchUsuarios(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTermUsuarios.set(input.value);
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

  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'pending': 'Pendiente',
      'approved': 'Aprobada',
      'rejected': 'Rechazada'
    };
    return statuses[status] || status;
  }

  getRoleClass(role: string): string {
    const roleMap: { [key: string]: string } = {
      'Administrador': 'role-admin',
      'Supervisor': 'role-supervisor',
      'Operador': 'role-operator',
      'Consultor': 'role-consultant',
      'Usuario': 'role-user'
    };
    return roleMap[role] || 'role-user';
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

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  countActiveModules(modules: ModulesPermissions | undefined): number {
    if (!modules) return 0;
    return Object.values(modules).filter(v => v === true).length;
  }

  getActiveModulesCount(): number {
    return Object.values(this.tempModules).filter(v => v === true).length;
  }

  trackBySolicitud(index: number, solicitud: SolicitudAfiliacion): string {
    return solicitud._id || solicitud.code || `sol-${index}`;
  }

  trackByUsuario(index: number, usuario: UsuarioAfiliado): string {
    return usuario._id || `usr-${usuario.user_id}-${index}`;
  }

  trackByModule(index: number, module: any): string {
    return module.key;
  }
}
