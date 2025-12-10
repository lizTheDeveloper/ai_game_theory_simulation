/**
 * Baseline Mortality Phase
 *
 * Adds baseline demographic mortality (natural deaths from aging, disease in normal times)
 * to the Bayesian mortality system. This represents the "background" death rate that occurs
 * even when no crises are active.
 *
 * Research basis:
 * @research: UN World Population Prospects 2024 (28th edition) - Global CDR (crude death rate)
 *   - 1990: 9.3 per 1000 (0.78% monthly) [CORRECTED from 9.8]
 *   - 2000: 8.5 per 1000 (0.71% monthly) [CORRECTED from 9.0]
 *   - 2010: 7.8 per 1000 (0.65% monthly) [CORRECTED from 8.3]
 *   - 2019: 7.5 per 1000 (0.63% monthly) [VERIFIED ✅]
 *   - 2025: ~7.5 per 1000 (0.63% monthly) [adjusted from 7.2]
 *
 * @research: Chetty et al. 2016 (JAMA) - Association Between Income and Life Expectancy
 *   - Top 1% vs bottom 1% life expectancy gap = 14.6 years → ~0.6× mortality ratio
 * @research: Kahn & Fazio 2022 (JAMA Network Open) - Wealth and Mortality
 *   - Wealth quintile mortality hazard ratio = 1.76×
 * @research: Pappas et al. 1993 (NEJM) - Socioeconomic Status and Mortality
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
import {
  assertFinite,
  assertDefined,
} from '@/simulation/utils/assertions';
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';

/**
 * Get historical baseline death rate (crude death rate per 1000)
 *
 * Returns the global average annual death rate for a given year.
 *
 * @research: UN World Population Prospects 2024 (28th edition, July 2024) - Global CDR historical data
 * Source: research/unwpp2024_cdr_verification_20251124.md
 * Verification: World Bank API (SP.DYN.CDRT.IN indicator, 1960-2023 verified within 0.4-7.5%)
 *
 * CDR values verified against UN World Population Prospects 2024 (28th edition, July 2024)
 * via World Bank API (SP.DYN.CDRT.IN indicator, 1960-2023 verified within 0.4-7.5%)
 *
 * 1990 correction critical for hindcast: Previous value (9.8) overestimated deaths by ~3M/year
 * affecting population growth validation (5.3B→6.1B expected, was producing 5.3B→2.7B)
 */
