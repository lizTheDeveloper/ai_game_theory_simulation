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
 *
 * TIER 1.7.5 Enhancement: Enhanced Radiation Modeling (M-6)
 * - Dual-track radiation (acute ARS + chronic cancer)
 * - Tissue-specific sensitivity (ICRP 103)
 * - Dose-response curves (LNT model)
 */

import { RadiationExposure } from './radiationExposure';

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
 * - Second-order cascades (2025 research): ozone, precipitation, marine collapse
 *
 * Timeline:
 * - Months 0-6: Soot peak, temperature drops 9°C (full-scale), crops fail
 * - Months 6-24: Starvation peak, 10-15% monthly mortality (Xia et al. 2022)
 * - Months 24-60: Slow recovery, 2-5% monthly mortality
 * - Months 60-120: Long tail, 0.5-2% monthly mortality
 */
export interface NuclearWinterState {
  active: boolean;              // Is nuclear winter currently happening?
  triggerMonth: number;         // When nuclear war occurred

  // Atmospheric effects
  sootInStratosphere: number;   // Teragrams (Tg) of soot (0-150 Tg range)
  sootDecayRate: number;        // Monthly decay rate (typically 0.05 = 5%/month)
  currentSoot: number;          // Current soot level (decays over time)

  // Climate effects (primary)
  temperatureAnomaly: number;   // °C below baseline (negative, e.g., -9°C for 150 Tg)
  baselineTemperature: number;  // Pre-war temperature for recovery calculation
  sunlightBlocked: number;      // [0,1] Fraction of sunlight blocked (0.925 = 92.5% blocked at 150 Tg)

  // Agricultural collapse (primary)
  cropYieldMultiplier: number;  // [0,1] vs normal (0.1 = 90% crop failure)
  monthlyStarvationRate: number; // Deaths per month as fraction of population

  // Second-order cascades (2025 research: Mills et al. 2014, Robock 2024-2025)
  ozoneDepletion: number;        // [0,1] Ozone layer damage (0.5 = 50% depleted)
  ozoneRecoveryRate: number;     // Monthly recovery (0.007 = 10-15 year half-life)
  uvRadiationMultiplier: number; // [1.0, 2.0] Surface UV increase (1.5 = 50% increase)

  precipitationReduction: number; // [0,1] Rainfall reduction vs baseline (0.3 = 30% less)
  monsoonFailureProbability: number; // [0,1] Annual monsoon failure risk

  marineProductivityReduction: number; // [0,1] Phytoplankton die-off (0.3 = 30% reduction)
  oceanDependentPopulationAtRisk: number; // Billions at risk from fish stock collapse

  // Radiation zones (LEGACY - use radiationExposures for enhanced modeling)
  radiationZones: RadiationZone[];

  // Enhanced radiation tracking (M-6: TIER 1.7.5)
  radiationExposures?: RadiationExposure[];  // Dual-track radiation (acute ARS + chronic cancer)
  totalARSDeaths?: number;                   // Immediate ARS mortality
  totalCancerDeaths?: number;                // Delayed cancer mortality

  // Duration tracking
  monthsSinceWar: number;       // Months elapsed since nuclear war
  peakMortalityMonths: number;  // Duration of peak starvation (typically 18-24 months)
  recoveryStartMonth: number;   // When recovery begins (typically month 24)

  // Mortality tracking
  totalWinterDeaths: number;    // Cumulative deaths from nuclear winter (starvation)
  totalRadiationDeaths: number; // Cumulative deaths from radiation (= totalARSDeaths + totalCancerDeaths OR legacy zone deaths)

  // Performance cache (Nov 20, 2025 - Architecture Review HIGH #2)
  // Cached at war trigger, since deployed techs can't change during nuclear winter
  cachedResilientFoodMultiplier?: number; // [0.6, 1.0] mortality multiplier from pre-deployed tech
}

