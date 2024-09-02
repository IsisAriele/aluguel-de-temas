import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AlugueisComponent } from './alugueis.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: AlugueisComponent }
	])],
	exports: [RouterModule]
})
export class AlugueisRoutingModule { }
