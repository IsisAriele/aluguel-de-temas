import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                ]
            },


            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                items: [


                    {
                        label: 'Clientes',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/pages/clientes']
                    },
                    {
                        label: 'Temas',
                        icon: 'pi pi-fw pi-palette',
                        routerLink: ['/pages/temas']
                    },
                    {
                        label: 'Itens',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/pages/itens']
                    },
                    {
                        label: 'Aluguéis',
                        icon: 'pi pi-fw pi-calendar',
                        routerLink: ['/pages/alugueis']
                    },


                ]
            },

        ];
    }
}
