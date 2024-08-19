import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/demo/service/cliente.service'; // Ajuste o caminho conforme necessário
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  providers: [MessageService]
})
export class ClientesComponent implements OnInit {

  clienteDialog: boolean = false;
  deleteClienteDialog: boolean = false;
  deleteClientesDialog: boolean = false;

  clientes: any[] = [];
  cliente: any = {};
  selectedClientes: any[] = [];
  submitted: boolean = false;
  cols: any[] = [];

  constructor(private clienteService: ClienteService, private messageService: MessageService) { }

  ngOnInit() {
    this.clienteService.getClientes().subscribe(data => this.clientes = data);

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'nome', header: 'Nome' },
      { field: 'email', header: 'Email' }
    ];
  }

  openNew() {
    this.cliente = {};
    this.submitted = false;
    this.clienteDialog = true;
  }

  deleteSelectedClientes() {
    this.deleteClientesDialog = true;
  }

  editCliente(cliente: any) {
    this.cliente = { ...cliente };
    this.clienteDialog = true;
  }

  deleteCliente(cliente: any) {
    this.deleteClienteDialog = true;
    this.cliente = { ...cliente };
  }

  confirmDeleteSelected() {
    this.deleteClientesDialog = false;
    this.selectedClientes.forEach(cliente => {
      this.clienteService.deleteCliente(cliente.id).subscribe(() => {
        this.clientes = this.clientes.filter(val => !this.selectedClientes.includes(val));
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Clientes Deleted', life: 3000 });
      });
    });
    this.selectedClientes = [];
  }

  confirmDelete() {
    this.deleteClienteDialog = false;
    this.clienteService.deleteCliente(this.cliente.id).subscribe(() => {
      this.clientes = this.clientes.filter(val => val.id !== this.cliente.id);
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Cliente Deleted', life: 3000 });
      this.cliente = {};
    });
  }

  hideDialog() {
    this.clienteDialog = false;
    this.submitted = false;
  }

  saveCliente() {
    this.submitted = true;

    if (this.cliente.nome?.trim() && this.cliente.email?.trim()) {
      if (this.cliente.id) {
        this.clienteService.updateCliente(this.cliente).subscribe(() => {
          this.clientes[this.findIndexById(this.cliente.id)] = this.cliente;
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Cliente Updated', life: 3000 });
        });
      } else {
        this.clienteService.createCliente(this.cliente).subscribe((newCliente) => {
          this.clientes.push(newCliente);
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Cliente Created', life: 3000 });
        });
      }

      this.clientes = [...this.clientes];
      this.clienteDialog = false;
      this.cliente = {};
    }
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.clientes.length; i++) {
      if (this.clientes[i].id === id) {
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
