import { Component, ElementRef, viewChild, effect, input, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-wrapper',
  imports: [],
  templateUrl: './chart-wrapper.html',
  styleUrl: './chart-wrapper.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartWrapper implements OnDestroy {
  type = input.required<ChartType>();
  data = input.required<ChartConfiguration['data']>();
  options = input<ChartConfiguration['options']>({});

  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chartInstance?: Chart;

  constructor() {
    effect(() => {
      const type = this.type();
      const data = this.data();
      const options = this.options();
      const canvas = this.canvasRef().nativeElement;

      this.chartInstance?.destroy();
      this.chartInstance = new Chart(canvas, {
        type,
        data,
        options,
      });
    });
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
  }
}
