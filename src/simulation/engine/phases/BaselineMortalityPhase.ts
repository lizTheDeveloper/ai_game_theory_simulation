/**
 * Baseline Mortality Phase
 *
 * Adds baseline demographic mortality (natural deaths from aging, disease in normal times)
 * to the Bayesian mortality system. This represents the "background" death rate that occurs
 * even when no crises are active.
 *
 * Research basis:
 * - UN World Population Prospects 2024: Global CDR (crude death rate)
 *   - 1990: 9.3 per 1000 (0.78% monthly) [CORRECTED from 9.8]
 *   - 2000: 8.5 per 1000 (0.71% monthly) [CORRECTED from 9.0]
 *   - 2010: 7.8 per 1000 (0.65% monthly) [CORRECTED from 8.3]
 *   - 2019: 7.5 per 1000 (0.63% monthly) [VERIFIED ✅]
 *   - 2025: ~7.5 per 1000 (0.63% monthly) [adjusted from 7.2]
 *
 * - Chetty et al. 2016 (JAMA): Association Between Income and Life Expectancy
 *   - Top 1% vs bottom 1% life expectancy gap = 14.6 years → ~0.6× mortality ratio
 * - Kahn & Fazio 2022 (JAMA Network Open): Wealth and Mortality
 *   - Wealth quintile mortality hazard ratio = 1.76×
 * - Pappas et al. 1993 (NEJM): Socioeconomic Status and Mortality
 *   - Education gradient mortality differential = 2.67×
 * - NOTE: U.S.-based research. Global applicability uncertain pending cross-country validation.
 *
 * Socioeconomic mortality multipliers applied via Bayesian system:
 *   - Elite (top 5%): ~0.6× average mortality (Chetty 2016)
 *   - Professional (20%): ~0.7× average mortality (interpolated)
 *   - Working (50%): 1.0× average mortality (baseline)
 *   - Precariat (20%): ~1.3× average mortality (interpolated)
 *   - Informal (5%): ~1.6× average mortality (Kahn 2022: 1.76×, conservative 1.6×)
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
 *
 * CDR values verified against UN World Population Prospects 2024 (28th edition, July 2024)
 * via World Bank API (SP.DYN.CDRT.IN indicator, 1960-2023 verified within 0.4-7.5%)
 * Source: research/unwpp2024_cdr_verification_20251124.md
 *
 * 1990 correction critical for hindcast: Previous value (9.8) overestimated deaths by ~3M/year
 * affecting population growth validation (5.3B→6.1B expected, was producing 5.3B→2.7B)
 */
