/**
 * TIER 1.7.4: Nuclear Winter Types
 * 
 * Models the long-term catastrophic effects of nuclear war beyond immediate blast:
 * - Soot blocks sunlight for 1-3 years (stratospheric injection)
 * - Temperature drops 10-20°C globally
 * - Crops fail, leading to mass starvation
 * - Radiation poisoning in target zones
 * - Recovery takes 5-10 years
 * 
 * Research:
 * - Carl Sagan et al. (1983): "Nuclear Winter" paper
 * - Robock & Toon (2012): "Local Nuclear War, Global Suffering"
 * - Coupe et al. (2019): "Nuclear Winter Responses to Regional Nuclear War"
 */

/**
 * Radiation zone tracking per country
 * 
 * Countries hit by nuclear weapons experience:
 * - Immediate casualties (already modeled in extinctions.ts)
 * - Long-term radiation (cancers, birth defects, environmental damage)
 */
export interface RadiationZone {
  country: string;              // Country name (e.g., "United States")
  hitMonth: number;             // When nuclear strike occurred
  intensity: number;            // [0,1] Radiation level (1 = severe)
  decayRate: number;            // Monthly decay rate (typically 0.05 = 5%/month)
  currentLevel: number;         // [0,1] Current radiation (decays over time)
  monthlyDeathRate: number;     // Additional deaths per month from radiation (0.01 = 1%)
}

/**
 * Nuclear Winter State
 * 
 * Tracks the multi-year catastrophe following nuclear war:
 * - Soot injection → sunlight blockage
 * - Temperature collapse → crop failure
 * - Mass starvation → 90% mortality
 * - Radiation zones → long-term health impacts
 * 
 * Timeline:
 * - Months 0-6: Soot peak, temperature drops 15-20°C, crops fail
 * - Months 6-24: Starvation peak, 5% monthly mortality
 * - Months 24-60: Slow recovery, 2% monthly mortality
 * - Months 60-120: Long tail, 0.5% monthly mortality
 */
export interface NuclearWinterState {
  active: boolean;              // Is nuclear winter currently happening?
  triggerMonth: number;         // When nuclear war occurred
  
  // Atmospheric effects
  sootInStratosphere: number;   // Teragrams (Tg) of soot (0-150 Tg range)
  sootDecayRate: number;        // Monthly decay rate (typically 0.05 = 5%/month)
  currentSoot: number;          // Current soot level (decays over time)
  
  // Climate effects
  temperatureAnomaly: number;   // °C below baseline (negative, e.g., -15°C)
  baselineTemperature: number;  // Pre-war temperature for recovery calculation
  
  // Agricultural collapse
  cropYieldMultiplier: number;  // [0,1] vs normal (0.1 = 90% crop failure)
  monthlyStarvationRate: number; // Deaths per month as fraction of population
  
  // Radiation zones
  radiationZones: RadiationZone[];
  
  // Duration tracking
  monthsSinceWar: number;       // Months elapsed since nuclear war
  peakMortalityMonths: number;  // Duration of peak starvation (typically 18-24 months)
  recoveryStartMonth: number;   // When recovery begins (typically month 24)
  
  // Mortality tracking
  totalWinterDeaths: number;    // Cumulative deaths from nuclear winter (starvation)
  totalRadiationDeaths: number; // Cumulative deaths from radiation poisoning
}

