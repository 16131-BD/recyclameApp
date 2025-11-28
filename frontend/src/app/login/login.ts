import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MainService } from '../main.service';

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
    private Router: Router,
    private Main: MainService
  ) {

  }

  credentials: any = {};

  ngOnInit(): void {
    console.log("Hola Mundo iniciando el Login");

  }

  async login() {
    let body: any = { filter: [
        { code: this.credentials.username,
          password: this.credentials.password
        }
      ]
    };

    let result: any = await this.Main.login(body).toPromise();
    console.log(result);
    if (result.data) {
      sessionStorage.setItem('userLoged', JSON.stringify(result.data));
      sessionStorage.setItem('token', result.data.token);
      this.Router.navigate(['backoffice/tablero']);
    } else {
      alert('Credenciales incorrectas. Intente de nuevo');
    }
  }

}
