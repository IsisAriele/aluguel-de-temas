// tema.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tema } from '../api/tema';

@Injectable({
  providedIn: 'root'
})
export class TemaService {

  private apiUrl = 'http://3.128.249.166:8000/api/themes/';
  private itemsUrl = 'http://3.128.249.166:8000/api/itens/';

  constructor(private http: HttpClient) { }

  getTemas(): Observable<Tema[]> {
    return this.http.get<Tema[]>(this.apiUrl);
  }

  getTema(id: number): Observable<Tema> {
    return this.http.get<Tema>(`${this.apiUrl}${id}/`);
  }

  createTema(tema: Tema): Observable<Tema> {
    return this.http.post<Tema>(this.apiUrl, tema);
  }

  updateTema(tema: Tema): Observable<Tema> {
    return this.http.put<Tema>(`${this.apiUrl}${tema.id}/`, tema);
  }

  deleteTema(id: number): Observable<Tema> {
    return this.http.delete<Tema>(`${this.apiUrl}${id}/`);
  }

  getItems(): Observable<Tema[]> {
    return this.http.get<Tema[]>(this.itemsUrl);
  }
}
