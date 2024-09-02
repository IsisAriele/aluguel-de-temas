import { Component, OnInit } from '@angular/core';
import { ItemService } from 'src/app/demo/service/item.service'; // Ajuste o caminho conforme necessário
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-itens',
  templateUrl: './itens.component.html',
  providers: [MessageService]
})
export class ItensComponent implements OnInit {

  itemDialog: boolean = false;
  deleteItemDialog: boolean = false;
  deleteItemsDialog: boolean = false;

  itens: any[] = [];
  item: any = {};
  selectedItens: any[] = [];
  submitted: boolean = false;
  cols: any[] = [];

  constructor(private itemService: ItemService, private messageService: MessageService) { }

  ngOnInit() {
    this.itemService.getItens().subscribe(data => this.itens = data);

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'name', header: 'Nome' },
      { field: 'description', header: 'Descrição' }
    ];
  }

  openNew() {
    this.item = {};
    this.submitted = false;
    this.itemDialog = true;
  }

  deleteSelectedItems() {
    this.deleteItemsDialog = true;
  }

  editItem(item: any) {
    this.item = { ...item };
    this.itemDialog = true;
  }

  deleteItem(item: any) {
    this.deleteItemDialog = true;
    this.item = { ...item };
  }

  confirmDeleteSelected() {
    this.deleteItemsDialog = false;
    this.selectedItens.forEach(item => {
      this.itemService.deleteItem(item.id).subscribe(() => {
        this.itens = this.itens.filter(val => !this.selectedItens.includes(val));
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Itens removidos', life: 3000 });
      });
    });
    this.selectedItens = [];
  }

  confirmDelete() {
    this.deleteItemDialog = false;
    this.itemService.deleteItem(this.item.id).subscribe(() => {
      this.itens = this.itens.filter(val => val.id !== this.item.id);
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Item removido', life: 3000 });
      this.item = {};
    });
  }

  hideDialog() {
    this.itemDialog = false;
    this.deleteItemDialog = false;
    this.deleteItemsDialog = false;
    this.submitted = false;
  }

  saveItem() {
    this.submitted = true;

    if (this.item.name?.trim() && this.item.description?.trim()) {
      if (this.item.id) {
        this.itemService.updateItem(this.item).subscribe({
          next: (response) => {
            const index = this.findIndexById(this.item.id);
            if (index !== -1) {
              this.itens[index] = response;
            }
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Item atualizado', life: 3000 });

            this.itens = [...this.itens];
            this.itemDialog = false;
            this.item = {};
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar o item', life: 3000 });
          }
        });
      } else {
        this.itemService.createItem(this.item).subscribe({
          next: (newItem) => {
            this.itens.push(newItem);
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Item cadastrado', life: 3000 });

            this.itens = [...this.itens];
            this.itemDialog = false;
            this.item = {};
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao cadastrar o item', life: 3000 });
          }
        });
      }
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Por favor, preencha todos os campos obrigatórios', life: 3000 });
    }
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.itens.length; i++) {
      if (this.itens[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
