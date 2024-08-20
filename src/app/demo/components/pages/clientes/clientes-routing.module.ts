import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClientesComponent } from './clientes.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ClientesComponent }
	])],
	exports: [RouterModule]
})
export class ClientesRoutingModule { }
