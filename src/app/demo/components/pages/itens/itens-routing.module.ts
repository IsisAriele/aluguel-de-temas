import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItensComponent } from './itens.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ItensComponent }
	])],
	exports: [RouterModule]
})
export class ItensRoutingModule { }
