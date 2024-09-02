import { Component, OnInit } from '@angular/core';
import { AluguelService } from 'src/app/demo/service/aluguel.service'; 
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-alugueis',
  templateUrl: './alugueis.component.html',
  providers: [MessageService]
})
export class AlugueisComponent implements OnInit {

  aluguelDialog: boolean = false;
  deleteAluguelDialog: boolean = false;
  deleteAlugueisDialog: boolean = false;

  alugueis: any[] = [];
  aluguel: any = {};
  selectedAlugueis: any[] = [];
  submitted: boolean = false;
  cols: any[] = [];

  constructor(private aluguelService: AluguelService, private messageService: MessageService) { }

  ngOnInit() {
    this.aluguelService.getAlugueis().subscribe(data => this.alugueis = data);

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'date', header: 'Data' },
      { field: 'start_hours', header: 'Hora Início' },
      { field: 'end_hours', header: 'Hora Fim' },
      { field: 'client', header: 'Cliente' },
      { field: 'theme', header: 'Tema' },
      { field: 'address', header: 'Endereço' }
    ];
  }

  openNew() {
    this.aluguel = {};
    this.submitted = false;
    this.aluguelDialog = true;
  }

  deleteSelectedAlugueis() {
    this.deleteAlugueisDialog = true;
  }

  editAluguel(aluguel: any) {
    this.aluguel = { ...aluguel };
    this.aluguelDialog = true;
  }

  deleteAluguel(aluguel: any) {
    this.deleteAluguelDialog = true;
    this.aluguel = { ...aluguel };
  }

  confirmDeleteSelected() {
    this.deleteAlugueisDialog = false;
    this.selectedAlugueis.forEach(aluguel => {
      this.aluguelService.deleteAluguel(aluguel.id).subscribe(() => {
        this.alugueis = this.alugueis.filter(val => !this.selectedAlugueis.includes(val));
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Aluguéis removidos', life: 3000 });
      });
    });
    this.selectedAlugueis = [];
  }

  confirmDelete() {
    this.deleteAluguelDialog = false;
    this.aluguelService.deleteAluguel(this.aluguel.id).subscribe(() => {
      this.alugueis = this.alugueis.filter(val => val.id !== this.aluguel.id);
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Aluguel removido', life: 3000 });
      this.aluguel = {};
    });
  }

  hideDialog() {
    this.aluguelDialog = false;
    this.deleteAluguelDialog = false;
    this.deleteAlugueisDialog = false;
    this.submitted = false;
  }

  saveAluguel() {
    this.submitted = true;
  
    if (this.aluguel.date?.trim() && this.aluguel.start_hours?.trim() && this.aluguel.end_hours?.trim() &&
        this.aluguel.client && this.aluguel.theme && this.aluguel.address) {
      
      if (this.aluguel.id) {
        this.aluguelService.updateAluguel(this.aluguel).subscribe({
          next: (response) => {
            const index = this.findIndexById(this.aluguel.id);
            if (index !== -1) {
              this.alugueis[index] = response;
            }
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Aluguel atualizado', life: 3000 });
  
            this.alugueis = [...this.alugueis];
            this.aluguelDialog = false;
            this.aluguel = {};
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar o aluguel', life: 3000 });
          }
        });
      } else {
        this.aluguelService.createAluguel(this.aluguel).subscribe({
          next: (newAluguel) => {
            this.alugueis.push(newAluguel);
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Aluguel cadastrado', life: 3000 });
  
            this.alugueis = [...this.alugueis];
            this.aluguelDialog = false;
            this.aluguel = {};
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao cadastrar o aluguel', life: 3000 });
          }
        });
      }
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Por favor, preencha todos os campos obrigatórios', life: 3000 });
    }
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.alugueis.length; i++) {
      if (this.alugueis[i].id === id) {
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
