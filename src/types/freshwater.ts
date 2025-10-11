/**
 * Freshwater Depletion Crisis System (TIER 1.2)
 * 
 * Models freshwater scarcity, the #1 resource constraint for civilization.
 * 
 * Key Mechanisms:
 * - Groundwater depletion (68% of water loss - non-renewable on human timescales)
 * - "Day Zero Drought" - compound extremes (low rainfall + reduced flow + high consumption)
 * - "Peak Groundwater" - like peak oil but for water
 * - Regional collapses (Middle East, North Africa, South Asia first)
 * - Agricultural dependency (70% of water use)
 * - Slow collapse timeline (20-50 years)
 * 
 * Research Sources:
 * - Nature (2023): Jasechko et al. - Rapid groundwater decline >0.5 m/year
 * - LA Times (Sept 2025): 368 billion metric tons/year water loss
 * - Nature (2025): "Day Zero Drought" - Time of First Emergence
 * - WWF (2024): 41% of population in water-stressed basins
 * - UC Santa Barbara (2024): Groundwater depletion accelerating but not inevitable
 * - US EPA (2024): $109B/year water infrastructure costs
 */

export interface FreshwaterSystem {
  // === WATER AVAILABILITY ===
  
  /** Blue water: Rivers, lakes, groundwater [0,1] - Starts ~0.70 (already stressed) */
  blueWater: {
    surfaceWater: number;        // Rivers, lakes [0,1]
    groundwater: number;          // Aquifer levels [0,1]
    aquiferRecharge: number;      // Natural recharge rate [0,1]
    depletionRate: number;        // Current extraction rate [0,1]
  };
  
  /** Green water: Soil moisture, evapotranspiration [0,1] */
  greenWater: {
    soilMoisture: number;         // Available to plants [0,1]
    evapotranspiration: number;   // Atmosphere-soil cycle [0,1]
  };
  
  // === DEMAND ===
  
  /** Water demand by sector (fractions, sum to 1.0) */
  demand: {
    agricultural: number;         // ~0.70 (70% of global use)
    industrial: number;           // ~0.20
    domestic: number;             // ~0.10
  };
  
  /** Total water stress index [0,1] - 0 = abundant, 1 = extreme scarcity */
  waterStress: number;
  
  /** Population under water stress [0,1] - Currently ~0.41 (WWF 2024) */
  populationStressed: number;
  
  // === CRISIS FLAGS ===
  
  /** Peak groundwater reached (decline phase begins) */
  peakGroundwaterReached: boolean;
  
  /** Day Zero Drought active (compound extremes) */
  dayZeroDrought: {
    active: boolean;
    region: string;               // Which region is hit
    duration: number;             // Months remaining
    severity: number;             // [0,1]
  };
  
  /** Critical water scarcity (groundwater < 0.30) */
  criticalScarcityActive: boolean;
  
  // === REGIONAL TRACKING ===
  
  /** Regional water stress (different areas collapse at different rates) */
  regions: {
    middleEast: number;           // [0,1] water availability
    northAfrica: number;
    southAsia: number;
    global: number;               // Average
  };
  
  // === TECHNOLOGY DEPLOYMENT ===
  
  /** Desalination plants (coastal areas) */
  desalinationDeployment: number; // [0,1]
  
  /** Water recycling & reuse */
  recyclingDeployment: number;    // [0,1]
  
  /** Precision irrigation (reduce agricultural waste) */
  precisionIrrigationDeployment: number; // [0,1]
  
  /** Atmospheric water generation (AWG) */
  atmosphericWaterDeployment: number; // [0,1]
}

export interface DayZeroEvent {
  /** Year the Day Zero drought started */
  year: number;
  
  /** Region affected */
  region: string;
  
  /** Compound extremes present */
  extremes: {
    lowRainfall: boolean;
    reducedRiverFlow: boolean;
    highConsumption: boolean;
  };
  
  /** Severity [0,1] */
  severity: number;
  
  /** Estimated duration (months) */
  duration: number;
}

