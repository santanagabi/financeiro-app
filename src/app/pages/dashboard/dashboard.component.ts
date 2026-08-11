import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  viewChild,
  effect,
  inject
} from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { MovimentacaoService } from "../../services/movimentacao.service";
import { Movimentacao, CategoriaMovimentacao } from '../../interfaces/movimentacao';
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
Chart.register(...registerables);

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatTableModule,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  displayedColumns: string[] = [
    "data",
    "tipo",
    "categoria",
    "descricao",
    "valor",
  ];
  doughnutCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>("doughnutCanvas");
  lineCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>("lineCanvas");
  barCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>("barCanvas");

  private doughnutChart?: Chart;
  private lineChart?: Chart;
  private barChart?: Chart;

  public movimentacaoService = inject(MovimentacaoService);

  constructor() {
    // Reage às movimentações e redesenha os gráficos.
    effect(() => {
      const dados = this.movimentacaoService.movimentacoesOrdenadas();
      this.atualizarGraficos(dados.length ? dados : []);
    });
  }

  private atualizarGraficos(
    dados: ReturnType<MovimentacaoService["movimentacoesOrdenadas"]>,
  ): void {
    this.montarDoughnut();
    this.montarLinha(dados);
    this.montarBarras(dados);
  }

  /** Gráfico 1: Entradas x Saídas (doughnut) */
  private montarDoughnut(): void {
    const entradas = this.movimentacaoService.totalEntradas();
    const saidas = this.movimentacaoService.totalSaidas();

    const config: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels: ["Entradas", "Saídas"],
        datasets: [
          {
            data: [entradas, saidas],
            backgroundColor: ["#16a34a", "#dc2626"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { position: "bottom", labels: { boxWidth: 10 } } },
      },
    };

    this.doughnutChart?.destroy();
    this.doughnutChart = new Chart(this.doughnutCanvas().nativeElement, config);
  }

  /** Gráfico 2: Evolução do saldo (linha), calculado como saldo acumulado no tempo */
  private montarLinha(
    dados: ReturnType<MovimentacaoService["movimentacoesOrdenadas"]>,
  ): void {
    const cronologica = [...dados].sort((a, b) => (a.data > b.data ? 1 : -1));

    let acumulado = 0;
    const pontos = cronologica.map((m) => {
      acumulado += m.tipo === "Entrada" ? m.valor : -m.valor;
      return { data: m.data, saldo: acumulado };
    });

    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels: pontos.map((p) => this.formatarDataCurta(p.data)),
        datasets: [
          {
            label: "Saldo",
            data: pontos.map((p) => p.saldo),
            borderColor: "#1e3a8a",
            backgroundColor: "rgba(30, 58, 138, 0.08)",
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: (v) => "R$ " + v } } },
      },
    };

    this.lineChart?.destroy();
    this.lineChart = new Chart(this.lineCanvas().nativeElement, config);
  }

  /** Gráfico 3: Gastos por categoria (barras) - só considera Saídas */
  private montarBarras(
    dados: ReturnType<MovimentacaoService["movimentacoesOrdenadas"]>,
  ): void {
    const porCategoria = new Map<CategoriaMovimentacao, number>();
    for (const m of dados) {
      if (m.tipo !== "Saida") continue;
      porCategoria.set(
        m.categoria,
        (porCategoria.get(m.categoria) ?? 0) + m.valor,
      );
    }

    const entradas = [...porCategoria.entries()].sort((a, b) => b[1] - a[1]);

    const config: ChartConfiguration<"bar"> = {
      type: "bar",
      data: {
        labels: entradas.map(([cat]) => cat),
        datasets: [
          {
            data: entradas.map(([, valor]) => valor),
            backgroundColor: "#2f56c4",
            borderRadius: 4,
            maxBarThickness: 36,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: (v) => "R$ " + v } } },
      },
    };

    this.barChart?.destroy();
    this.barChart = new Chart(this.barCanvas().nativeElement, config);
  }

  private formatarDataCurta(iso: string): string {
    const [, mes, dia] = iso.split("-");
    return `${dia}/${mes}`;
  }
}
