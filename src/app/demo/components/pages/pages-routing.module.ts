import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([

        { path: 'clientes', loadChildren: () => import('./clientes/clientes.module').then(m => m.ClientesModule) },
        { path: 'temas', loadChildren: () => import('./temas/temas.module').then(m => m.TemasModule) },
        { path: 'alugueis', loadChildren: () => import('./alugueis/alugueis.module').then(m => m.AlugueisModule) },
        { path: 'itens', loadChildren: () => import('./itens/itens.module').then(m => m.ItensModule) },

        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
