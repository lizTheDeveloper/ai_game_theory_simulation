/**
 * Phosphorus Depletion Crisis System (TIER 1.1)
 * 
 * Research-backed modeling of phosphate rock depletion, the #1 bottleneck for food production
 * (after water, before nitrogen which is infinite from atmosphere).
 * 
 * Key Mechanisms:
 * - Non-renewable resource depletion (unlike nitrogen)
 * - Geopolitical concentration (Morocco: 70% of global reserves)
 * - Supply shocks and weaponization (historical precedent 2007-2008, 2022-2024)
 * - Agricultural inefficiency (only 20% reaches humans)
 * - Environmental pollution (eutrophication feedback)
 * - Circular economy solutions (struvite recovery, soil optimization)
 * 
 * Research Sources: 32 peer-reviewed papers (2024-2025)
 * - Peak phosphorus: ~2070 (Cordell 2009, Mew 2024, Science Direct 2024)
 * - Morocco reserves: 50B tonnes / 70% global (World Population Review 2025, USGS 2024)
 * - Price spikes: China 135% tariff 2007-2008 (Nature 2023)
 * - Struvite recovery: 98.3% efficiency (Science Direct 2024)
 * - Soil optimization: 6.6 Tg P/year surplus (Nature 2025)
 */

export interface PhosphorusSystem {
  // === STATE TRACKING ===
  
  /** Phosphate rock reserves [0,1] - Starts at 1.0 (2025 baseline) */
  reserves: number;
  
  /** Geopolitical tension level [0,1] - Morocco controls 70%, weaponization risk */
  geopoliticalTension: number;
  
  /** Price index [0,10] - 1.0 = baseline 2025 price, 10.0 = crisis pricing */
  priceIndex: number;
  
  /** Total use efficiency [0,1] - Currently ~0.20 (20% of mined P reaches humans) */
  useEfficiency: number;
  
  /** Recovery rate from wastewater/soil [0,1] - Circular economy strength */
  recoveryRate: number;
  
  /** Environmental pollution from excess P [0,1] - Eutrophication, dead zones */
  pollutionLevel: number;
  
  // === CRISIS FLAGS ===
  
  /** Active supply shock (geopolitical disruption) */
  supplyShockActive: boolean;
  
  /** Months remaining in supply shock */
  supplyShockDuration: number;
  
  /** Critical depletion (reserves < 0.30) */
  criticalDepletionActive: boolean;
  
  /** Peak phosphorus reached (decline phase begins) */
  peakPhosphorusReached: boolean;
  
  // === BREAKTHROUGH TECHNOLOGY DEPLOYMENT ===
  
  /** Struvite recovery from wastewater (98.3% efficiency) */
  struviteDeployment: number; // [0,1]
  
  /** Dynamic soil optimization (unlock legacy P) */
  soilOptimizationDeployment: number; // [0,1]
  
  /** P-efficient cultivars (mycorrhizal partnerships) */
  efficientCropsDeployment: number; // [0,1]
  
  /** Full circular food systems (integrated) */
  circularSystemsDeployment: number; // [0,1]
}

export interface PhosphorusSupplyShock {
  /** Year the shock occurred */
  year: number;
  
  /** Cause of the shock */
  cause: 'geopolitical_weapon' | 'transport_crisis' | 'production_failure' | 'market_speculation';
  
  /** Price multiplier during shock */
  priceMultiplier: number;
  
  /** Duration in months */
  duration: number;
}

