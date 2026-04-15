export interface Point {
  x: number;
  y: number;
}

export interface PipeParams {
  diameter: number; // mm
  length: number;   // m
  cValue: number;   // Hazen-Williams coefficient
}

export interface PipeCalculationResults {
  velocity: number;      // m/s
  headLoss: number;      // m
  pressureDrop: number;   // bar
  endPressure: number;    // bar
  flowRate: number;      // m3/h
}

export interface Pump {
  id: string;
  name: string;
  capacityKw: number;
  flowQ: number;
  head: number;
  status: 'running' | 'stopped';
}

export interface Valve {
  id: string;
  position: Point;
  status: 'open' | 'closed';
  type: 'gate' | 'check';
}

export interface Chamber {
  id: string;
  name: string;
  type: 'wtp' | 'booster' | 'station' | 'swip' | 'pjt';
  position: Point;
  inflow: number;
  outflow: number;
  pressure?: number;
  levelPercentage: number;
  pump?: Pump;
}

export interface Pipeline {
  id: string;
  sourceId: string;
  targetId: string;
  params: PipeParams;
  results?: PipeCalculationResults;
  points: Point[];
  labelPosition?: Point;
  fixedFlow?: number;
  hasArrow?: boolean;
}

export interface FlowSystem {
  sourcePressure: number;
  totalFlowRate: number;
  chambers: Chamber[];
  pipelines: Pipeline[];
  valves: Valve[];
}

