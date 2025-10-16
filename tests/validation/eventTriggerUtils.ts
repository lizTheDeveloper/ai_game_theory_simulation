/**
 * Event Trigger Utilities (P2.5 Empirical Validation)
 *
 * Convenience functions for triggering historical events in validation tests.
 * These make it easy to set up COVID-19, 2008 crisis, and Black Death scenarios.
 */

import { GameState } from '@/types/game';
import { triggerPandemic, triggerEconomicCrisis } from '@/simulation/triggeredEvents';

/**
 * Set up COVID-19 pandemic event (2020-2023)
 *
 * Parameters based on WHO data and historical research:
 * - Mortality: 0.1-0.25% global (7-20M deaths from 7.8B population)
 * - Tech sector: +20-40% revenue growth (cloud, e-commerce)
 * - Organizational survival: >90%
 * - Vaccine timeline: 12 months (December 2020)
 * - Economic impact: Moderate (40%)
 *
 * Sources:
 * - WHO COVID-19 Dashboard (2023)
 * - Tech earnings: Google, Amazon, Microsoft 10-K filings (2020-2022)
 */
export function setupCOVID19Pandemic(state: GameState): void {
  triggerPandemic(state, {
    startMonth: 3,  // March 2020 (month 3 of simulation)
    duration: 36,   // 3 years (2020-2023)
    baselineMortality: 0.001, // 0.1% monthly average
    peakMortality: 0.0025,    // 0.25% at peak (first wave)
    affectedFraction: 1.0,    // Global pandemic (all regions)
    economicImpact: 0.4,      // 40% severity (moderate)
    techResilience: true,     // Tech sector thrives during pandemic
    vaccineTimeline: 12       // 12 months to vaccine (Dec 2020)
  });
}

/**
 * Set up 2008 Financial Crisis event (2008-2012)
 *
 * Parameters based on Federal Reserve and IMF data:
 * - Organizational survival: Tech 95%, Finance 70%, General 85%
 * - Unemployment spike: +5% (4.6% → 10.0%)
 * - Wealth inequality increase: Gini +0.04
 * - Government response: YES (TARP bailouts, stimulus)
 * - Duration: 48 months (4 years to recovery)
 *
 * Sources:
 * - Federal Reserve Crisis Timeline (2008-2012)
 * - S&P 500 survival rates (Compustat 2008-2010)
 * - BLS unemployment data (2007-2012)
 * - IMF World Economic Outlook (2009, 2010)
 */
export function setup2008Crisis(state: GameState): void {
  triggerEconomicCrisis(state, {
    startMonth: 9,  // September 2008 (Lehman collapse)
    duration: 48,   // 4 years to recovery (2008-2012)
    severity: 0.7,  // Severe crisis (70%)
    organizationalImpact: {
      tech: 0.05,     // 5% bankruptcy (95% survival) - AAPL, GOOG, AMZN, MSFT all survived
      finance: 0.30,  // 30% bankruptcy (70% survival) - Lehman, Bear Stearns collapsed
      general: 0.15   // 15% bankruptcy (85% survival) - S&P 500 average
    },
    unemploymentSpike: 0.05,  // +5% unemployment (4.6% → 10.0%)
    wealthInequalityIncrease: 0.04, // Gini coefficient +0.04 (0.63 → 0.67)
    governmentResponse: true  // TARP ($700B), stimulus ($787B), QE
  });
}

/**
 * Set up Black Death pandemic event (1347-1450)
 *
 * Parameters based on medieval demographic research:
 * - Mortality: 30-60% European population (75M → 45M → 78M)
 * - Duration: 6 years main phase (1347-1353)
 * - Recovery: 100 years to full population (1347-1450)
 * - Economic impact: Severe (90%)
 * - NO tech sector (medieval era)
 * - NO vaccines
 *
 * Key insight: 50% mortality is catastrophic but NOT extinction.
 * Humanity recovered and entered the Renaissance.
 *
 * Sources:
 * - Benedictow, O. J. (2004). "The Black Death 1346-1353"
 * - Medieval demographic consensus (multiple historians)
 * - Economic historians on post-plague wages (Postan, Abel)
 */
export function setupBlackDeathPandemic(state: GameState): void {
  triggerPandemic(state, {
    startMonth: 0,    // 1347 (start of simulation)
    duration: 72,     // 6 years (1347-1353)
    baselineMortality: 0.05, // 5% monthly (50% total over 6 years)
    peakMortality: 0.10,     // 10% at peak (1348-1349)
    affectedFraction: 1.0,   // Europe-wide (medieval world)
    economicImpact: 0.9,     // 90% severity (catastrophic)
    techResilience: false,   // No tech sector in 1347
    vaccineTimeline: undefined // No vaccines in medieval era
  });
}

/**
 * Trigger a custom pandemic event
 *
 * For testing custom scenarios or sensitivity analysis.
 *
 * @param state - Game state
 * @param params - Pandemic parameters
 * @example
 * ```typescript
 * triggerCustomPandemic(state, {
 *   startMonth: 12,
 *   duration: 24,
 *   baselineMortality: 0.002,
 *   peakMortality: 0.005,
 *   affectedFraction: 0.5,
 *   economicImpact: 0.6,
 *   techResilience: true,
 *   vaccineTimeline: 18
 * });
 * ```
 */
export function triggerCustomPandemic(
  state: GameState,
  params: {
    startMonth: number;
    duration: number;
    baselineMortality: number;
    peakMortality: number;
    affectedFraction: number;
    economicImpact: number;
    techResilience: boolean;
    vaccineTimeline?: number;
  }
): void {
  triggerPandemic(state, params);
}

/**
 * Trigger a custom economic crisis event
 *
 * For testing custom scenarios or sensitivity analysis.
 *
 * @param state - Game state
 * @param params - Economic crisis parameters
 * @example
 * ```typescript
 * triggerCustomEconomicCrisis(state, {
 *   startMonth: 24,
 *   duration: 36,
 *   severity: 0.5,
 *   organizationalImpact: {
 *     tech: 0.10,
 *     finance: 0.40,
 *     general: 0.20
 *   },
 *   unemploymentSpike: 0.03,
 *   wealthInequalityIncrease: 0.02,
 *   governmentResponse: true
 * });
 * ```
 */
export function triggerCustomEconomicCrisis(
  state: GameState,
  params: {
    startMonth: number;
    duration: number;
    severity: number;
    organizationalImpact: {
      tech: number;
      finance: number;
      general: number;
    };
    unemploymentSpike: number;
    wealthInequalityIncrease: number;
    governmentResponse: boolean;
  }
): void {
  triggerEconomicCrisis(state, params);
}
