import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aluguel } from '../api/aluguel'; 

@Injectable({
    providedIn: 'root'
})
export class AluguelService {

    private apiUrl = 'http://3.128.249.166:8000/api/rents/'; 

    constructor(private http: HttpClient) { }

    getAlugueis(): Observable<Aluguel[]> {
        return this.http.get<Aluguel[]>(this.apiUrl);
    }

    getAluguel(id: number): Observable<Aluguel> {
        return this.http.get<Aluguel>(`${this.apiUrl}${id}/`);
    }

    createAluguel(aluguel: Aluguel): Observable<Aluguel> {
        return this.http.post<Aluguel>(this.apiUrl, aluguel);
    }

    updateAluguel(aluguel: Aluguel): Observable<Aluguel> {
        return this.http.put<Aluguel>(`${this.apiUrl}${aluguel.id}/`, aluguel);
    }

    deleteAluguel(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}${id}/`);
    }
}
