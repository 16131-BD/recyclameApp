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
  token?: string;
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
