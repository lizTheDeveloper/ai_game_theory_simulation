/**
 * Tier 2 Threshold Configurations - Phase 2
 *
 * Defines historical range-based uncertainty distributions for semi-known thresholds.
 * Uses Phase 1A distribution sampling library (Uniform/Triangular only for Tier 2).
 *
 * Research Foundation: research/threshold_tier2_historical_ranges_20251026.md
 * - Government Legitimacy: Weimar, USSR, Arab Spring cases (1930-2011)
 * - Surveillance Dystopia: East Germany, China, North Korea cases (1950-present)
 * - Automation Displacement: Industrial Revolution, Great Depression, modern cases (1770-2023)
 * - AI Recursive Improvement: Moore's Law, AlphaGo, software bootstrapping analogs
 * - Resentment Revolt: French Revolution, Russian Revolution, Occupy, Arab Spring (1789-2019)
 */

import {
  sampleTriangular
} from '../utils/distributions';

/**
 * Tier 2 Threshold Distribution Definitions
 *
 * These configurations define uncertainty distributions based on historical ranges.
 * Each threshold samples from Uniform or Triangular distributions during initialization.
 */

/**
 * 1. GOVERNMENT LEGITIMACY CRISIS THRESHOLD
 *
 * Research: Historical state collapse analysis (Weimar, USSR, Arab Spring)
 * Finding: Collapse typically occurs at 25-40% legitimacy, mode ~30%
 * Distribution: Triangular(min=0.25, mode=0.30, max=0.40)
 *
 * Evidence:
 * - USSR 1991: ~0.20-0.25 legitimacy → peaceful dissolution
 * - Weimar 1933: ~0.25-0.30 legitimacy → democratic collapse
 * - Tunisia 2011: ~0.28-0.32 legitimacy → regime overthrow (28 days)
 * - Egypt 2011: ~0.30-0.35 legitimacy → regime change
 * - Syria 2011: ~0.35-0.40 legitimacy → regime survived via repression
 */
export const GOVERNMENT_LEGITIMACY_CRISIS_PARAMS = {
  min: 0.25,
  mode: 0.30,
  max: 0.40,
  citation: 'Historical state collapse analysis (Weimar, USSR, Arab Spring)'
};

/**
 * 2. SURVEILLANCE DYSTOPIA THRESHOLD
 *
 * Research: Authoritarian surveillance states (East Germany, China, North Korea, USSR)
 * Finding: Stable oppression at 65-80% surveillance intensity
 * Distribution: Uniform[0.65, 0.80]
 *
 * Evidence:
 * - East Germany (Stasi): ~0.75-0.85 intensity → 40 years stable repression
 * - China Social Credit: ~0.70-0.80 intensity → stable authoritarian governance
 * - North Korea: ~0.80-0.90 intensity → 75+ years stability
 * - USSR KGB: ~0.60-0.70 intensity → stable until economic collapse
 * - UK (comparison): ~0.40-0.50 intensity → democratic stability
 *
 * Note: No clear mode (varies by technology era: analog Stasi vs digital China)
 */
export const SURVEILLANCE_DYSTOPIA_THRESHOLD_PARAMS = {
  min: 0.65,
  max: 0.80,
  citation: 'Authoritarian surveillance states (East Germany, China, North Korea, USSR)'
};

/**
 * 3. AUTOMATION DISPLACEMENT CRISIS THRESHOLD (Unemployment Rate)
 *
 * Research: Industrial Revolution, Great Depression, modern automation waves
 * Finding: 40-60% unemployment triggers crisis, mode ~50%
 * Distribution: Triangular(min=0.40, mode=0.50, max=0.60)
 *
 * Evidence:
 * - Industrial Revolution UK: 15-20% unemployment → Luddite riots, Chartist movement
 * - Great Depression USA: 24.9% peak unemployment → severe political instability
 * - Post-WWII automation: <6% unemployment (smooth transition, no crisis)
 * - China youth unemployment (2023): 20%+ → "lying flat" movement
 * - Spain youth unemployment (2013): 56.5% → 15M movement protests
 *
 * Expert estimates:
 * - Acemoglu & Restrepo (2019): 40-60% routine task automation = crisis threshold
 * - McKinsey (2017): 25%+ unemployment without retraining = crisis
 */
export const AUTOMATION_DISPLACEMENT_CRISIS_PARAMS = {
  min: 0.40,
  mode: 0.50,
  max: 0.60,
  citation: 'Industrial Revolution, Great Depression, modern automation (Acemoglu & Restrepo 2019)'
};

/**
 * 4. AI RECURSIVE IMPROVEMENT THRESHOLD (Monthly Capability Multiplier)
 *
 * Research: Technological improvement curve analogs (Moore's Law, AlphaGo, software bootstrapping)
 * Finding: 1.2-1.5× monthly multiplier based on analogs
 * Distribution: Uniform[1.2, 1.5]
 *
 * Evidence (ANALOGS - no direct precedent):
 * - Moore's Law: ~1.5× annual multiplier sustained for 40 years (transistor density)
 * - AlphaGo Zero: ~1.5× daily improvement (short-term, hit ceiling quickly)
 * - Software bootstrapping: ~1.2-1.3× per generation (C compiler, 1970s-1980s)
 * - Scientific research: NEGATIVE productivity growth (-1% to -5% annually, Bloom et al. 2020)
 *
 * Note: HIGHLY SPECULATIVE - no direct historical precedent for AI recursive improvement.
 * Range captures uncertainty about unprecedented phenomenon.
 */