export function getHistoricalCrudeDeathRate(year: number): number {
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
 * Get region-specific historical birth rate (crude birth rate per 1000)
 *
 * CRITICAL FIX (Nov 25, 2025): Regional fertility declines at heterogeneous rates
 *
 * Root cause of 2010-2020 hindcast overshoot: Global CBR scaling applied uniformly
 * across regions, but actual fertility declines varied by 7x:
 * - East Asia: -17.5% (2010-2020) - one-child policy, urbanization
 * - South Asia: -19.0% - rapid development
 * - Europe: -2.6% - already at fertility floor
 * - Sub-Saharan Africa: -15.6% - early demographic transition
 *
 * Using single global multiplier (1.161x for 2010) overestimated births in
 * fast-declining regions (East/South Asia = 50% of global population) → 6-10% overshoot.
 *
 * Research: UN World Population Prospects 2024 (28th edition, July 2024)
 * - TFR data from https://population.un.org/wpp/Download/Standard/Fertility/
 * - CBR estimated using empirical ratio: CBR ≈ TFR × 7.5 (validated against global avg)
 *
 * @param regionName - Region name (must match initializeRegionalPopulations)
 * @param year - Year (1990-2030)
 * @returns CBR per 1000 population for that region-year
 */
export function getRegionalHistoricalBirthRate(regionName: string, year: number): number {
  // M-4 FIX (Nov 28, 2025): Updated to UN WPP 2024 data with 2024 calibration points
  // Research: research/population_demographics_regional_20251128.md (Cynthia)
  // Validation: reviews/m4_demographics_research_critique_20251128.md (Sylvia)
  // Conversion: TFR × 0.008 = annual birth rate (Cynthia's formula, Table 4.2)
  // CBR = birth rate × 1000 (convert to per-thousand metric)
  const REGIONAL_CBR: Record<string, Record<number, number>> = {
    'East Asia': {
      1990: 17.6,  // TFR 2.20 × 8 = 17.6/1000 (Cynthia Table 4.2)
      2000: 12.7,  // TFR 1.69 × 7.5 (keeping intermediate value)
      2010: 11.6,  // TFR 1.54 × 7.5
      2020: 9.5,   // TFR 1.27 × 7.5
      2024: 9.6,   // TFR 1.20 × 8 = 9.6/1000 (Cynthia 2024 target)
      2025: 9.6,   // Stable at 2024 level
    },
    'South Asia': {
      1990: 33.6,  // TFR 4.20 × 8 = 33.6/1000 (Cynthia Table 4.2)
      2000: 24.9,  // TFR 3.32 × 7.5
      2010: 21.2,  // TFR 2.82 × 7.5
      2020: 17.1,  // TFR 2.28 × 7.5
      2024: 16.0,  // TFR 2.00 × 8 = 16.0/1000 (India crossed replacement)
      2025: 16.0,  // Stable
    },
    'Sub-Saharan Africa': {
      1990: 52.0,  // TFR 6.50 × 8 = 52.0/1000 (Cynthia Table 4.2)
      2000: 43.5,  // TFR 5.80 × 7.5
      2010: 40.9,  // TFR 5.45 × 7.5
      2020: 34.5,  // TFR 4.60 × 7.5
      2024: 34.4,  // TFR 4.30 × 8 = 34.4/1000 (Cynthia 2024 target)
      2025: 34.4,  // Stable
    },
    'Europe': {
      1990: 14.0,  // TFR 1.75 × 8 = 14.0/1000 (Cynthia Table 4.2)
      2000: 10.7,  // TFR 1.43 × 7.5
      2010: 11.8,  // TFR 1.57 × 7.5
      2020: 11.5,  // TFR 1.53 × 7.5
      2024: 12.0,  // TFR 1.50 × 8 = 12.0/1000 (Cynthia 2024 target)
      2025: 12.0,  // Stable (at floor)
    },
    'North America': {
      1990: 16.0,  // TFR 2.00 × 8 = 16.0/1000 (Cynthia Table 4.2)
      2000: 15.3,  // TFR 2.04 × 7.5
      2010: 15.3,  // TFR 2.04 × 7.5
      2020: 12.3,  // TFR 1.64 × 7.5
      2024: 13.6,  // TFR 1.70 × 8 = 13.6/1000 (record low)
      2025: 13.6,  // Stable
    },
    'Latin America': {
      1990: 26.4,  // TFR 3.30 × 8 = 26.4/1000 (Cynthia Table 4.2)
      2000: 19.4,  // TFR 2.58 × 7.5
      2010: 16.7,  // TFR 2.23 × 7.5
      2020: 14.3,  // TFR 1.91 × 7.5
      2024: 14.4,  // TFR 1.80 × 8 = 14.4/1000 (UN ECLAC 2024)
      2025: 14.4,  // Stable
    },
    'Middle East & North Africa': {
      1990: 40.0,  // TFR 5.00 × 8 = 40.0/1000 (Cynthia Table 4.2, dramatic decline)
      2000: 26.1,  // TFR 3.48 × 7.5
      2010: 23.8,  // TFR 3.17 × 7.5
      2020: 21.6,  // TFR 2.88 × 7.5
      2024: 21.3,  // TFR 2.66 × 8 = 21.3/1000 (Cynthia 2024 target)
      2025: 21.3,  // Stable
    },
    'Southeast Asia': {
      1990: 28.0,  // TFR 3.50 × 8 = 28.0/1000 (Cynthia Table 4.2)
      2000: 22.0,
      2010: 19.0,
      2020: 15.5,
      2024: 16.8,  // TFR 2.10 × 8 = 16.8/1000 (near replacement)
      2025: 16.8,
    },
    'Central Asia': {
      1990: 21.6,  // TFR 2.70 × 8 = 21.6/1000 (Cynthia - stable)
      2000: 24.0,
      2010: 22.0,
      2020: 20.0,
      2024: 21.6,  // TFR 2.70 × 8 (unchanged)
      2025: 21.6,
    },
    'Oceania': {
      1990: 19.2,  // TFR 2.40 × 8 = 19.2/1000 (Cynthia - immigration-sustained)
      2000: 15.5,
      2010: 15.0,
      2020: 12.5,
      2024: 14.4,  // TFR 1.80 × 8 = 14.4/1000 (below replacement)
      2025: 14.4,
    },
  };

  // Check if region exists
  const regionData = REGIONAL_CBR[regionName];
  if (!regionData) {
    // CRITICAL: Fail loudly if region not found (no silent fallbacks)
    throw new Error(
      `❌ CRITICAL: Unknown region '${regionName}' in getRegionalHistoricalBirthRate. ` +
      `Valid regions: ${Object.keys(REGIONAL_CBR).join(', ')}`
    );
  }

  const years = Object.keys(regionData).map(Number).sort((a, b) => a - b);

  // Before earliest year
  if (year <= years[0]) {
    return regionData[years[0]];
  }

  // After latest year
  if (year >= years[years.length - 1]) {
    return regionData[years[years.length - 1]];
  }

  // Interpolate between known years
  for (let i = 0; i < years.length - 1; i++) {
    const y1 = years[i];
    const y2 = years[i + 1];
    if (year >= y1 && year < y2) {
      const t = (year - y1) / (y2 - y1);
      const cbr1 = regionData[y1];
      const cbr2 = regionData[y2];
      const interpolated = cbr1 + (cbr2 - cbr1) * t;

      // Validate result
      assertFinite(interpolated, {
        location: 'getRegionalHistoricalBirthRate',
        valueName: 'interpolated CBR',
        month: 0,
        additionalInfo: { regionName, year, y1, y2, cbr1, cbr2 }
      });

      return interpolated;
    }
  }

  // Should never reach here
  return regionData[2025];
}

/**
 * Get region-specific historical death rate (crude death rate per 1000)
 *
 * CRITICAL FIX (Dec 9, 2025): Updated regional mortality data from UN WPP 2024
 *
 * Root cause of 2010-2020 hindcast overshoot: Global CDR scaling misses regional variation:
 * - Sub-Saharan Africa: 15.5→8.7/1000 (1990-2020) - steepest decline (~47% demographic transition)
 * - Europe: 10.5→11.0/1000 (1990-2020) - STABLE/RISING due to aging population
 * - East Asia: 7.5→7.5/1000 (1990-2020) - stable initially, aging beginning
 * - South Asia: 10.5→7.0/1000 (1990-2020) - classic transition decline
 *
 * Without regional scaling, simulation uses global average (~9.3→7.6/1000) which:
 * - UNDERESTIMATES deaths in Sub-Saharan Africa (15.5 vs 9.3 in 1990 = 1.67× more deaths)
 * - OVERESTIMATES deaths in MENA (8.5 vs 9.3 in 1990 = 0.91× fewer deaths)
 * - Net effect: Population growth too fast → 500M overshoot by 2020
 *
 * Research: /research/regional_death_rates_unwpp2024_20251209.md (Grade B)
 * Validation: /reviews/hindcast_demographic_research_critique_20251209.md
 * - Primary source: UN World Population Prospects 2024 (28th edition, July 2024)
 * - NOTE: Current values are midpoint estimates from trend data (Grade B research)
 * - TODO: Extract exact values from UN WPP 2024 CSV downloads before final validation
 * - Expected impact: Reduce 2020 overshoot from +10.3% to target 5-7%
 *
 * @param regionName - Region name (must match initializeRegionalPopulations)
 * @param year - Year (1990-2030)
 * @returns CDR per 1000 population for that region-year
 */
export function getRegionalHistoricalDeathRate(regionName: string, year: number): number {
  /**
   * Regional historical crude death rates (deaths per 1,000 population)
   *
   * Source: UN World Population Prospects 2024, World Bank, WHO
   * Research: research/regional_death_rates_unwpp2024_20251209.md (Grade B)
   * Validation: reviews/hindcast_demographic_research_critique_20251209.md
   *
   * NOTE: Current values are midpoint estimates from trend data.
   * TODO: Extract exact values from UN WPP 2024 CSV downloads before final validation.
   *
   * @see https://population.un.org/wpp/downloads
   */
  const REGIONAL_CDR: Record<string, Record<number, number>> = {
    'Sub-Saharan Africa': {
      1990: 15.5,  // Range 15-16, ~47% decline to 2020
      1995: 14.5,  // HIV/AIDS epidemic period
      2000: 14.5,  // HIV/AIDS peak
      2005: 12.5,  // ARVT rollout begins
      2010: 10.5,  // Continued health improvements
      2015: 9.5,   // Demographic transition acceleration
      2020: 8.7,   // World Bank 2022: 8.82
      2025: 8.2    // Projected continued decline
    },
    'Europe': {
      1990: 10.5,  // Stable period
      1995: 10.5,  // Aging beginning
      2000: 10.5,  // Continued aging
      2005: 10.5,  // Slight increase trend
      2010: 10.5,  // Population aging
      2015: 11.0,  // Aging acceleration
      2020: 11.0,  // Pre-COVID baseline (NOT 2021 spike of 13)
      2025: 11.5   // Projected aging effect
    },
    'East Asia': {
      1990: 7.5,   // Post-demographic transition
      1995: 7.5,   // Stable period
      2000: 7.0,   // Continued stability
      2005: 7.0,   // Low mortality plateau
      2010: 7.0,   // Aging begins
      2015: 7.5,   // Aging acceleration (Japan, China)
      2020: 7.5,   // Aging effect visible
      2025: 8.5    // Projected rapid aging
    },
    'South Asia': {
      1990: 10.5,  // Mid-demographic transition
      1995: 9.5,   // Health improvements
      2000: 9.0,   // Continued decline
      2005: 8.5,   // Economic growth period
      2010: 8.0,   // Mortality decline acceleration
      2015: 7.5,   // Sustained improvements
      2020: 7.0,   // Approaching developed levels
      2025: 6.5    // Projected continued improvement
    },
    'North America': {
      1990: 8.5,   // Stable developed region
      1995: 8.5,   // Slight decline
      2000: 8.5,   // Stable period
      2005: 8.0,   // Continued stability
      2010: 8.0,   // Low plateau
      2015: 8.5,   // Aging begins to show
      2020: 8.5,   // Pre-COVID baseline
      2025: 8.5    // Projected
    },
    'Latin America': {
      1990: 7.5,   // Post-transition in Southern Cone
      1995: 7.0,   // Declining trend
      2000: 6.5,   // Continued improvement
      2005: 6.5,   // Stable period
      2010: 6.0,   // Low mortality achieved
      2015: 6.0,   // Sustained low rates
      2020: 6.5,   // Pre-COVID baseline
      2025: 6.5    // Projected
    },
    'Middle East & North Africa': {
      1990: 8.5,   // Oil wealth → good health systems
      1995: 7.5,   // Declining trend
      2000: 7.0,   // Continued improvement
      2005: 6.5,   // Low mortality achieved
      2010: 6.5,   // Conflict effects in some areas
      2015: 6.5,   // Syrian war impact (localized)
      2020: 6.5,   // Mixed patterns
      2025: 6.5    // Projected
    },
    'Southeast Asia': {
      1990: 8.5,   // Mid-transition
      1995: 8.0,   // Rapid development period
      2000: 7.5,   // Health improvements
      2005: 7.0,   // Continued progress
      2010: 6.5,   // Economic growth effect
      2015: 6.5,   // Sustained low rates
      2020: 6.5,   // Pre-COVID baseline
      2025: 6.5    // Projected
    },
    'Central Asia': {
      // NOTE: LOW-MEDIUM data quality (Soviet collapse effects)
      // Small population (~1% global), acceptable uncertainty
      1990: 8.0,   // Soviet health system legacy
      1995: 9.5,   // Post-Soviet collapse → health crisis
      2000: 9.5,   // Economic depression effect
      2005: 9.0,   // Gradual recovery
      2010: 8.5,   // Improving trend
      2015: 8.0,   // Economic stabilization
      2020: 8.0,   // Recovery to 1990 levels
      2025: 8.0    // Projected
    },
    'Oceania': {
      1990: 7.5,   // Developed (AUS/NZ) dominates
      1995: 7.5,   // Stable period
      2000: 7.0,   // Slight decline
      2005: 7.0,   // Stable
      2010: 7.0,   // Aging begins
      2015: 7.5,   // Aging effect
      2020: 7.5,   // Pre-COVID baseline
      2025: 7.5    // Projected
    }
  };

  // Check if region exists
  const regionData = REGIONAL_CDR[regionName];
  if (!regionData) {
    // CRITICAL: Fail loudly if region not found (no silent fallbacks)
    throw new Error(
      `❌ CRITICAL: Unknown region '${regionName}' in getRegionalHistoricalDeathRate. ` +
      `Valid regions: ${Object.keys(REGIONAL_CDR).join(', ')}`
    );
  }

  const years = Object.keys(regionData).map(Number).sort((a, b) => a - b);

  // Before earliest year
  if (year <= years[0]) {
    return regionData[years[0]];
  }

  // After latest year
  if (year >= years[years.length - 1]) {
    return regionData[years[years.length - 1]];
  }

  // Interpolate between known years
  for (let i = 0; i < years.length - 1; i++) {
    const y1 = years[i];
    const y2 = years[i + 1];
    if (year >= y1 && year < y2) {
      const t = (year - y1) / (y2 - y1);
      const cdr1 = regionData[y1];
      const cdr2 = regionData[y2];
      const interpolated = cdr1 + (cdr2 - cdr1) * t;

      // Validate result
      assertFinite(interpolated, {
        location: 'getRegionalHistoricalDeathRate',
        valueName: 'interpolated CDR',
        month: 0,
        additionalInfo: { regionName, year, y1, y2, cdr1, cdr2 }
      });

      return interpolated;
    }
  }

  // Should never reach here
  return regionData[2025];
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
    // CRITICAL FIX (Nov 27, 2025): Disable in historical mode to prevent double-counting
    // Root cause of C-4 population decline: Regional population system (HumanPopulationPhase,
    // order 20.52) applies historical CDR-based mortality directly to regional populations.
    // This phase (order 34.8) then adds ANOTHER baseline mortality risk based on the SAME
    // historical CDR data, which BayesianMortalityResolution (order 35.0) applies again.
    // Result: Deaths counted twice → population crashes instead of growing.
    // Example: 1990 has 54.9M/yr regional deaths + 28.8M/yr Bayesian deaths = 83.7M/yr total
    // vs expected 49.5M/yr (9.3/1000 CDR). Deaths are 69% too high!
    // Solution: In historical mode (1990-2024 hindcast), skip Bayesian baseline mortality entirely.
    // The regional population system handles ALL mortality with historical CDR scaling.
    // HIGH-7 FIX (Nov 27, 2025): Use historicalMode flag (not scenarioMode) for hindcast calibration
    // CRITICAL-1 FIX (Nov 28, 2025): Unified historical mode detection via isHistoricalModeActive()
    // historicalMode = empirical UN data (1990-2024), scenarioMode = crisis severity when crises occur
    if (isHistoricalModeActive(state)) {
      return { events: [] };
    }

    const pop = assertDefined(state.humanPopulationSystem, {
      location: 'BaselineMortalityPhase.execute',
      valueName: 'state.humanPopulationSystem',
      month: state.currentMonth,
      expectedSource: 'initialization.ts'
    });

    // Calculate baseline mortality risk from historical data
    const baselineRisk = calculateBaselineMortalityRisk(state);

    // CRITICAL FIX (Nov 27, 2025): ERA multiplier NO LONGER applied to baseline mortality
    // Previous approach (Nov 24, 2025): Pre-divided by ERA, then Bayesian multiplied by ERA
    // Problem: Created fragile coupling between phases, violated architecture intent
    //
    // NEW APPROACH: ERA multiplier is for CRISIS mortality only (Bayesian system filters on root='demographic')
    // Baseline mortality improvement already captured in historical CDR values:
    // - 1990 CDR: 9.3/1000 (worse healthcare, sanitation, antibiotics)
    // - 2025 CDR: 7.5/1000 (better healthcare)
    //
    // ERA represents CRISIS RESPONSE (early warning, surge capacity, disaster coordination),
    // not baseline healthcare quality (antibiotics, sanitation, routine care).
    //
    // Research:
    // - config.ts line 322: "Applied to crisis mortality calculations, not baseline population dynamics"
    // - bayesianMortality.ts line 366: Now filters baseline mortality from ERA scaling
    // - research/baseline_mortality_skeptical_review_20251124.md
    const actualYear = state.currentYear;

    // Add baseline mortality risk to Bayesian system (NO ERA compensation)
    // The Bayesian system will apply demographic vulnerability weights automatically
    // (Elite 0.6×, Professional 0.7×, Working 1.0×, Precariat 1.3×, Informal 1.6×)
    // and will NOT apply ERA multiplier to baseline (filtered on root='demographic')
    addMortalityRisk(pop, {
      type: 'other', // Baseline mortality is catch-all for natural causes
      baseRisk: baselineRisk, // Direct from historical CDR (no ERA compensation)
      proximate: 'disease', // Disease/natural causes (aging, illness, accidents)
      root: 'demographic', // Demographic baseline (natural mortality) - triggers ERA filter in Bayesian
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
      if (isHistoricalModeActive(state)) {
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
