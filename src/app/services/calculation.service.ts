import { Injectable } from '@angular/core';
import { PipeParams, PipeCalculationResults } from '../models/flow-system.model';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {
  private readonly GRAVITY = 9.80665;
  private readonly WATER_DENSITY = 1000; // kg/m3

  /**
   * Calculates hydraulic results for a pipe segment
   * @param flowRate m3/h
   * @param params Pipe parameters
   * @param startPressure bar
   */
  calculatePipeResults(flowRate: number, params: PipeParams, startPressure: number): PipeCalculationResults {
    const { diameter, length, cValue } = params;
    
    // 1. Velocity Calculation
    // Area in m2
    const d_m = diameter / 1000;
    const area = (Math.PI * Math.pow(d_m, 2)) / 4;
    // Flow in m3/s
    const q_m3s = flowRate / 3600;
    const velocity = q_m3s / area;

    // 2. Head Loss Calculation (Hazen-Williams)
    // hf = 10.67 * L * (Q^1.852) / (C^1.852 * D^4.87)
    // Using Q in m3/s and D in meters
    const headLoss = 10.67 * length * Math.pow(q_m3s, 1.852) / (Math.pow(cValue, 1.852) * Math.pow(d_m, 4.87));

    // 3. Pressure Drop Calculation
    // 1 bar = 100,000 Pa
    // P = rho * g * h
    const pressureDropPa = this.WATER_DENSITY * this.GRAVITY * headLoss;
    const pressureDrop = pressureDropPa / 100000;
    
    const endPressure = Math.max(0, startPressure - pressureDrop);

    return {
      velocity,
      headLoss,
      pressureDrop,
      endPressure,
      flowRate
    };
  }
}
