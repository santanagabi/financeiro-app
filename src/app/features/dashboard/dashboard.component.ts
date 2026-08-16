import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { ChartConfiguration } from "chart.js";
import { MovimentacaoService } from "../movimentacoes/services/movimentacao.service";
import { Movimentacao, CategoriaMovimentacao } from '../movimentacoes/interfaces/movimentacao';
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { ChartWrapper } from "../../shared/ui/chart-wrapper/chart-wrapper";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatTableModule,
    ChartWrapper
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  displayedColumns: string[] = ["data", "tipo", "categoria", "descricao", "valor"];
  public movimentacaoService = inject(MovimentacaoService);

  // Gráfico 1: Doughnut (Entradas x Saídas)
  doughnutData = computed<ChartConfiguration['data']>(() => ({
    labels: ["Entradas", "Saídas"],
    datasets: [{
      data: [this.movimentacaoService.totalEntradas(), this.movimentacaoService.totalSaidas()],
      backgroundColor: ["#16a34a", "#dc2626"],
      borderWidth: 0,
    }],
  }));
  doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: { legend: { position: "bottom", labels: { boxWidth: 10 } } },
  };

  // Gráfico 2: Linha (Evolução do Saldo)
  lineData = computed<ChartConfiguration['data']>(() => {
    const dados = this.movimentacaoService.movimentacoesOrdenadas();
    const cronologica = [...dados].sort((a, b) => (a.data > b.data ? 1 : -1));
    let acumulado = 0;
    const pontos = cronologica.map((m) => {
      acumulado += m.tipo === "Entrada" ? m.valor : -m.valor;
      return { data: m.data, saldo: acumulado };
    });
    return {
      labels: pontos.map((p) => this.formatarDataCurta(p.data)),
      datasets: [{
        label: "Saldo",
        data: pontos.map((p) => p.saldo),
        borderColor: "#1e3a8a",
        backgroundColor: "rgba(30, 58, 138, 0.08)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      }],
    };
  });
  lineOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { callback: (v: any) => "R$ " + v } } },
  };

  // Gráfico 3: Barras (Gastos por Categoria)
  barData = computed<ChartConfiguration['data']>(() => {
    const dados = this.movimentacaoService.movimentacoesOrdenadas();
    const porCategoria = new Map<CategoriaMovimentacao, number>();
    for (const m of dados) {
      if (m.tipo !== "Saida") continue;
      porCategoria.set(m.categoria, (porCategoria.get(m.categoria) ?? 0) + m.valor);
    }
    const entradas = [...porCategoria.entries()].sort((a, b) => b[1] - a[1]);
    return {
      labels: entradas.map(([cat]) => cat),
      datasets: [{
        data: entradas.map(([, valor]) => valor),
        backgroundColor: "#2f56c4",
        borderRadius: 4,
        maxBarThickness: 36,
      }],
    };
  });
  barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { callback: (v: any) => "R$ " + v } } },
  };

  private formatarDataCurta(iso: string): string {
    const [, mes, dia] = iso.split("-");
    return `${dia}/${mes}`;
  }
}
