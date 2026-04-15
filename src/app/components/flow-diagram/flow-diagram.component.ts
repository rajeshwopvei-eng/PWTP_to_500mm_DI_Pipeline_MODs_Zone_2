import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowStateService } from '../../services/flow-state.service';

@Component({
  selector: 'app-flow-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diagram-host">
      <svg width="100%" height="100%" viewBox="0 100 1000 800" preserveAspectRatio="xMidYMid meet">
        <!-- Definitions -->
        <defs>
          <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(0,0,0,0.1)" />
            <stop offset="50%" style="stop-color:rgba(0,0,0,0)" />
            <stop offset="100%" style="stop-color:rgba(0,0,0,0.1)" />
          </linearGradient>
        </defs>

        <!-- Pipelines Background -->
        <g *ngFor="let pipe of pipelines()">
          <path 
            [attr.d]="getPath(pipe.points)"
            fill="none"
            stroke="#e2e8f0"
            [attr.stroke-width]="getFlowWidth(pipe.params.diameter) + 2"
            stroke-linecap="round"
          />
        </g>

        <!-- Dynamic Flow -->
        <g *ngFor="let pipe of pipelines()">
          <path 
            [attr.d]="getPath(pipe.points)"
            fill="none"
            [attr.stroke]="getFlowColor(pipe.results.pressureDrop)"
            [attr.stroke-width]="getFlowWidth(pipe.params.diameter)"
            class="pipe-base"
          />
          <path 
            [attr.d]="getPath(pipe.points)"
            fill="none"
            stroke="white"
            [attr.stroke-width]="getFlowWidth(pipe.params.diameter) * 0.4"
            stroke-dasharray="4, 12"
            class="flow-line"
          />
          
          <!-- Midpoint Labels -->
          <g [attr.transform]="'translate(' + getMidPoint(pipe.points).x + ',' + getMidPoint(pipe.points).y + ')'">
            <rect x="-45" y="-32" width="90" height="24" rx="12" class="label-bg"/>
            <text x="0" y="-16" class="pipe-label-text">V: {{ pipe.results.velocity.toFixed(2) }} m/s</text>
          </g>
        </g>

        <!-- Valves -->
        <g *ngFor="let valve of valves()" [attr.transform]="'translate(' + valve.position.x + ',' + valve.position.y + ')'" class="valve-group">
          <path 
            d="M-10,-8 L10,8 L10,-8 L-10,8 Z" 
            [attr.fill]="valve.status === 'open' ? '#34d399' : '#f87171'" 
            stroke="white"
            stroke-width="1"
          />
        </g>

        <!-- Chambers -->
        <g *ngFor="let chamber of chambers()" [attr.transform]="'translate(' + chamber.position.x + ',' + chamber.position.y + ')'" class="node-group">
          <rect x="-50" y="-35" width="100" height="70" rx="6" [attr.class]="'node-box ' + chamber.type" />
          
          <!-- Liquid Fill -->
          <rect 
            x="-48" [attr.y]="33 - (chamber.levelPercentage * 0.66)" 
            width="96" [attr.height]="chamber.levelPercentage * 0.66" 
            class="fill-liquid"
          />

          <!-- Labels -->
          <text y="-45" text-anchor="middle" class="label-name text-uppercase small fw-bold">{{ chamber.name }}</text>
          <text y="5" text-anchor="middle" class="label-main fw-bold">{{ chamber.outflow.toFixed(0) }} m³/h</text>
          <text y="18" text-anchor="middle" class="label-sub small fw-bold" *ngIf="chamber.pressure">P: {{ chamber.pressure }} bar</text>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    .diagram-host { width: 100%; height: 100%; background: #ffffff; cursor: crosshair; }
    
    .pipe-base { stroke-linecap: round; stroke-linejoin: round; transition: stroke 0.5s; opacity: 1; }
    .flow-line { animation: flow-anim 2s linear infinite; opacity: 0.6; }
    
    .node-box { stroke-width: 2; fill: #ffffff; stroke: #cbd5e1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05)); }
    .node-box.wtp { fill: #f0f9ff; stroke: #0ea5e9; }
    .node-box.booster { fill: #fff7ed; stroke: #f97316; }
    .node-box.station { fill: #fdf4ff; stroke: #a855f7; }
    .node-box.swip { fill: #f5f3ff; stroke: #6366f1; }
    .node-box.pjt { fill: #fffbeb; stroke: #f59e0b; }

    .fill-liquid { fill: #0ea5e9; opacity: 0.2; pointer-events: none; }
    
    .label-name { fill: #64748b; font-size: 10px; font-weight: 700; }
    .label-main { fill: #0f172a; font-size: 13px; font-family: 'Roboto Mono', monospace; }
    .label-sub { fill: #0ea5e9; font-size: 10px; font-family: monospace; }
    
    .label-bg { fill: rgba(255,255,255,0.9); stroke: #e2e8f0; stroke-width: 1; }
    .pipe-label-text { fill: #0f172a; font-size: 10px; font-weight: 700; text-anchor: middle; font-family: monospace; }

    .valve-group { cursor: pointer; transition: transform 0.2s; &:hover { transform: scale(1.2); } }

    @keyframes flow-anim {
      from { stroke-dashoffset: 24; }
      to { stroke-dashoffset: 0; }
    }
  `]
})
export class FlowDiagramComponent {
  private state = inject(FlowStateService);
  
  pipelines = computed(() => this.state.calculatedSystem().pipelines);
  chambers = computed(() => this.state.calculatedSystem().chambers);
  valves = computed(() => this.state.calculatedSystem().valves);

  getPath(points: {x: number, y: number}[]): string {
    if (!points.length) return '';
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  getMidPoint(points: {x: number, y: number}[]) {
    const mid = Math.floor(points.length / 2);
    if (points.length % 2 === 0 && mid > 0) {
      return { x: (points[mid-1].x + points[mid].x) / 2, y: (points[mid-1].y + points[mid].y) / 2 };
    }
    return points[mid];
  }

  getFlowWidth(diameter: number): number {
    return Math.max(4, diameter / 120);
  }

  getFlowColor(pressureDrop?: number): string {
    if (!pressureDrop) return '#0ea5e9';
    if (pressureDrop > 1.0) return '#ef4444';
    if (pressureDrop > 0.5) return '#f97316';
    return '#0ea5e9';
  }
}