function getHistoricalCrudeDeathRate(year: number): number {
  // UN WPP 2024 data: CDR per 1000 population
  const HISTORICAL_CDR = {
    1950: 19.5,  // Plausible (unverified, pre-antibiotics era)
    1960: 17.2,  // UN WPP 2024 verified (was 17.0, +1.2%)
    1970: 12.1,  // UN WPP 2024 verified (was 13.0, -7%)
    1980: 10.4,  // UN WPP 2024 verified (was 11.0, -5.5%)
    1990: 9.3,   // UN WPP 2024 verified (was 9.8, -5%) ← CRITICAL for hindcast
    2000: 8.5,   // UN WPP 2024 verified (was 9.0, -5.5%)
    2010: 7.8,   // UN WPP 2024 verified (was 8.3, -6%)
    2019: 7.5,   // UN WPP 2024 verified ✅
    2025: 7.5,   // Adjusted from 7.2 (was too optimistic)
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
 * Get historical baseline birth rate (crude birth rate per 1000)
 *
 * Returns the global average annual birth rate for a given year.
 * Data from UN World Population Prospects 2024.
 *
 * Note: Birth rates have been steadily declining due to demographic transition:
 * - Improved access to contraception
 * - Rising education levels (especially for women)
 * - Urbanization (lower economic incentive for large families)
 * - Declining infant mortality (less need for "replacement" children)
 *
 * EXPORTED (Nov 24, 2025): Used by regionalPopulations.ts for historical birth rate scaling
 */
export function getHistoricalCrudeBirthRate(year: number): number {
  // UN WPP 2024 data: CBR per 1000 population
  const HISTORICAL_CBR = {
    1950: 36.9,  // Post-war baby boom
    1960: 35.3,  // Peak global fertility
    1970: 32.9,  // Start of demographic transition
    1980: 28.1,  // Contraception spreading
    1990: 24.3,  // HINDCAST START
    2000: 21.1,  // Further decline
    2010: 19.5,  // Continued decline
    2020: 17.7,  // Modern low-fertility era
    2025: 16.8,  // Projected (below replacement in many regions)
    2030: 16.0,  // Projected (aging population effect)
  };

  const years = Object.keys(HISTORICAL_CBR).map(Number).sort((a, b) => a - b);

  // Before earliest year
  if (year <= years[0]) {
    return HISTORICAL_CBR[years[0]];
  }

  // After latest year
  if (year >= years[years.length - 1]) {
    return HISTORICAL_CBR[years[years.length - 1]];
  }

  // Interpolate between known years
  for (let i = 0; i < years.length - 1; i++) {
    const y1 = years[i];
    const y2 = years[i + 1];
    if (year >= y1 && year < y2) {
      const t = (year - y1) / (y2 - y1);
      const cbr1 = HISTORICAL_CBR[y1];
      const cbr2 = HISTORICAL_CBR[y2];
      return cbr1 + (cbr2 - cbr1) * t;
    }
  }

  // Fallback (should never reach here)
  return HISTORICAL_CBR[2025];
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

    // HINDCAST FIX: Compensate for ERA mortality multiplier
    // The Bayesian system will multiply ALL risks by ERA multiplier (line 362 of bayesianMortality.ts)
    // But baseline demographic deaths should NOT be scaled by ERA multiplier!
    //
    // ERA multiplier compensation: Baseline mortality is NOT divided by ERA multiplier
    // because ERA represents "crisis response capability" not "baseline healthcare quality"
    //
    // Rationale: 1990 had HIGHER baseline mortality (9.3/1000) but LOWER crisis response
    // capability than 2025. Baseline improvement comes from antibiotics, sanitation, vaccines
    // (captured in HISTORICAL_CDR), while ERA captures emergency response infrastructure.
    //
    // CAVEAT: This separation lacks direct empirical support. Alternative interpretation:
    // ERA improvements and baseline mortality improvements may be confounded (same healthcare
    // systems that reduce baseline also improve crisis response). Flagged for validation.
    //
    // See: research/baseline_mortality_skeptical_review_20251124.md
    //
    // Solution: Pre-divide by ERA multiplier so that when Bayesian system multiplies,
    // we get back the correct historical baseline mortality rate.
    // Example: baselineRisk=0.000775 (9.3/1000/12), eraMultiplier=0.30
    //          compensated=0.000775/0.30=0.00258
    //          bayesian applies: 0.00258*0.30=0.000775 ✓
    const yearsElapsed = Math.floor(state.currentMonth / 12);
    const actualYear = state.currentYear + yearsElapsed;
    const eraMultiplier = getEraMortalityMultiplier(actualYear);
    const compensatedBaselineRisk = assertFinite(baselineRisk / eraMultiplier, {
      location: 'BaselineMortalityPhase.execute',
      valueName: 'compensatedBaselineRisk',
      month: state.currentMonth,
      additionalInfo: { baselineRisk, eraMultiplier, actualYear, yearsElapsed, initialYear: state.currentYear }
    });

    // Add baseline mortality risk to Bayesian system
    // The Bayesian system will apply demographic vulnerability weights automatically
    // (Elite 0.6×, Professional 0.7×, Working 1.0×, Precariat 1.3×, Informal 1.6×)
    addMortalityRisk(pop, {
      type: 'other', // Baseline mortality is catch-all for natural causes
      baseRisk: compensatedBaselineRisk, // Pre-compensated for ERA multiplier
      proximate: 'disease', // Disease/natural causes (aging, illness, accidents)
      root: 'demographic', // Demographic baseline (natural mortality)
      confidence: 'HIGH',
      scope: 'GLOBAL',
      month: state.currentMonth,
      description: `Baseline demographic mortality (CDR ${getHistoricalCrudeDeathRate(actualYear).toFixed(1)}/1000)`,
    });

    // REMOVED (Nov 24, 2025): Birth handling moved ENTIRELY to regional population system
    // ARCHITECTURE FIX: Births were being added in two places:
    // 1. updateRegionalPopulations (HumanPopulationPhase) - adds births to regional populations
    // 2. BaselineMortalityPhase (HERE) - was adding births to global population
    //
    // Problem: HumanPopulationPhase aggregates regional → global AFTER this phase runs,
    // so any global births added here are immediately overwritten on the next step.
    //
    // Solution: Regional system is the SOLE source of births.
    // Historical birth rate scaling is now handled in updateRegionalPopulations
    // via getHistoricalCrudeBirthRate() scaling factor.
    //
    // This phase ONLY handles deaths (baseline demographic mortality).

    // DIAGNOSTIC LOGGING (historical demographics)
    if (state.currentMonth % 12 === 0) {
      const cdr = getHistoricalCrudeDeathRate(actualYear);
      if (state.config.scenarioMode === 'historical') {
        const cbr = getHistoricalCrudeBirthRate(actualYear);
        const netGrowthPer1000 = cbr - cdr;
        console.log(`👶 Historical demographics (${actualYear}):`);
        console.log(`   Births: ${cbr.toFixed(1)}/1000 CBR (handled by regional system)`);
        console.log(`   Deaths: ${cdr.toFixed(1)}/1000 CDR (handled by Bayesian mortality)`);
        console.log(`   Net: ${netGrowthPer1000.toFixed(1)}/1000 (${(netGrowthPer1000 / 10).toFixed(2)}%/year expected)`);
      } else {
        // Non-historical mode: Only log deaths
        const annualDeaths = (pop.population * 1e9) * (baselineRisk * 12);
        const annualDeathsMillions = (annualDeaths / 1e6).toFixed(1);
        console.log(`💀 Baseline mortality (Year ${actualYear}): ${cdr.toFixed(1)}/1000 CDR (${annualDeathsMillions}M deaths/year projected)`);
      }
    }

    return { events: [] };
  }
}
