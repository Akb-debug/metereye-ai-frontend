// ✅ CRÉÉ — bar-chart.component.ts (graphique CSS/SVG, zéro dépendance externe)

import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BarChartData {
  labels:  string[];
  values:  number[];
  color?:  string;
  unit?:   string;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-wrap">
      @if (data().values.length === 0) {
        <div class="chart-empty">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <p>Aucune donnée disponible</p>
        </div>
      } @else {
        <div class="chart-bars">
          @for (item of chartItems(); track $index) {
            <div class="bar-col">
              <span class="bar-value">{{ item.value | number:'1.1-1' }}{{ data().unit ?? '' }}</span>
              <div class="bar-track">
                <div class="bar-fill"
                  [style.height.%]="item.heightPct"
                  [style.background]="data().color ?? '#1A73E8'">
                </div>
              </div>
              <span class="bar-label">{{ item.label }}</span>
            </div>
          }
        </div>
        <div class="chart-axis">
          <span>{{ maxVal() | number:'1.0-0' }}{{ data().unit ?? '' }}</span>
          <span>{{ (maxVal() / 2) | number:'1.0-0' }}{{ data().unit ?? '' }}</span>
          <span>0</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-wrap { display:flex; gap:12px; width:100%; height:200px; }
    .chart-bars { display:flex; align-items:flex-end; gap:8px; flex:1; height:100%; }
    .bar-col { display:flex; flex-direction:column; align-items:center; flex:1; gap:4px; height:100%; justify-content:flex-end; }
    .bar-value { font-size:11px; color:#6B7280; font-weight:500; }
    .bar-track { width:100%; flex:1; background:#F3F4F6; border-radius:4px 4px 0 0; display:flex; align-items:flex-end; min-height:0; }
    .bar-fill { width:100%; border-radius:4px 4px 0 0; transition:height .5s ease; min-height:4px; }
    .bar-label { font-size:11px; color:#9CA3AF; white-space:nowrap; }
    .chart-axis { display:flex; flex-direction:column; justify-content:space-between; font-size:11px; color:#9CA3AF; padding: 24px 0 20px; width:32px; text-align:right; }
    .chart-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; gap:8px; color:#9CA3AF; font-size:13px; }
  `]
})
export class BarChartComponent {
  data = input.required<BarChartData>();

  maxVal = computed(() => Math.max(...this.data().values, 1));

  chartItems = computed(() =>
    this.data().values.map((v, i) => ({
      value:     v,
      label:     this.data().labels[i] ?? '',
      heightPct: (v / this.maxVal()) * 100
    }))
  );
}
