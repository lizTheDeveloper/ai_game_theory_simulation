// Technology Types

export interface TechnologyNode {
  id: string;
  name: string;
  description: string;
  branch: 'foundation' | 'applied' | 'alignment' | 'policy';
  subBranch: string;
  difficulty: 'low' | 'medium' | 'high' | 'very_high';
  prerequisites: string[];
  effects: string[];
  progress: number; // [0,1] Research progress
  completed: boolean;
  investment: number; // Current research investment

  // === ENERGY-CONSTRAINED CLEANUP (TIER 1 CRITICAL - Nov 16, 2025) ===
  // Research: Novel Entities irreversibility framework
  cleanupEnergyRequirement?: number; // GJ/ton of contaminant removed
  minimumConcentration?: number; // mg/L - tech only effective above this threshold
  concentrationType?: 'rainwater' | 'surfaceWater' | 'groundwater' | 'concentratedWaste';

  // === REBOUND EFFECT MECHANICS (Nov 16, 2025) ===
  reboundCoefficient?: number; // Production increase per unit cleanup
  reboundUncertaintyRange?: [number, number]; // [min, max] for Monte Carlo sensitivity
  avoidsRebound?: boolean; // True for production bans (no moral hazard)
}
