/**
 * Baseline Mortality Phase
 *
 * Adds baseline demographic mortality (natural deaths from aging, disease in normal times)
 * to the Bayesian mortality system. This represents the "background" death rate that occurs
 * even when no crises are active.
 *
 * Research basis:
 * - UN World Population Prospects 2024: Global CDR (crude death rate)
 *   - 1990: 9.8 per 1000 (0.82% monthly)
 *   - 2000: 9.0 per 1000 (0.75% monthly)
 *   - 2010: 8.3 per 1000 (0.69% monthly)
 *   - 2019: 7.5 per 1000 (0.63% monthly)
 *   - 2025: ~7.2 per 1000 (0.60% monthly) [projected]
 *
 * - IHME Global Burden of Disease 2024: Socioeconomic mortality differentials
 *   - Elite (top 5%): ~0.5× average mortality
 *   - Professional (20%): ~0.7× average mortality
 *   - Working (50%): 1.0× average mortality (baseline)
 *   - Precariat (20%): ~1.3× average mortality
 *   - Informal (5%): ~1.5× average mortality
 *
 * Architecture:
 * - Runs BEFORE BayesianMortalityResolutionPhase (order: 34.8 < 35.0)
 * - Adds mortality risks using centralized Bayesian system
 * - Applies ERA_MORTALITY_MULTIPLIERS to scale for historical periods
 * - Uses demographic vulnerability patterns from bayesianMortality.ts
 *
 * Created: Nov 24, 2025 (Roy)
 * Reason: Fix hindcast Phase 3 blocker - population declining instead of growing 1990-2000
 */

import type { SimulationPhase } from '../PhaseOrchestrator';
import type { GameState } from '@/types/game';
import { addMortalityRisk } from '@/simulation/bayesianMortality';
import { getEraMortalityMultiplier } from '@/types/config';
import {
  assertFinite,
  assertDefined,
} from '@/simulation/utils/assertions';

/**
 * Get historical baseline death rate (crude death rate per 1000)
 *
 * Returns the global average annual death rate for a given year.
 * Data from UN World Population Prospects 2024.
 */
function getHistoricalCrudeDeathRate(year: number): number {
  // UN WPP 2024 data: CDR per 1000 population
  const HISTORICAL_CDR = {
    1950: 19.5,  // Post-war, pre-antibiotics era
    1960: 17.0,  // Early antibiotics
    1970: 13.0,  // Green revolution
    1980: 11.0,  // Modern healthcare spreading
    1990: 9.8,   // HINDCAST START
    2000: 9.0,
    2010: 8.3,
    2019: 7.5,   // Pre-COVID
    2025: 7.2,   // Projected (current calibration baseline)
    2030: 7.8,   // Aging populations (projected)
  };

  const years = Object.keys(HISTORICAL_CDR).map(Number).sort((a, b) => a - b);

  // Before earliest year
  if (year <= years[0]) {
    return HISTORICAL_CDR[years[0]];
  }

  // After latest year
  if (year >= years[years.length - 1]) {
    return HISTORICAL_CDR[years[years.length - 1]];
  }

  // Interpolate between known years
  for (let i = 0; i < years.length - 1; i++) {
    const y1 = years[i];
    const y2 = years[i + 1];
    if (year >= y1 && year < y2) {
      const t = (year - y1) / (y2 - y1);
      const cdr1 = HISTORICAL_CDR[y1];
      const cdr2 = HISTORICAL_CDR[y2];
      return cdr1 + (cdr2 - cdr1) * t;
    }
  }

  // Fallback (should never reach here)
  return HISTORICAL_CDR[2025];
}

/**
 * Calculate baseline demographic mortality risk
 *
 * This is the "background" mortality that occurs even when no crises are active.
 * Represents natural deaths from aging, disease in normal times, accidents, etc.
 *
 * Key insight: The demographic baseline death rates defined in getDefaultDemographics()
 * (0.6%-1.2% annual) are segment-specific vulnerability weights. The ACTUAL baseline
 * death rate should come from historical UN data and be scaled by those weights.
 */
function calculateBaselineMortalityRisk(state: GameState): number {
  const year = state.currentYear;

  // Get historical crude death rate (CDR per 1000 per year)
  const cdrPer1000 = getHistoricalCrudeDeathRate(year);

  // Convert to monthly rate: (CDR / 1000) / 12
  const monthlyRate = (cdrPer1000 / 1000) / 12;

  assertFinite(monthlyRate, {
    location: 'calculateBaselineMortalityRisk',
    valueName: 'monthlyRate',
    month: state.currentMonth,
    additionalInfo: { year, cdrPer1000 }
  });

  return monthlyRate;
}

export class BaselineMortalityPhase implements SimulationPhase {
  readonly id = 'baseline_mortality';
  readonly name = 'Baseline Mortality';
  readonly order = 34.8; // Before BayesianMortalityResolutionPhase (35.0)

  execute(state: GameState): { events: any[] } {
    const pop = assertDefined(state.humanPopulationSystem, {
      location: 'BaselineMortalityPhase.execute',
      valueName: 'state.humanPopulationSystem',
      month: state.currentMonth,
      expectedSource: 'initialization.ts'
    });

    // Calculate baseline mortality risk from historical data
    const baselineRisk = calculateBaselineMortalityRisk(state);

    // HINDCAST FIX: Apply ERA mortality multiplier
    // This scales baseline deaths to match historical reality vs 2025 calibration
    // Example: 1990 has multiplier 0.40 (40% of 2025 crisis vulnerability)
    // But baseline demographic deaths were HIGHER in 1990 (CDR 9.8 vs 7.2 in 2025)
    // So we DON'T apply ERA multiplier to baseline deaths - only to CRISIS deaths
    //
    // ERA multipliers represent "crisis response capability" not "baseline health"
    // 1990 had higher baseline mortality but LOWER crisis response capability
    // (This is the architectural insight that fixes the hindcast)

    // Add baseline mortality risk to Bayesian system
    // The Bayesian system will apply demographic vulnerability weights automatically
    // (Elite 0.5×, Professional 0.7×, Working 1.0×, Precariat 1.3×, Informal 1.5×)
    addMortalityRisk(pop, {
      type: 'other', // Baseline mortality is catch-all for natural causes
      baseRisk: baselineRisk,
      proximate: 'natural causes',
      root: 'aging/disease',
      confidence: 'HIGH',
      scope: 'GLOBAL',
      month: state.currentMonth,
      description: `Baseline demographic mortality (CDR ${getHistoricalCrudeDeathRate(state.currentYear).toFixed(1)}/1000)`,
    });

    // DIAGNOSTIC LOGGING (only log occasionally to reduce noise)
    if (state.currentMonth % 12 === 0) {
      const cdr = getHistoricalCrudeDeathRate(state.currentYear);
      const annualDeaths = (pop.population * 1e9) * (baselineRisk * 12);
      const annualDeathsMillions = (annualDeaths / 1e6).toFixed(1);
      console.log(`💀 Baseline mortality: ${cdr.toFixed(1)}/1000 CDR (${annualDeathsMillions}M deaths/year projected)`);
    }

    return { events: [] };
  }
}
