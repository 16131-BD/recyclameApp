import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  constructor(
    private Router: Router
  ) {

  }

  credentials: any = {};

  ngOnInit(): void {
    console.log("Hola Mundo iniciando el Login");

  }

  login() {
    console.log("Estoy tratando de iniciar sesión");
    console.log(this.credentials);
    console.log("Debo enviar las credenciales (username y password) al backend");
    console.log("Validara ingreso");
    this.Router.navigate(['inicio/tablero']);
  }

}
