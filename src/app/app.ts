import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { FlowDiagramComponent } from './components/flow-diagram/flow-diagram.component';
import { ResultsPanelComponent } from './components/results-panel/results-panel.component';
import { ReportService } from './services/report.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    ControlPanelComponent,
    FlowDiagramComponent,
    ResultsPanelComponent
  ],
  template: `
    <div class="app-container d-flex flex-column h-100vh">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark-navy py-1 shadow-sm px-3">
        <div class="container-fluid">
          <a class="navbar-brand d-flex align-items-center gap-2" href="#">
            <i class='bx bx-water fs-3 text-info'></i>
            <span class="fw-bold tracking-tight text-uppercase ls-1">WTP <span class="text-info">SCADA</span> Studio</span>
          </a>
          
          <div class="d-flex align-items-center gap-3">
            <span class="text-white-50 small d-none d-md-inline">
              <i class='bx bx-calendar-check me-1'></i> 2026-04-15
            </span>
            <button mat-flat-button color="primary" class="rounded-pill px-4" (click)="exportReport()">
              <i class='fa fa-file-pdf-o me-2'></i> Generate Report
            </button>
          </div>
        </div>
      </nav>

      <main class="flex-grow-1 overflow-hidden">
        <div class="container-fluid h-100 p-0">
          <div class="row g-0 h-100">
            <!-- Sidebar Navigation/Controls -->
            <div class="col-md-3 h-100 border-end bg-white overflow-auto scrollbar-hide">
              <app-control-panel></app-control-panel>
            </div>

            <!-- Visualization Engine -->
            <div class="col-md-6 h-100 position-relative bg-light-mesh">
              <app-flow-diagram></app-flow-diagram>
              
              <!-- Floating Overlay Controls -->
              <div class="position-absolute bottom-0 start-50 translate-middle-x mb-4">
                <div class="btn-group shadow-md-clean bg-white rounded-pill p-1 glass-panel">
                  <button class="btn btn-light rounded-pill px-3 fw-bold small text-primary">
                    <i class='bx bx-zoom-in'></i>
                  </button>
                  <button class="btn btn-light rounded-pill px-3 fw-bold small text-primary">
                    <i class='bx bx-zoom-out'></i>
                  </button>
                  <button class="btn btn-light rounded-pill px-3 fw-bold small text-primary">
                    <i class='bx bx-reset'></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Results & Analytics -->
            <div class="col-md-3 h-100 border-start bg-white overflow-auto">
              <app-results-panel></app-results-panel>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .h-100vh { height: 100vh; }
    .bg-dark-navy { background: #0f172a; }
    .ls-1 { letter-spacing: 1px; }
    .bg-light-mesh { 
      background-color: #f1f5f9;
      background-image: radial-gradient(#cbd5e1 0.5px, transparent 0.5px);
      background-size: 20px 20px;
    }
    .rounded-pill { border-radius: 50rem !important; }
    .navbar-brand { font-size: 1.1rem; }
  `]
})
export class App {
  private reportService = inject(ReportService);

  exportReport() {
    this.reportService.generatePDF('main-dashboard', 'WTP Process Analysis Report');
  }
}
