import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription, forkJoin, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AluguelService } from '../../service/aluguel.service';
import { TemaService } from '../../service/tema.service';
import { ProductService } from '../../service/product.service';
import { Product } from '../../api/product';
import { ClienteService } from '../../service/cliente.service';
import { ItemService } from '../../service/item.service';

@Component({
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

  items!: MenuItem[];
  chartData: any;
  chartOptions: any;
  topUsers: any[] = [];
  subscription!: Subscription;
  alugueis: any[] = [];
  themes: any[] = [];
  topThemes: any[] = [];
  products: Product[] = [];
  totalThemes: number = 0;
  totalClients: number = 0;
  totalItens: number = 0;
  totalAlugueis: number = 0;
  maxRentCount: number = 0;
  themeColors: string[] = ['#FF5733', '#33FF57', '#3375FF', '#FFC300', '#DAF7A6', '#C70039', '#900C3F', '#581845'];

  constructor(
    private aluguelService: AluguelService,
    private temaService: TemaService,
    private clienteService: ClienteService,
    private itensService: ItemService,
    private productService: ProductService,
    public layoutService: LayoutService
  ) {
    this.subscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => {
        this.initChart();
      });
  }

  ngOnInit() {
    this.initChart();
    this.productService.getProductsSmall().then(data => this.products = data);
    this.loadTopUsers(); // Chamada para carregar os top usuários

    // Carregar aluguéis, temas, clientes e itens juntos
    forkJoin([
      this.aluguelService.getAlugueis(),
      this.temaService.getTemas(),
      this.clienteService.getClientes(),
      this.itensService.getItens()
    ]).subscribe(([alugueis, temas, clientes, itens]) => {
      this.alugueis = alugueis;
      this.themes = temas;
      this.totalAlugueis = alugueis.length;
      this.totalThemes = temas.length;
      this.totalClients = clientes.length;
      this.totalItens = itens.length;
      console.log('Aluguéis:', this.alugueis);
      console.log('Temas:', this.themes);
      console.log('Clientes:', this.totalClients);
      console.log('Itens:', this.totalItens);
      this.calculateTopThemes(); // Calcular temas mais alugados após carregar todos os dados
    });

    // Obter produtos
    this.productService.getProductsSmall().then((data) => {
      this.products = data;
    });

    this.items = [
      { label: 'Add New', icon: 'pi pi-fw pi-plus' },
      { label: 'Remove', icon: 'pi pi-fw pi-minus' },
    ];
  }

  calculateTopThemes() {
    const themeRentCount: { [key: number]: number } = {};

    // Contar aluguéis de cada tema
    this.alugueis.forEach((aluguel) => {
      const themeId = Number(aluguel.theme);
      if (themeRentCount[themeId]) {
        themeRentCount[themeId]++;
      } else {
        themeRentCount[themeId] = 1;
      }
    });

    // Encontre a quantidade máxima de aluguéis para normalizar a largura das barras
    this.maxRentCount = Math.max(...Object.values(themeRentCount));

    // Criar lista de temas mais alugados com correspondência correta dos IDs
    this.topThemes = Object.keys(themeRentCount)
      .map((key) => {
        const themeId = Number(key);
        const theme = this.themes.find((t) => t.id === themeId);
        return {
          theme: theme ? theme.name : 'Desconhecido',
          count: themeRentCount[themeId],
        };
      })
      .sort((a, b) => b.count - a.count); // Ordenar por quantidade de aluguéis

    console.log('Temas mais alugados:', this.topThemes); // Verificar resultado final
  }

  loadTopUsers() {
    this.aluguelService.getTopUsers().subscribe(users => {
      this.topUsers = users;
    });
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
          borderColor: documentStyle.getPropertyValue('--bluegray-700'),
          tension: .4,
        },
        {
          label: 'Second Dataset',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: false,
          backgroundColor: documentStyle.getPropertyValue('--green-600'),
          borderColor: documentStyle.getPropertyValue('--green-600'),
          tension: .4,
        },
      ],
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
