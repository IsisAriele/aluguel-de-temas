// aluguel.service.ts
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

    constructor(
        private http: HttpClient,
        private temaService: TemaService,
        private clienteService: ClienteService
    ) { }

    // Obtém todos os aluguéis
    getAlugueis(): Observable<Aluguel[]> {
        return this.http.get<Aluguel[]>(this.apiUrl);
    }

    // Obtém detalhes de um cliente específico
    getClientDetails(clientId: number): Observable<any> {
        return this.http.get<any>(`http://3.128.249.166:8000/api/clients/${clientId}/`);
    }

    // Obtém os usuários com mais aluguéis
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

    // Obtém um aluguel específico pelo ID
    getAluguel(id: number): Observable<Aluguel> {
        return this.http.get<Aluguel>(`${this.apiUrl}${id}/`);
    }

    // Obtém aluguéis com detalhes de cliente e tema
    getAlugueisComDetalhes(): Observable<any[]> {
        return this.getAlugueis().pipe(
            switchMap(alugueis => {
                return forkJoin(alugueis.map(aluguel => 
                    forkJoin({
                        tema: this.temaService.getTema(aluguel.theme),
                        cliente: this.clienteService.getCliente(aluguel.client)
                    }).pipe(
                        map(({ tema, cliente }) => ({
                            ...aluguel,
                            themeName: tema.name,  // Corrigido de 'temaName' para 'themeName'
                            clientName: cliente.name,
                            // Opcional: adicionar outros detalhes se necessário
                        }))
                    )
                ));
            })
        );
    }

    // Obtém a receita total
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

    // Obtém o preço de um tema específico
    getTemaPrice(themeId: number, temas: Tema[]): number {
        const tema = temas.find(t => t.id === themeId);
        return tema ? tema.price || 0 : 0;
    }

    // Cria um novo aluguel
    createAluguel(aluguel: Aluguel): Observable<Aluguel> {
        return this.http.post<Aluguel>(this.apiUrl, aluguel);
    }

    // Atualiza um aluguel existente
    updateAluguel(aluguel: Aluguel): Observable<Aluguel> {
        return this.http.put<Aluguel>(`${this.apiUrl}${aluguel.id}/`, aluguel);
    }

    // Deleta um aluguel pelo ID
    deleteAluguel(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}${id}/`);
    }
}
