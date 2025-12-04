import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface User {
  id: number;
  code: string;
  names: string;
  last_names: string;
  email: string;
  company_id: number;
  user_type: number;
  user_type_abbr?: string;
  user_type_name?: string;
  is_primary?: boolean;
  token?: string;
  permissions?: UserPermissions;
}

export interface UserPermissions {
  modules: {
    dashboard: boolean;
    companies: boolean;
    users: boolean;
    residues: boolean;
    plants: boolean;
    operations: boolean;
    affiliation_requests: boolean;
    company_requests: boolean;
    settings: boolean;
  };
  restrictions: {
    can_approve_affiliations: boolean;
    can_manage_permissions: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MainService {
  private readonly API_URL = 'http://localhost:3000/api';
  
  // Signals para estado reactivo
  private userSignal = signal<User | null>(null);
  private loadingSignal = signal<boolean>(false);
  
  // Estado observable del usuario
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  
  // Computed signals
  isLoggedIn = computed(() => !!this.userSignal());
  currentUser = computed(() => this.userSignal());
  isLoading = computed(() => this.loadingSignal());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  // ============================================
  // AUTENTICACIÓN
  // ============================================
  
  private loadUserFromStorage(): void {
    try {
      const stored = sessionStorage.getItem('userLoged');
      if (stored) {
        const user = JSON.parse(stored);
        this.userSignal.set(user);
        this.userSubject.next(user);
      }
    } catch (e) {
      console.error('Error loading user from storage:', e);
    }
  }

  getToken(): string | null {
    const user = this.userSignal();
    return user?.token || sessionStorage.getItem('token') || null;
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  login(body: { filter: Array<{ code: string; password: string }> }): Observable<ApiResponse<User>> {
    this.loadingSignal.set(true);
    
    return this.http.post<ApiResponse<User>>(`${this.API_URL}/login`, body).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.userSignal.set(response.data);
          this.userSubject.next(response.data);
          sessionStorage.setItem('userLoged', JSON.stringify(response.data));
          if (response.data.token) {
            sessionStorage.setItem('token', response.data.token);
          }
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.userSignal.set(null);
    this.userSubject.next(null);
    sessionStorage.removeItem('userLoged');
    sessionStorage.removeItem('token');
    this.router.navigate(['/inicio-de-sesion']);
  }

  // ============================================
  // OPERACIONES CRUD GENÉRICAS
  // ============================================

  /**
   * Obtener entidades por filtro
   * @param entity Nombre de la entidad (companies, users, residues, plants, types, operations_detail)
   * @param filter Filtro opcional
   */
  getEntity<T = any>(entity: string, body: { filter?: any[] } = {}): Observable<ApiResponse<T[]>> {
    return this.http.post<ApiResponse<T[]>>(
      `${this.API_URL}/${entity}/by`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crear nuevas entidades
   * @param entity Nombre de la entidad
   * @param data Objeto o array de objetos a crear
   */
  createEntity<T = any>(entity: string, data: any | any[]): Observable<ApiResponse<T>> {
    const dataArray = Array.isArray(data) ? data : [data];
    return this.http.post<ApiResponse<T>>(
      `${this.API_URL}/${entity}/create`,
      { news: dataArray },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar entidades existentes
   * @param entity Nombre de la entidad
   * @param data Objeto o array de objetos a actualizar (deben incluir id)
   */
  updateEntity<T = any>(entity: string, data: any | any[]): Observable<ApiResponse<T>> {
    const dataArray = Array.isArray(data) ? data : [data];
    return this.http.put<ApiResponse<T>>(
      `${this.API_URL}/${entity}/update`,
      { updateds: dataArray },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar entidades (soft delete cambiando status)
   * @param entity Nombre de la entidad
   * @param ids Array de IDs a eliminar
   */
  deleteEntity<T = any>(entity: string, ids: number[]): Observable<ApiResponse<T>> {
    const data = ids.map(id => ({ id, status: false }));
    return this.updateEntity<T>(entity, data);
  }

  // ============================================
  // MÉTODOS ESPECÍFICOS POR ENTIDAD
  // ============================================

  // Companies
  getCompanies(filter: any[] = []): Observable<ApiResponse<any[]>> {
    return this.getEntity('companies', { filter });
  }

  createCompany(company: any): Observable<ApiResponse<any>> {
    return this.createEntity('companies', [company]);
  }

  updateCompany(company: any): Observable<ApiResponse<any>> {
    return this.updateEntity('companies', [company]);
  }

  // Users
  getUsers(filter: any[] = []): Observable<ApiResponse<any[]>> {
    return this.getEntity('users', { filter });
  }

  createUser(user: any): Observable<ApiResponse<any>> {
    return this.createEntity('users', [user]);
  }

  updateUser(user: any): Observable<ApiResponse<any>> {
    return this.updateEntity('users', [user]);
  }

  // Residues (MongoDB - usa filter como objeto)
  getResidues(filter: any = {}): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.API_URL}/residues/by`,
      { filter },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        // MongoDB puede devolver data directamente o con paginación
        if (response.data && (response.data as any).data) {
          return { ...response, data: (response.data as any).data };
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  createResidue(residue: any): Observable<ApiResponse<any>> {
    return this.createEntity('residues', residue);
  }

  updateResidue(residue: any): Observable<ApiResponse<any>> {
    return this.updateEntity('residues', residue);
  }

  // Authorized Operations (MongoDB)
  getAuthorizedOperations(filter: any = {}): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.API_URL}/authorized_operations/by`,
      { filter },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  createAuthorizedOperation(operation: any): Observable<ApiResponse<any>> {
    return this.createEntity('authorized_operations', operation);
  }

  updateAuthorizedOperation(operation: any): Observable<ApiResponse<any>> {
    return this.updateEntity('authorized_operations', operation);
  }

  // User Permissions (MongoDB) - Para permisos de módulos de usuarios secundarios
  getUserPermissions(filter: any = {}): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.API_URL}/user_permissions/by`,
      { filter },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  createUserPermission(permission: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/user_permissions/create`,
      { news: permission },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateUserPermission(permission: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.API_URL}/user_permissions/update`,
      { updateds: [permission] },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Operation Types (Tipos de Operaciones Autorizadas - MongoDB)
  getOperationTypes(filter: any = {}): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.API_URL}/operation_types/by`,
      { filter },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  createOperationType(operationType: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/operation_types/create`,
      { news: operationType },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateOperationType(operationType: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.API_URL}/operation_types/update`,
      { updateds: [operationType] },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Plants
  getPlants(filter: any[] = []): Observable<ApiResponse<any[]>> {
    return this.getEntity('plants', { filter });
  }

  createPlant(plant: any): Observable<ApiResponse<any>> {
    return this.createEntity('plants', [plant]);
  }

  updatePlant(plant: any): Observable<ApiResponse<any>> {
    return this.updateEntity('plants', [plant]);
  }

  // Types (Configuración)
  getTypes(filter: any[] = []): Observable<ApiResponse<any[]>> {
    return this.getEntity('types', { filter });
  }

  getTypesByCategory(category: string): Observable<ApiResponse<any[]>> {
    return this.getEntity('types', { filter: [{ category }] });
  }

  createType(type: any): Observable<ApiResponse<any>> {
    return this.createEntity('types', [type]);
  }

  updateType(type: any): Observable<ApiResponse<any>> {
    return this.updateEntity('types', [type]);
  }

  // Operations Detail
  getOperations(filter: any[] = []): Observable<ApiResponse<any[]>> {
    return this.getEntity('operations_detail', { filter });
  }

  createOperation(operation: any): Observable<ApiResponse<any>> {
    return this.createEntity('operations_detail', [operation]);
  }

  // Company Requests (Solicitudes de Empresas - MongoDB)
  getCompanyRequests(filter: any = {}): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.API_URL}/company_requests/by`,
      { filter },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.data && (response.data as any).data) {
          return { ...response, data: (response.data as any).data };
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  createCompanyRequest(request: any): Observable<ApiResponse<any>> {
    return this.createEntity('company_requests', request);
  }

  updateCompanyRequest(request: any): Observable<ApiResponse<any>> {
    return this.updateEntity('company_requests', request);
  }

  // ============================================
  // SOLICITUDES DE AFILIACIÓN (MongoDB)
  // ============================================

  /**
   * Obtener solicitudes de afiliación
   * @param filter Filtro para buscar (company_id, status, applicant_user_id, etc.)
   */
  getAffiliationRequests(filter: any = {}): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.API_URL}/affiliation_requests/by`,
      { filter },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.data && (response.data as any).data) {
          return { ...response, data: (response.data as any).data };
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Crear una nueva solicitud de afiliación
   * @param request Datos de la solicitud
   */
  createAffiliationRequest(request: any): Observable<ApiResponse<any>> {
    return this.createEntity('affiliation_requests', request);
  }

  /**
   * Actualizar una solicitud de afiliación (aprobar/rechazar)
   * @param request Datos a actualizar (debe incluir _id)
   */
  updateAffiliationRequest(request: any): Observable<ApiResponse<any>> {
    return this.updateEntity('affiliation_requests', request);
  }

  /**
   * Aprobar una solicitud de afiliación
   * @param requestId ID de la solicitud
   * @param approvedById ID del usuario que aprueba
   * @param permissions Permisos a asignar al usuario
   */
  approveAffiliationRequest(requestId: string, approvedById: number, permissions: any): Observable<ApiResponse<any>> {
    const updateData = {
      _id: requestId,
      status: 'approved',
      approved_by_id: approvedById,
      approved_at: new Date().toISOString(),
      assigned_permissions: permissions
    };
    return this.updateAffiliationRequest(updateData);
  }

  /**
   * Aprobar afiliación Y crear usuario real en PostgreSQL
   * Este método crea el usuario en la BD y actualiza la solicitud como aprobada
   */
  approveAndCreateUser(data: {
    affiliationRequestId: string;
    names: string;
    last_names: string;
    email: string;
    phone?: string;
    company_id: number;
    password?: string;
    modules?: any;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/affiliation/approve`,
      data,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Establecer usuario como principal de empresa
   */
  setUserAsPrimary(userId: number, companyId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/users/set-primary`,
      { userId, companyId },
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Rechazar una solicitud de afiliación
   * @param requestId ID de la solicitud
   * @param rejectedById ID del usuario que rechaza
   * @param reason Motivo del rechazo
   */
  rejectAffiliationRequest(requestId: string, rejectedById: number, reason: string): Observable<ApiResponse<any>> {
    const updateData = {
      _id: requestId,
      status: 'rejected',
      rejected_by_id: rejectedById,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason
    };
    return this.updateAffiliationRequest(updateData);
  }

  /**
   * Obtener solicitudes pendientes por empresa
   * @param companyId ID de la empresa
   */
  getPendingAffiliationsByCompany(companyId: number): Observable<ApiResponse<any[]>> {
    return this.getAffiliationRequests({ company_id: companyId, status: 'pending' });
  }

  /**
   * Obtener todos los usuarios afiliados a una empresa con sus permisos
   * @param companyId ID de la empresa
   */
  getAffiliatedUsersByCompany(companyId: number): Observable<ApiResponse<any[]>> {
    return this.getAuthorizedOperations({ company_id: companyId });
  }

  /**
   * Actualizar permisos de un usuario afiliado
   * @param operationId ID del documento authorized_operations
   * @param modules Configuración de módulos visibles
   * @param permissions Permisos específicos
   */
  updateUserPermissions(operationId: string, modules: any, permissions: any[] = []): Observable<ApiResponse<any>> {
    const updateData = {
      _id: operationId,
      modules,
      permissions,
      updated_at: new Date().toISOString()
    };
    return this.updateAuthorizedOperation(updateData);
  }

  // ============================================
  // ESTADÍSTICAS DASHBOARD
  // ============================================

  getDashboardStats(): Observable<{
    companies: number;
    users: number;
    residues: number;
    plants: number;
    types: number;
    operations: number;
  }> {
    return new Observable(observer => {
      Promise.all([
        this.getCompanies().toPromise(),
        this.getUsers().toPromise(),
        this.getResidues().toPromise(),
        this.getPlants().toPromise(),
        this.getTypes().toPromise(),
        this.getOperations().toPromise(),
      ]).then(([companies, users, residues, plants, types, operations]) => {
        observer.next({
          companies: companies?.data?.length || 0,
          users: users?.data?.length || 0,
          residues: residues?.data?.length || 0,
          plants: plants?.data?.length || 0,
          types: types?.data?.length || 0,
          operations: operations?.data?.length || 0,
        });
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  // ============================================
  // MANEJO DE ERRORES
  // ============================================

  private handleError = (error: any) => {
    console.error('API Error:', error);
    
    if (error.status === 401) {
      this.logout();
    }
    
    return throwError(() => error);
  };
}
