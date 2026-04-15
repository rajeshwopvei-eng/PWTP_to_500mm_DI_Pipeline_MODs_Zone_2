import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { FlowStateService } from '../../services/flow-state.service';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatExpansionModule
  ],
  template: `
    <div class="p-4">
      <div class="d-flex align-items-center gap-2 mb-4">
        <i class='bx bx-cog fs-4 text-primary'></i>
        <h2 class="m-0 fs-5 fw-bold text-dark">System configuration</h2>
      </div>

      <mat-card class="border-0 shadow-sm-clean mb-4 br-12 overflow-hidden">
        <div class="bg-primary p-2 text-center text-white small fw-bold">MASTER FLOW</div>
        <mat-card-content class="p-3">
          <div class="mb-3">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Total Flow Rate</mat-label>
              <input matInput type="number" [ngModel]="state.system().totalFlowRate" (ngModelChange)="state.updateTotalFlow($event)">
              <span matSuffix class="ms-1 small">m³/h</span>
            </mat-form-field>
          </div>
          <div>
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Source Pressure</mat-label>
              <input matInput type="number" step="0.1" [ngModel]="state.system().sourcePressure" (ngModelChange)="state.updateSourcePressure($event)">
              <span matSuffix class="ms-1 small">Bar</span>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="d-flex align-items-center gap-2 mb-3 mt-4">
        <i class='bx bx-git-branch fs-5 text-secondary'></i>
        <h3 class="m-0 fs-6 fw-bold text-secondary text-uppercase ls-1">Pipe segments</h3>
      </div>

      <mat-accordion multi class="custom-accordion">
        <mat-expansion-panel *ngFor="let pipe of state.system().pipelines" class="border-0 shadow-sm-clean mb-2 br-12 overflow-hidden">
          <mat-expansion-panel-header>
            <mat-panel-title class="fw-bold small d-flex align-items-center gap-2">
               <i class='bx bx-chevron-right text-primary'></i> {{ pipe.id }}
            </mat-panel-title>
          </mat-expansion-panel-header>
          
          <div class="row g-2 mt-2">
            <div class="col-6">
              <mat-form-field appearance="outline" class="w-100 dense-input">
                <mat-label>Length (m)</mat-label>
                <input matInput type="number" [ngModel]="pipe.params.length" (ngModelChange)="state.updatePipeParams(pipe.id, {length: $event})">
              </mat-form-field>
            </div>
            <div class="col-6">
              <mat-form-field appearance="outline" class="w-100 dense-input">
                <mat-label>C-Value</mat-label>
                <input matInput type="number" [ngModel]="pipe.params.cValue" (ngModelChange)="state.updatePipeParams(pipe.id, {cValue: $event})">
              </mat-form-field>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dense-input { font-size: 12px; }
    .custom-accordion {
      ::ng-deep .mat-expansion-panel-body { padding: 0 16px 16px 16px; }
    }
    .ls-1 { letter-spacing: 1px; }
  `]
})
export class ControlPanelComponent {
  protected state = inject(FlowStateService);
}
