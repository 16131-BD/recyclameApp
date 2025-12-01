import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MainService } from '../main.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  credentials = {
    username: '',
    password: ''
  };
  
  showPassword = false;
  rememberMe = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private mainService: MainService
  ) {}

  ngOnInit(): void {
    // Si ya está logueado, redirigir al dashboard
    if (this.mainService.getToken()) {
      this.router.navigate(['/backoffice/tablero']);
    }
    
    // Cargar credenciales recordadas si existen
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
      this.credentials.username = remembered;
      this.rememberMe = true;
    }
  }

  async login() {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Por favor, ingresa tu código de usuario y contraseña';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const body = {
      filter: [
        {
          code: this.credentials.username,
          password: this.credentials.password
        }
      ]
    };

    this.mainService.login(body).subscribe({
      next: (result) => {
        this.isLoading = false;
        
        if (result.success && result.data) {
          // Recordar usuario si está marcado
          if (this.rememberMe) {
            localStorage.setItem('rememberedUser', this.credentials.username);
          } else {
            localStorage.removeItem('rememberedUser');
          }
          
          this.router.navigate(['/backoffice/tablero']);
        } else {
          this.errorMessage = 'Credenciales incorrectas. Verifica tu código de usuario y contraseña.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Verifica tu código de usuario y contraseña.';
        } else if (error.status === 0) {
          this.errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté en ejecución.';
        } else {
          this.errorMessage = 'Error al iniciar sesión. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