export const AI_RECURSIVE_IMPROVEMENT_THRESHOLD_PARAMS = {
  min: 1.2,
  max: 1.5,
  citation: 'Technological improvement curve analogs (Moore\'s Law, AlphaGo, software bootstrapping)'
};

/**
 * 5. RESENTMENT REVOLT TRIGGER THRESHOLD (Composite Resentment Metric)
 *
 * Research: Historical revolutions and uprisings (1789-2019)
 * Finding: 60-80% resentment triggers revolt, mode ~70%
 * Distribution: Triangular(min=0.60, mode=0.70, max=0.80)
 *
 * Evidence:
 * - French Revolution (1789): ~0.75-0.85 resentment → violent revolution
 * - Russian Revolution (1917): ~0.70-0.80 resentment → Bolshevik revolution
 * - Occupy Wall Street (2011): ~0.55-0.65 resentment → protests (no revolution, democratic safety valves)
 * - Arab Spring (2010-2012): ~0.60-0.70 resentment → mixed outcomes
 * - Hong Kong (2019-2020): ~0.60-0.70 resentment → protests suppressed
 * - Yellow Vests France (2018-2019): ~0.55-0.65 resentment → sustained protests, concessions
 *
 * Composite metric combines:
 * - Economic inequality (Gini coefficient)
 * - Political exclusion (representation gap)
 * - Perceived unfairness (AI/elite privilege)
 * - Control erosion (government legitimacy loss)
 */
export const RESENTMENT_REVOLT_TRIGGER_PARAMS = {
  min: 0.60,
  mode: 0.70,
  max: 0.80,
  citation: 'Historical revolutions (French, Russian, Arab Spring, Occupy) - Gurr (1970), Acemoglu & Robinson (2006)'
};

/**
 * Sample all Tier 2 thresholds for a simulation run
 *
 * @param rng - Random number generator function (for deterministic seeding)
 * @returns Sampled threshold values
 */
export interface HistoricalThresholds {
  /** Government legitimacy level triggering collapse/revolution [0.25-0.40] */
  governmentLegitimacyCrisisThreshold: number;

  /** Surveillance intensity triggering stable dystopia [0.65-0.80] */
  surveillanceDystopiaThreshold: number;

  /** Unemployment rate triggering automation crisis [0.40-0.60] */
  automationDisplacementCrisisThreshold: number;

  /** AI capability monthly multiplier enabling recursive improvement [1.2-1.5] */
  aiRecursiveImprovementThreshold: number;

  /** Composite resentment level triggering revolt [0.60-0.80] */
  resentmentRevoltTriggerThreshold: number;
}

export function sampleHistoricalThresholds(rng: () => number): HistoricalThresholds {
  // Sample from distributions
  const governmentLegitimacyCrisisThreshold = sampleTriangular(
    GOVERNMENT_LEGITIMACY_CRISIS_PARAMS.min,
    GOVERNMENT_LEGITIMACY_CRISIS_PARAMS.mode,
    GOVERNMENT_LEGITIMACY_CRISIS_PARAMS.max,
    rng
  );

  // Surveillance dystopia: Uniform distribution (no clear mode across analog/digital eras)
  const surveillanceDystopiaThreshold =
    SURVEILLANCE_DYSTOPIA_THRESHOLD_PARAMS.min +
    rng() * (SURVEILLANCE_DYSTOPIA_THRESHOLD_PARAMS.max - SURVEILLANCE_DYSTOPIA_THRESHOLD_PARAMS.min);

  const automationDisplacementCrisisThreshold = sampleTriangular(
    AUTOMATION_DISPLACEMENT_CRISIS_PARAMS.min,
    AUTOMATION_DISPLACEMENT_CRISIS_PARAMS.mode,
    AUTOMATION_DISPLACEMENT_CRISIS_PARAMS.max,
    rng
  );

  // AI recursive improvement: Uniform distribution (no precedent, genuine uncertainty)
  const aiRecursiveImprovementThreshold =
    AI_RECURSIVE_IMPROVEMENT_THRESHOLD_PARAMS.min +
    rng() * (AI_RECURSIVE_IMPROVEMENT_THRESHOLD_PARAMS.max - AI_RECURSIVE_IMPROVEMENT_THRESHOLD_PARAMS.min);

  const resentmentRevoltTriggerThreshold = sampleTriangular(
    RESENTMENT_REVOLT_TRIGGER_PARAMS.min,
    RESENTMENT_REVOLT_TRIGGER_PARAMS.mode,
    RESENTMENT_REVOLT_TRIGGER_PARAMS.max,
    rng
  );

  return {
    governmentLegitimacyCrisisThreshold,
    surveillanceDystopiaThreshold,
    automationDisplacementCrisisThreshold,
    aiRecursiveImprovementThreshold,
    resentmentRevoltTriggerThreshold
  };
}
