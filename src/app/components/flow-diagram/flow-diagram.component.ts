import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowStateService } from '../../services/flow-state.service';

@Component({
  selector: 'app-flow-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diagram-host">
      <svg width="100%" height="100%" viewBox="0 0 1050 800" preserveAspectRatio="xMidYMid meet">
        <!-- Pipelines Background -->
        <g *ngFor="let pipe of pipelines()">
          <path 
            [attr.d]="getPath(pipe.points)"
            fill="none"
            stroke="#1e293b"
            [attr.stroke-width]="getFlowWidth(pipe.params.diameter) + 4"
            stroke-linecap="round"
            opacity="0.1"
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
            stroke-dasharray="8, 24"
            class="flow-line"
          />
          
          <!-- Directional Arrow -->
          <g *ngIf="pipe.hasArrow" [attr.transform]="'translate(' + getMidPoint(pipe.points).x + ',' + (getMidPoint(pipe.points).y - 40) + ')'">
            <path d="M 0 0 L -10 15 L 10 15 Z" fill="#0ea5e9" opacity="0.8">
               <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
               <animateTransform attributeName="transform" type="translate" values="0 10; 0 -10; 0 10" dur="2s" repeatCount="indefinite" />
            </path>
          </g>

          <!-- Midpoint Labels -->
          <g [attr.transform]="'translate(' + getMidPoint(pipe.points).x + ',' + (getMidPoint(pipe.points).y) + ')'">
            <rect x="-55" y="-45" width="110" height="36" rx="6" class="label-bg shadow"/>
            <text x="0" y="-30" class="pipe-label-text q">Q: {{ pipe.results.flowRate.toFixed(0) }} m³/h</text>
            <text x="0" y="-16" class="pipe-label-text v">V: {{ pipe.results.velocity.toFixed(2) }} m/s</text>
          </g>
        </g>

        <!-- Valves -->
        <g *ngFor="let valve of valves()" [attr.transform]="'translate(' + valve.position.x + ',' + valve.position.y + ')'" class="valve-group">
          <circle r="14" fill="white" stroke="#e2e8f0" stroke-width="1" />
          <path 
            d="M-8,-6 L8,6 L8,-6 L-8,6 Z" 
            [attr.fill]="valve.status === 'open' ? '#10b981' : '#ef4444'" 
            stroke-width="1"
          />
        </g>

        <!-- Chambers -->
        <g *ngFor="let chamber of chambers()" [attr.transform]="'translate(' + chamber.position.x + ',' + chamber.position.y + ')'" class="node-group">
          <rect x="-45" y="-30" width="90" height="60" rx="4" [attr.class]="'node-box ' + chamber.type" />
          
          <!-- Liquid Fill -->
          <rect 
            x="-43" [attr.y]="28 - (chamber.levelPercentage * 0.56)" 
            width="86" [attr.height]="chamber.levelPercentage * 0.56" 
            class="fill-liquid"
          />

          <!-- Labels -->
          <text y="-40" text-anchor="middle" class="label-name">{{ chamber.name }}</text>
          <text y="5" text-anchor="middle" class="label-main">{{ chamber.outflow.toFixed(0) }}</text>
          <text y="18" text-anchor="middle" class="label-sub" *ngIf="chamber.pressure">P: {{ chamber.pressure }}</text>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    .diagram-host { width: 100%; height: 100%; background: #f8fafc; overflow: hidden; }
    
    .pipe-base { stroke-linecap: round; stroke-linejoin: round; transition: stroke 0.5s; opacity: 1; }
    .flow-line { animation: flow-anim 3s linear infinite; opacity: 0.5; }
    
    .node-box { stroke-width: 2; fill: #ffffff; stroke: #94a3b8; }
    .node-box.wtp { fill: #e0f2fe; stroke: #0891b2; }
    .node-box.booster { fill: #fff7ed; stroke: #f97316; }
    .node-box.station { fill: #fdf4ff; stroke: #a855f7; }
    .node-box.swip { fill: #eff6ff; stroke: #2563eb; }
    .node-box.pjt { fill: #fff7ed; stroke: #ea580c; }

    .fill-liquid { fill: #0ea5e9; opacity: 0.3; pointer-events: none; }
    
    .label-name { fill: #475569; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .label-main { fill: #1e293b; font-size: 14px; font-weight: 800; font-family: 'Roboto Mono', monospace; }
    .label-sub { fill: #0284c7; font-size: 10px; font-weight: 700; font-family: monospace; }
    
    .label-bg { fill: rgba(255,255,255,0.95); stroke: #cbd5e1; stroke-width: 1; backdrop-filter: blur(2px); }
    .pipe-label-text { fill: #1e293b; font-size: 10px; font-weight: 800; text-anchor: middle; font-family: 'Roboto Mono', monospace; }
    .pipe-label-text.q { fill: #0369a1; }
    .pipe-label-text.v { fill: #475569; }

    .valve-group { cursor: pointer; }

    @keyframes flow-anim {
      from { stroke-dashoffset: 64; }
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
