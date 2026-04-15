import { Injectable, signal, computed, inject } from '@angular/core';
import { FlowSystem, Chamber, Pipeline, Valve } from '../models/flow-system.model';
import { CalculationService } from './calculation.service';

@Injectable({
  providedIn: 'root'
})
export class FlowStateService {
  private calcService = inject(CalculationService);

  private readonly initialSystem: FlowSystem = {
    sourcePressure: 3.62,
    totalFlowRate: 10700,
    chambers: [
      { id: 'padma', name: 'PADMA Water Treatment Plant', type: 'wtp', position: { x: 800, y: 700 }, inflow: 0, outflow: 10700, levelPercentage: 85 },
      { id: 'booster', name: 'Booster Station', type: 'booster', position: { x: 800, y: 550 }, inflow: 10700, outflow: 10100, pressure: 5.4, levelPercentage: 40 },
      { id: 'mitford', name: 'Mitford Landing Station', type: 'station', position: { x: 800, y: 400 }, inflow: 9800, outflow: 9800, pressure: 5.3, levelPercentage: 50 },
      { id: 'pjt01', name: 'PJT-01', type: 'pjt', position: { x: 740, y: 280 }, inflow: 1200, outflow: 1200, pressure: 3.5, levelPercentage: 45 },
      { id: 'swip214', name: 'SWIP-214', type: 'swip', position: { x: 580, y: 350 }, inflow: 250, outflow: 250, pressure: 1.9, levelPercentage: 30 },
      { id: 'swip212', name: 'SWIP-212', type: 'swip', position: { x: 450, y: 220 }, inflow: 7, outflow: 7, pressure: 2.3, levelPercentage: 60 },
      { id: 'swip211', name: 'SWIP-211', type: 'swip', position: { x: 250, y: 350 }, inflow: 300, outflow: 300, pressure: 2.0, levelPercentage: 50 },
      { id: 'chandnighat', name: 'Chandnighat WTP', type: 'wtp', position: { x: 350, y: 150 }, inflow: 0, outflow: 518, levelPercentage: 70 },
      { id: 'swip208', name: 'SWIP-208', type: 'swip', position: { x: 50, y: 230 }, inflow: 100, outflow: 100, levelPercentage: 40 }
    ],
    pipelines: [
      { 
        id: 'pipe1', sourceId: 'padma', targetId: 'booster', 
        params: { diameter: 2000, length: 22340, cValue: 140 }, 
        points: [{ x: 800, y: 700 }, { x: 800, y: 560 }] 
      },
      { 
        id: 'pipe2', sourceId: 'booster', targetId: 'mitford', 
        params: { diameter: 2000, length: 9960, cValue: 140 }, 
        points: [{ x: 800, y: 550 }, { x: 800, y: 410 }] 
      },
      { 
        id: 'pipe3', sourceId: 'mitford', targetId: 'pjt01', 
        params: { diameter: 1000, length: 200, cValue: 120 }, 
        points: [{ x: 800, y: 400 }, { x: 800, y: 280 }, { x: 750, y: 280 }] 
      },
      { 
        id: 'pipe4', sourceId: 'pjt01', targetId: 'swip214', 
        params: { diameter: 500, length: 3110, cValue: 110 }, 
        points: [{ x: 730, y: 280 }, { x: 580, y: 280 }, { x: 580, y: 340 }] 
      },
      { 
        id: 'pipe5', sourceId: 'swip214', targetId: 'swip212', 
        params: { diameter: 500, length: 1500, cValue: 110 }, 
        points: [{ x: 580, y: 280 }, { x: 450, y: 280 }, { x: 450, y: 230 }] 
      },
      { 
        id: 'pipe6', sourceId: 'chandnighat', targetId: 'swip211', 
        params: { diameter: 450, length: 35, cValue: 100 }, 
        points: [{ x: 350, y: 160 }, { x: 350, y: 280 }, { x: 250, y: 280 }, { x: 250, y: 340 }] 
      }
    ],
    valves: [
      { id: 'v1', position: { x: 680, y: 280 }, status: 'open', type: 'gate' },
      { id: 'v2', position: { x: 520, y: 280 }, status: 'closed', type: 'gate' },
      { id: 'v3', position: { x: 380, y: 200 }, status: 'open', type: 'gate' }
    ]
  };

  system = signal<FlowSystem>(this.initialSystem);

  calculatedSystem = computed(() => {
    const sys = { ...this.system() };
    const processedPipelines = sys.pipelines.map(pipe => {
      // Find source pressure and flow
      const sourceChamber = sys.chambers.find(c => c.id === pipe.sourceId);
      const startPressure = sourceChamber?.pressure || sys.sourcePressure;
      const flow = sourceChamber?.outflow || sys.totalFlowRate;
      
      const results = this.calcService.calculatePipeResults(flow, pipe.params, startPressure);
      return { ...pipe, results };
    });

    return { ...sys, pipelines: processedPipelines };
  });

  updateTotalFlow(flow: number) { this.system.update(s => ({ ...s, totalFlowRate: flow })); }
  updateSourcePressure(pressure: number) { this.system.update(s => ({ ...s, sourcePressure: pressure })); }
  updatePipeParams(pipeId: string, params: any) {
    this.system.update(s => ({
      ...s,
      pipelines: s.pipelines.map(p => p.id === pipeId ? { ...p, params: { ...p.params, ...params } } : p)
    }));
  }
}
