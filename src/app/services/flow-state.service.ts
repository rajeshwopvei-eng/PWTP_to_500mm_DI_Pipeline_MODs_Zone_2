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
      { id: 'padma', name: 'PADMA WTP', type: 'wtp', position: { x: 880, y: 750 }, inflow: 0, outflow: 10700, levelPercentage: 85 },
      { id: 'booster', name: 'Booster Station', type: 'booster', position: { x: 880, y: 550 }, inflow: 10700, outflow: 10100, pressure: 5.4, levelPercentage: 40 },
      { id: 'mitford', name: 'Mitford Landing', type: 'station', position: { x: 880, y: 350 }, inflow: 9800, outflow: 9800, pressure: 5.3, levelPercentage: 50 },
      { id: 'top_main', name: 'Transmission Main', type: 'station', position: { x: 880, y: 50 }, inflow: 8700, outflow: 8700, pressure: 4.8, levelPercentage: 10 },
      { id: 'pjt01', name: 'PJT-01', type: 'pjt', position: { x: 780, y: 350 }, inflow: 1100, outflow: 1100, pressure: 3.5, levelPercentage: 45 },
      { id: 'swip214', name: 'SWIP-214', type: 'swip', position: { x: 700, y: 220 }, inflow: 250, outflow: 250, pressure: 1.9, levelPercentage: 30 },
      { id: 'swip212a', name: 'SWIP-212A', type: 'swip', position: { x: 620, y: 220 }, inflow: 250, outflow: 250, pressure: 2.1, levelPercentage: 40 },
      { id: 'swip212b', name: 'SWIP-212B', type: 'swip', position: { x: 540, y: 220 }, inflow: 250, outflow: 250, pressure: 1.8, levelPercentage: 35 },
      { id: 'chandnighat', name: 'Chandnighat WTP', type: 'wtp', position: { x: 450, y: 120 }, inflow: 0, outflow: 518, levelPercentage: 70 },
      { id: 'swip211a', name: 'SWIP-211A', type: 'swip', position: { x: 340, y: 480 }, inflow: 250, outflow: 250, pressure: 2.0, levelPercentage: 50 },
      { id: 'swip211b', name: 'SWIP-211B', type: 'swip', position: { x: 260, y: 480 }, inflow: 250, outflow: 250, pressure: 1.7, levelPercentage: 45 },
      { id: 'swip210a', name: 'SWIP-210A', type: 'swip', position: { x: 180, y: 480 }, inflow: 250, outflow: 250, pressure: 1.4, levelPercentage: 40 },
      { id: 'swip208', name: 'SWIP-208', type: 'swip', position: { x: 60, y: 220 }, inflow: 250, outflow: 250, pressure: 1.1, levelPercentage: 35 }
    ],
    pipelines: [
      { id: 'p1', sourceId: 'padma', targetId: 'booster', params: { diameter: 2000, length: 22340, cValue: 140 }, points: [{ x: 880, y: 740 }, { x: 880, y: 560 }] },
      { id: 'p2', sourceId: 'booster', targetId: 'mitford', params: { diameter: 2000, length: 9960, cValue: 140 }, points: [{ x: 880, y: 540 }, { x: 880, y: 360 }] },
      { id: 'p3', sourceId: 'mitford', targetId: 'top_main', params: { diameter: 1000, length: 1000, cValue: 140 }, points: [{ x: 880, y: 340 }, { x: 880, y: 60 }], hasArrow: true, fixedFlow: 8700 },
      { id: 'p4', sourceId: 'mitford', targetId: 'pjt01', params: { diameter: 1000, length: 200, cValue: 120 }, points: [{ x: 870, y: 350 }, { x: 790, y: 350 }] },
      { id: 'p-trunk', sourceId: 'pjt01', targetId: 'swip208', params: { diameter: 500, length: 5000, cValue: 120 }, points: [{ x: 770, y: 350 }, { x: 40, y: 350 }], fixedFlow: 2000 },
      { id: 'p5', sourceId: 'pjt01', targetId: 'swip214', params: { diameter: 300, length: 100, cValue: 110 }, points: [{ x: 700, y: 350 }, { x: 700, y: 230 }] },
      { id: 'p6', sourceId: 'pjt01', targetId: 'swip212a', params: { diameter: 300, length: 100, cValue: 110 }, points: [{ x: 620, y: 350 }, { x: 620, y: 230 }] },
      { id: 'p7', sourceId: 'pjt01', targetId: 'swip212b', params: { diameter: 300, length: 100, cValue: 110 }, points: [{ x: 540, y: 350 }, { x: 540, y: 230 }] },
      { id: 'p-cwtp', sourceId: 'chandnighat', targetId: 'swip211a', params: { diameter: 450, length: 500, cValue: 100 }, points: [{ x: 450, y: 130 }, { x: 450, y: 300 }, { x: 340, y: 350 }], fixedFlow: 518 },
      { id: 'p9', sourceId: 'pjt01', targetId: 'swip211a', params: { diameter: 300, length: 100, cValue: 110 }, points: [{ x: 340, y: 350 }, { x: 340, y: 470 }] },
      { id: 'p10', sourceId: 'pjt01', targetId: 'swip211b', params: { diameter: 300, length: 100, cValue: 110 }, points: [{ x: 260, y: 350 }, { x: 260, y: 470 }] },
      { id: 'p11', sourceId: 'pjt01', targetId: 'swip210a', params: { diameter: 300, length: 100, cValue: 110 }, points: [{ x: 180, y: 350 }, { x: 180, y: 470 }] },
      { id: 'p12', sourceId: 'pjt01', targetId: 'swip208', params: { diameter: 300, length: 100, cValue: 110 }, points: [{ x: 60, y: 350 }, { x: 60, y: 230 }] }
    ],
    valves: [
      { id: 'v1', position: { x: 800, y: 350 }, status: 'open', type: 'gate' },
      { id: 'v2', position: { x: 450, y: 305 }, status: 'open', type: 'gate' },
      { id: 'v3', position: { x: 50, y: 350 }, status: 'open', type: 'gate' }
    ]
  };

  system = signal<FlowSystem>(this.initialSystem);

  calculatedSystem = computed(() => {
    const sys = { ...this.system() };
    const processedPipelines = sys.pipelines.map(pipe => {
      const sourceChamber = sys.chambers.find(c => c.id === pipe.sourceId);
      const startPressure = sourceChamber?.pressure || sys.sourcePressure;
      const flow = pipe.fixedFlow || sourceChamber?.outflow || sys.totalFlowRate;
      
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
