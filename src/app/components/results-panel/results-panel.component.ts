import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlowStateService } from '../../services/flow-state.service';

@Component({
  selector: 'app-results-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule],
  template: `
    <div class="p-4">
      <div class="d-flex align-items-center gap-2 mb-4">
        <i class='bx bx-bar-chart-alt-2 fs-4 text-primary'></i>
        <h2 class="m-0 fs-5 fw-bold text-dark">Real-time Analytics</h2>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-6">
          <div class="analyt-card p-3 rounded br-12 border bg-white shadow-sm-clean">
            <div class="d-flex align-items-center gap-2 mb-1">
              <i class='bx bx-tachometer text-info'></i>
              <span class="small fw-bold text-secondary text-uppercase">Pressure</span>
            </div>
            <div class="fs-4 fw-bold text-dark">{{ minPressure().toFixed(2) }}<span class="small text-muted ms-1">Bar</span></div>
          </div>
        </div>
        <div class="col-6">
          <div class="analyt-card p-3 rounded br-12 border bg-white shadow-sm-clean">
            <div class="d-flex align-items-center gap-2 mb-1">
              <i class='bx bx-wind text-primary'></i>
              <span class="small fw-bold text-secondary text-uppercase">Velocity</span>
            </div>
            <div class="fs-4 fw-bold text-dark">{{ maxVelocity().toFixed(2) }}<span class="small text-muted ms-1">m/s</span></div>
          </div>
        </div>
      </div>

      <div class="card border-0 bg-dark text-white p-3 br-12 shadow-md-clean mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div class="small fw-bold text-uppercase opacity-75">Max System Loss</div>
          <div class="fs-5 fw-bold text-info">{{ maxLoss().toFixed(2) }} <span class="small">m/km</span></div>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2 mb-3 mt-4">
        <i class='bx bx-buildings fs-5 text-secondary'></i>
        <h3 class="m-0 fs-6 fw-bold text-secondary text-uppercase ls-1">Node Telemetry</h3>
      </div>

      <div class="node-list">
        <div *ngFor="let chamber of state.calculatedSystem().chambers" class="node-item p-3 mb-2 bg-white border rounded br-12 shadow-sm-clean">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="fw-bold small text-dark d-flex align-items-center gap-2">
              <i class='bx bx-circle text-primary fs-6'></i> {{ chamber.name }}
            </div>
            <div class="badge bg-light text-primary rounded-pill small">{{ chamber.type }}</div>
          </div>
          
          <div class="d-flex justify-content-between mb-1 small">
            <span class="text-muted">Current Flow</span>
            <span class="fw-bold">{{ chamber.outflow.toFixed(0) }} m³/h</span>
          </div>
          <mat-progress-bar mode="determinate" [value]="chamber.levelPercentage" class="rounded-pill" style="height: 6px;"></mat-progress-bar>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ls-1 { letter-spacing: 1px; }
    .analyt-card { transition: transform 0.2s; &:hover { transform: translateY(-2px); } }
    .node-item { border-left: 4px solid var(--primary) !important; }
  `]
})
export class ResultsPanelComponent {
  protected state = inject(FlowStateService);

  minPressure = computed(() => {
    const pressures = this.state.calculatedSystem().pipelines.map(p => p.results.endPressure || 0);
    const chamberPressures = this.state.calculatedSystem().chambers.map(c => c.pressure || 999);
    return Math.min(this.state.system().sourcePressure, ...pressures, ...chamberPressures);
  });

  maxVelocity = computed(() => {
    const velocities = this.state.calculatedSystem().pipelines.map(p => p.results.velocity || 0);
    return Math.max(0, ...velocities);
  });

  maxLoss = computed(() => {
    const losses = this.state.calculatedSystem().pipelines.map(p => (p.results.headLoss || 0) / (p.params.length / 1000));
    return Math.max(0, ...losses);
  });
}
