import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  uri: string = 'http://localhost:3000/api';

  constructor(
    private Http: HttpClient
  ) { }

  getToken() {
    return JSON.parse(sessionStorage.getItem('userLoged') || '{}').token;
  }

  login(body: any) {
    return this.Http.post(`${this.uri}/login`, body);
  }

  getEntity(entity: string, body: any) {
    return this.Http.post(`${this.uri}/${entity}/by`, body);
  }

}
