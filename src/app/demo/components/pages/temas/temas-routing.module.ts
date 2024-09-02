
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TemasComponent } from './temas.component';

@NgModule({
  imports: [RouterModule.forChild([{ path: '', component: TemasComponent }])],
  exports: [RouterModule]
})
export class TemasRoutingModule { }
