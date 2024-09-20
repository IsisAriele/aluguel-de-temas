// alugueis.component.ts
import { Component, OnInit } from '@angular/core';
import { AluguelService } from 'src/app/demo/service/aluguel.service'; 
import { MessageService } from 'primeng/api';
import { ClienteService } from 'src/app/demo/service/cliente.service'; // Importação do ClienteService
import { TemaService } from 'src/app/demo/service/tema.service'; // Importação do TemaService
import { Cliente } from 'src/app/demo/api/cliente'; // Importação do modelo Cliente
import { Tema } from 'src/app/demo/api/tema'; // Importação do modelo Tema
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-alugueis',
  templateUrl: './alugueis.component.html',
  providers: [MessageService]
})
export class AlugueisComponent implements OnInit {

  // Controle de diálogos
  aluguelDialog: boolean = false;
  deleteAluguelDialog: boolean = false;
  deleteAlugueisDialog: boolean = false;

  // Dados de aluguéis
  alugueis: any[] = [];
  aluguel: any = {};
  selectedAlugueis: any[] = [];
  submitted: boolean = false;
  cols: any[] = [];

  // Listas de clientes e temas para dropdowns
  clients: Cliente[] = [];
  themes: Tema[] = [];

  constructor(
    private aluguelService: AluguelService, 
    private messageService: MessageService,
    private clienteService: ClienteService, // Injeção do ClienteService
    private temaService: TemaService // Injeção do TemaService
  ) { }

  ngOnInit() {
    this.loadAlugueis();
    this.loadClientes();
    this.loadTemas();

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'date', header: 'Data' },
      { field: 'start_hours', header: 'Hora Início' },
      { field: 'end_hours', header: 'Hora Fim' },
      { field: 'clientName', header: 'Cliente' },
      { field: 'themeName', header: 'Tema' },
      { field: 'address', header: 'Endereço' }
    ];
  }

  // Carrega os aluguéis com detalhes de cliente e tema
  loadAlugueis() {
    this.aluguelService.getAlugueisComDetalhes().subscribe(
      data => {
        this.alugueis = data;
        console.log('Aluguéis carregados com detalhes:', this.alugueis); // Log para depuração
      },
      error => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar aluguéis', life: 3000 })
    );
  }

  // Carrega a lista de clientes
  loadClientes() {
    this.clienteService.getClientes().subscribe(
      data => this.clients = data,
      error => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar clientes', life: 3000 })
    );
  }

  // Carrega a lista de temas
  loadTemas() {
    this.temaService.getTemas().subscribe(
      data => this.themes = data,
      error => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar temas', life: 3000 })
    );
  }

  // Abre o diálogo para adicionar um novo aluguel
  openNew() {
    this.aluguel = {};
    this.submitted = false;
    this.aluguelDialog = true;
  }

  // Abre o diálogo para deletar aluguéis selecionados
  deleteSelectedAlugueis() {
    this.deleteAlugueisDialog = true;
  }

  // Abre o diálogo para editar um aluguel existente
  editAluguel(aluguel: any) {
    this.aluguel = { ...aluguel };
    this.aluguelDialog = true;
  }

  // Abre o diálogo para deletar um aluguel específico
  deleteAluguel(aluguel: any) {
    this.deleteAluguelDialog = true;
    this.aluguel = { ...aluguel };
  }

  // Confirma a deleção de aluguéis selecionados
  confirmDeleteSelected() {
    this.deleteAlugueisDialog = false;
    const deleteObservables = this.selectedAlugueis.map(aluguel => this.aluguelService.deleteAluguel(aluguel.id));
    // Utiliza forkJoin para esperar todas as deleções
    forkJoin(deleteObservables).subscribe({
      next: () => {
        this.loadAlugueis();
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Aluguéis removidos', life: 3000 });
        this.selectedAlugueis = [];
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover aluguéis', life: 3000 });
      }
    });
  }

  // Confirma a deleção de um aluguel específico
  confirmDelete() {
    this.deleteAluguelDialog = false;
    this.aluguelService.deleteAluguel(this.aluguel.id).subscribe({
      next: () => {
        this.loadAlugueis();
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Aluguel removido', life: 3000 });
        this.aluguel = {};
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover aluguel', life: 3000 });
      }
    });
  }

  // Esconde os diálogos
  hideDialog() {
    this.aluguelDialog = false;
    this.deleteAluguelDialog = false;
    this.deleteAlugueisDialog = false;
    this.submitted = false;
  }

  // Salva (cria ou atualiza) um aluguel
  saveAluguel() {
    this.submitted = true;

    // Validação dos campos obrigatórios
    if (this.aluguel.date?.trim() && this.aluguel.start_hours?.trim() && this.aluguel.end_hours?.trim() &&
        this.aluguel.client && this.aluguel.theme && this.aluguel.address != null) {
      
      if (this.aluguel.id) {
        // Atualiza o aluguel existente
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
        // Cria um novo aluguel
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

  // Encontra o índice do aluguel pelo ID
  findIndexById(id: number): number {
    return this.alugueis.findIndex(aluguel => aluguel.id === id);
  }

  // Filtra globalmente na tabela
  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
