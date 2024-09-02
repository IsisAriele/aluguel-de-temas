import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../api/item';

@Injectable({
    providedIn: 'root'
})
export class ItemService {

    private apiUrl = 'http://3.128.249.166:8000/api/itens/';

    constructor(private http: HttpClient) { }

    getItens(): Observable<Item[]> {
        return this.http.get<Item[]>(this.apiUrl);
    }

    getItem(id: number): Observable<Item> {
        return this.http.get<Item>(`${this.apiUrl}${id}/`);
    }

    createItem(item: Item): Observable<Item> {
        return this.http.post<Item>(this.apiUrl, item);
    }

    updateItem(item: Item): Observable<Item> {
        return this.http.put<Item>(`${this.apiUrl}${item.id}/`, item);
    }

    deleteItem(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}${id}/`);
    }
}
