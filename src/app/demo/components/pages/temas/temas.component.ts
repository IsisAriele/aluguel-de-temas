// temas.component.ts
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TemaService } from '../../../service/tema.service';

@Component({
  selector: 'app-temas',
  templateUrl: './temas.component.html',
  providers: [MessageService]
})
export class TemasComponent implements OnInit {

  temaDialog: boolean = false;
  deleteTemaDialog: boolean = false;
  deleteTemasDialog: boolean = false;

  temas: any[] = [];
  tema: any = {};
  selectedTemas: any[] = [];
  submitted: boolean = false;
  cols: any[] = [];
  items: any[] = [];
  selectedItems: any[] = [];

  constructor(private temaService: TemaService, private messageService: MessageService) { }

  ngOnInit() {
    this.temaService.getTemas().subscribe(data => this.temas = data);

    this.temaService.getItems().subscribe(data => {
        this.items = data;
        console.log('Itens carregados:', this.items);
    });


    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'name', header: 'Nome' },
      { field: 'color', header: 'Cor' },
      { field: 'price', header: 'Preço' }
    ];
  }

  openNew() {
    this.tema = {};
    this.selectedItems = [];
    this.submitted = false;
    this.temaDialog = true;
  }

  editTema(tema: any) {
    this.tema = { ...tema };
    this.selectedItems = this.items.filter(item => tema.itens.includes(item.id));
    this.temaDialog = true;
  }

  saveTema() {
    this.submitted = true;
    this.tema.itens = this.selectedItems.map(item => item.id);

    if (this.tema.name?.trim()) {
      if (this.tema.id) {
        this.temaService.updateTema(this.tema).subscribe(() => {
          const index = this.findIndexById(this.tema.id);
          if (index !== -1) {
            this.temas[index] = this.tema;
          }
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Tema atualizado', life: 3000 });

          this.temas = [...this.temas];
          this.temaDialog = false;
          this.tema = {};
        });
      } else {
        this.temaService.createTema(this.tema).subscribe((newTema) => {
          this.temas.push(newTema);
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Tema cadastrado', life: 3000 });

          this.temas = [...this.temas];
          this.temaDialog = false;
          this.tema = {};
        });
      }
    }
  }

  findIndexById(id: number): number {
    return this.temas.findIndex((tema) => tema.id === id);
  }

  deleteSelectedTemas() {
    this.deleteTemasDialog = true;
  }

  deleteTema(tema: any) {
    this.deleteTemaDialog = true
    this.tema = { ...tema};
  }
  confirmDeleteSelected() {
    this.deleteTemasDialog = false;
    this.selectedTemas.forEach(tema => {
      this.temaService.deleteTema(tema.id).subscribe(() => {
        this.temas = this.temas.filter(val => !this.selectedTemas.includes(val));
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Temas removidos', life: 3000 });
      });
    });
    this.selectedTemas = [];
  }

  confirmDelete() {
    this.deleteTemaDialog = false;
    this.temaService.deleteTema(this.tema.id).subscribe(() => {
      this.temas = this.temas.filter(val => val.id !== this.tema.id);
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Tema removido', life: 3000 });
      this.tema = {};
    });
  }

//   hideDialog() {
//     this.temaDialog = false;
//     this.submitted = false;
//   }
    hideDialog() {
        this.temaDialog = false;
        this.deleteTemaDialog = false; // Fecha o modal de confirmação de exclusão de um único tema
        this.deleteTemasDialog = false; // Fecha o modal de confirmação de exclusão de múltiplos temas
        this.submitted = false;
    }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
