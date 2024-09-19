import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Aluguel } from '../api/aluguel';
import { TemaService } from './tema.service';
import { ClienteService } from './cliente.service';
import { Tema } from '../api/tema';
import { Cliente } from '../api/cliente';

@Injectable({
    providedIn: 'root'
})
export class AluguelService {

    private apiUrl = 'http://3.128.249.166:8000/api/rents/'; 
    

    constructor( private http: HttpClient,
        private temaService: TemaService,
        private clienteService: ClienteService) { }

    getAlugueis(): Observable<Aluguel[]> {
        return this.http.get<Aluguel[]>(this.apiUrl);
    }

    getClientDetails(clientId: number): Observable<any> {
        return this.http.get<any>(`http://3.128.249.166:8000/api/clients/${clientId}/`);
    }

    getTopUsers(): Observable<any[]> {
        return this.getAlugueis().pipe(
            map(alugueis => {
                const clientRentCount: { [key: number]: number } = {};
                alugueis.forEach(aluguel => {
                    const clientId = aluguel.client;
                    clientRentCount[clientId] = (clientRentCount[clientId] || 0) + 1;
                });
                return Object.entries(clientRentCount)
                    .map(([clientId, count]) => ({ clientId: Number(clientId), rentCount: count }))
                    .sort((a, b) => b.rentCount - a.rentCount);
            }),
            switchMap(clientCounts => {
                return forkJoin(
                    clientCounts.map(({ clientId, rentCount }) => 
                        this.getClientDetails(clientId).pipe(
                            map(clientDetails => ({
                                clientId,
                                rentCount,
                                clientName: clientDetails.name 
                            }))
                        )
                    )
                );
            })
        );
    }

    getAluguel(id: number): Observable<Aluguel> {
        return this.http.get<Aluguel>(`${this.apiUrl}${id}/`);
    }

    getAlugueisComDetalhes(): Observable<any[]> {
        return this.getAlugueis().pipe(
            map(alugueis => {
                return alugueis.map(aluguel => ({
                    ...aluguel,
                    temaPrice: this.temaService.getTema(aluguel.theme).pipe(map(tema => tema.price)),
                    clienteNome: this.clienteService.getCliente(aluguel.client).pipe(map(cliente => cliente.name)),
                }));
            })
        );
    }

    getTotalRevenue(): Observable<number> {
        return this.temaService.getTemas().pipe(
            switchMap(temas => {
                return this.getAlugueis().pipe(
                    map(alugueis => {
                        return alugueis.reduce((total, aluguel) => {
                            const temaPrice = this.getTemaPrice(aluguel.theme, temas);
                            return total + temaPrice;
                        }, 0);
                    })
                );
            })
        );
    }

    getTemaPrice(themeId: number, temas: Tema[]): number {
        const tema = temas.find(t => t.id === themeId);
        return tema ? tema.price || 0 : 0;
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
