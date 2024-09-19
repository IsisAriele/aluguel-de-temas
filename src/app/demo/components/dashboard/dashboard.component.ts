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
import * as moment from 'moment';

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
    this.loadTopUsers();

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
      this.calculateTopThemes();
      this.calculateRentDataPerMonth();
    });

    this.items = [
      { label: 'Add New', icon: 'pi pi-fw pi-plus' },
      { label: 'Remove', icon: 'pi pi-fw pi-minus' },
    ];
  }

  calculateRentDataPerMonth() {
    const rentDataByMonth = Array(12).fill(0);

    this.alugueis.forEach((aluguel) => {
      const rentMonth = moment(aluguel.date, 'YYYY-MM-DD').month();
      rentDataByMonth[rentMonth]++;
    });

    this.chartData = {
      labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      datasets: [
        {
          label: 'Temas Alugados por Mês',
          data: rentDataByMonth,
          fill: false,
          backgroundColor: this.themeColors[2],
          borderColor: this.themeColors[2],
          tension: .4
        }
      ]
    };
  }

  calculateTopThemes() {
    const themeRentCount: { [key: number]: number } = {};

    this.alugueis.forEach((aluguel) => {
      const themeId = Number(aluguel.theme);
      if (themeRentCount[themeId]) {
        themeRentCount[themeId]++;
      } else {
        themeRentCount[themeId] = 1;
      }
    });

    this.maxRentCount = Math.max(...Object.values(themeRentCount));
    this.topThemes = Object.keys(themeRentCount)
      .map((key) => {
        const themeId = Number(key);
        const theme = this.themes.find((t) => t.id === themeId);
        return {
          theme: theme ? theme.name : 'Desconhecido',
          count: themeRentCount[themeId],
        };
      })
      .sort((a, b) => b.count - a.count);

    console.log('Temas mais alugados:', this.topThemes);
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
