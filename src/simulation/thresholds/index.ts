/**
 * Unified Threshold System - Phase 4: Integration & Scenario Builder
 *
 * Central entry point for threshold uncertainty system combining:
 * - Tier 1: Empirical distributions (Phase 1A/1B)
 * - Tier 2: Historical ranges (Phase 2)
 * - Tier 3: Named scenarios (Phase 3)
 *
 * This module provides:
 * 1. Unified threshold sampling (sampleAllThresholds)
 * 2. Scenario-based configuration
 * 3. Slider-based distribution overrides
 * 4. Export/import for reproducibility
 */

import { sampleResearchBackedThresholds, type ResearchBackedThresholds } from './tier1Config';
import { sampleHistoricalThresholds, type HistoricalThresholds } from './tier2Config';

/**
 * Combined threshold interface - all uncertainty parameters
 */
export type Thresholds = ResearchBackedThresholds & HistoricalThresholds;

/**
 * Named scenario definitions (Tier 3)
 *
 * Each scenario represents a coherent worldview about threshold values:
 * - doom: Pessimistic (low thresholds = easy to trigger crises)
 * - cautious: Conservative (slightly below baseline)
 * - baseline: Central estimates (research mode values)
 * - progressive: Optimistic (slightly above baseline)
 * - utopia: Highly optimistic (high thresholds = resilient systems)
 */
export type ScenarioName = 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia';

/**
 * Slider settings for threshold distribution overrides
 *
 * Sliders map threshold names to quantile positions [0.0, 1.0]:
 * - 0.0 = pessimistic extreme (lowest value in distribution)
 * - 0.5 = median/mode (central estimate)
 * - 1.0 = optimistic extreme (highest value in distribution)
 *
 * Example: { climateSensitivity: 0.9 } → sample at 90th percentile (high sensitivity)
 */
export type SliderSettings = Partial<Record<keyof Thresholds, number>>;

/**
 * Threshold sampling options
 */
export interface ThresholdSamplingOptions {
  /** Named scenario selection (overrides slider defaults) */
  scenario?: ScenarioName;

  /** Custom slider overrides (take precedence over scenario) */
  sliders?: SliderSettings;

  /** Use nested Monte Carlo (epistemic/aleatory separation) - Phase 1C */
  nested?: boolean;
}

/**
 * Get slider settings for a named scenario
 *
 * Scenarios define coherent worldviews by setting multiple sliders together.
 * These represent different uncertainty perspectives, not "game difficulty."
 *
 * Research foundation:
 * - DOOM: Taleb (2007) "The Black Swan" - fat-tailed risk, fragile systems
 * - CAUTIOUS: Precautionary principle, IPCC likely ranges (16th-84th percentile)
 * - BASELINE: Research mode values (central estimates)
 * - PROGRESSIVE: Technological optimism, Pinker (2018) "Enlightenment Now"
 * - UTOPIA: Bostrom (2014) optimistic scenarios, robust institutions
 */
function getScenarioSliders(scenario: ScenarioName): SliderSettings {
  switch (scenario) {
    case 'doom':
      // Pessimistic: Systems are fragile, thresholds are low
      return {
        // Social systems collapse easily
        socialCriticalMass: 0.2,           // Low critical mass (easier to flip)
        trustRecoveryRate: 0.1,            // Slow trust recovery
        governmentLegitimacyCrisisThreshold: 0.2, // Collapses at high legitimacy

        // Climate/environment is severe
        climateSensitivity: 0.9,           // High ECS (severe warming)

        // Automation/AI is disruptive
        automationJobLossThreshold: 0.2,   // Crisis at low unemployment
        automationDisplacementCrisisThreshold: 0.2,
        aiRecursiveImprovementThreshold: 0.8, // Fast AI improvement

        // Control/surveillance is easy
        surveillanceDystopiaThreshold: 0.2, // Low threshold for stable dystopia

        // Resentment triggers easily
        resentmentRevoltTriggerThreshold: 0.2 // Low resentment needed for revolt
      };

    case 'cautious':
      // Conservative: Below baseline, precautionary principle
      return {
        socialCriticalMass: 0.35,
        trustRecoveryRate: 0.35,
        climateSensitivity: 0.65,
        governmentLegitimacyCrisisThreshold: 0.35,
        automationJobLossThreshold: 0.35,
        automationDisplacementCrisisThreshold: 0.35,
        aiRecursiveImprovementThreshold: 0.65,
        surveillanceDystopiaThreshold: 0.35,
        resentmentRevoltTriggerThreshold: 0.35
      };

    case 'baseline':
      // Central estimates: Research mode values (median/mode)
      return {
        socialCriticalMass: 0.5,
        trustRecoveryRate: 0.5,
        climateSensitivity: 0.5,
        governmentLegitimacyCrisisThreshold: 0.5,
        automationJobLossThreshold: 0.5,
        automationDisplacementCrisisThreshold: 0.5,
        aiRecursiveImprovementThreshold: 0.5,
        surveillanceDystopiaThreshold: 0.5,
        resentmentRevoltTriggerThreshold: 0.5
      };

    case 'progressive':
      // Optimistic: Above baseline, technological optimism
      return {
        socialCriticalMass: 0.65,
        trustRecoveryRate: 0.65,
        climateSensitivity: 0.35,
        governmentLegitimacyCrisisThreshold: 0.65,
        automationJobLossThreshold: 0.65,
        automationDisplacementCrisisThreshold: 0.65,
        aiRecursiveImprovementThreshold: 0.35,
        surveillanceDystopiaThreshold: 0.65,
        resentmentRevoltTriggerThreshold: 0.65
      };

    case 'utopia':
      // Highly optimistic: Systems are robust, thresholds are high
      return {
        socialCriticalMass: 0.8,           // High critical mass (harder to flip)
        trustRecoveryRate: 0.9,            // Fast trust recovery
        climateSensitivity: 0.1,           // Low ECS (mild warming)
        governmentLegitimacyCrisisThreshold: 0.8, // Only collapses at very low legitimacy
        automationJobLossThreshold: 0.8,   // Crisis only at high unemployment
        automationDisplacementCrisisThreshold: 0.8,
        aiRecursiveImprovementThreshold: 0.2, // Slow AI improvement
        surveillanceDystopiaThreshold: 0.8, // High threshold for dystopia
        resentmentRevoltTriggerThreshold: 0.8 // High resentment needed for revolt
      };
  }
}

/**
 * Apply slider value to a distribution by sampling at quantile position
 *
 * For most distributions, slider=0.5 samples at median/mode.
 * For bounded distributions (Uniform, Triangular), linear interpolation.
 *
 * @param min - Minimum value of distribution
 * @param max - Maximum value of distribution
 * @param slider - Quantile position [0.0, 1.0]
 * @param mode - Optional mode for triangular distributions
 * @returns Sampled value at quantile position
 */
function applySlider(min: number, max: number, slider: number, mode?: number): number {
  // Clamp slider to [0, 1]
  const s = Math.max(0, Math.min(1, slider));

  // For triangular distributions with mode
  if (mode !== undefined) {
    // Simplified: Use inverse CDF of triangular distribution
    // This is approximate - full implementation would use proper inverse CDF
    if (s <= 0.5) {
      // Left half: interpolate from min to mode
      return min + (mode - min) * (s * 2);
    } else {
      // Right half: interpolate from mode to max
      return mode + (max - mode) * ((s - 0.5) * 2);
    }
  }

  // For uniform distributions: linear interpolation
  return min + (max - min) * s;
}

/**
 * Sample all thresholds with optional scenario/slider overrides
 *
 * Priority order:
 * 1. Custom sliders (highest priority)
 * 2. Scenario sliders
 * 3. Random sampling from distributions (default)
 *
 * @param rng - Random number generator function (for deterministic seeding)
 * @param options - Sampling options (scenario, sliders, nested mode)
 * @returns Sampled threshold values
 */
export function sampleAllThresholds(
  rng: () => number,
  options: ThresholdSamplingOptions = {}
): Thresholds {
  const { scenario, sliders = {}, nested = false } = options;

  // Get scenario sliders if specified
  const scenarioSliders = scenario ? getScenarioSliders(scenario) : {};

  // Merge sliders: custom sliders override scenario sliders
  const finalSliders: SliderSettings = { ...scenarioSliders, ...sliders };

  // Sample research-backed thresholds with slider overrides
  const researchRaw = sampleResearchBackedThresholds(rng);
  const research: ResearchBackedThresholds = {
    socialCriticalMass: finalSliders.socialCriticalMass !== undefined
      ? applySlider(0.20, 0.30, finalSliders.socialCriticalMass)
      : researchRaw.socialCriticalMass,

    trustRecoveryRate: finalSliders.trustRecoveryRate !== undefined
      ? applySlider(0.005, 0.03, finalSliders.trustRecoveryRate)
      : researchRaw.trustRecoveryRate,

    climateSensitivity: finalSliders.climateSensitivity !== undefined
      ? applySlider(2.0, 5.0, finalSliders.climateSensitivity)
      : researchRaw.climateSensitivity,

    governmentLegitimacyCrisisThreshold: finalSliders.governmentLegitimacyCrisisThreshold !== undefined
      ? applySlider(0.25, 0.40, finalSliders.governmentLegitimacyCrisisThreshold, 0.30)
      : researchRaw.governmentLegitimacyCrisisThreshold,

    automationJobLossThreshold: finalSliders.automationJobLossThreshold !== undefined
      ? applySlider(0.25, 0.45, finalSliders.automationJobLossThreshold)
      : researchRaw.automationJobLossThreshold
  };

  // Sample historical thresholds with slider overrides
  const historicalRaw = sampleHistoricalThresholds(rng);
  const historical: HistoricalThresholds = {
    governmentLegitimacyCrisisThreshold: finalSliders.governmentLegitimacyCrisisThreshold !== undefined
      ? applySlider(0.25, 0.40, finalSliders.governmentLegitimacyCrisisThreshold, 0.30)
      : historicalRaw.governmentLegitimacyCrisisThreshold,

    surveillanceDystopiaThreshold: finalSliders.surveillanceDystopiaThreshold !== undefined
      ? applySlider(0.65, 0.80, finalSliders.surveillanceDystopiaThreshold)
      : historicalRaw.surveillanceDystopiaThreshold,

    automationDisplacementCrisisThreshold: finalSliders.automationDisplacementCrisisThreshold !== undefined
      ? applySlider(0.40, 0.60, finalSliders.automationDisplacementCrisisThreshold, 0.50)
      : historicalRaw.automationDisplacementCrisisThreshold,

    aiRecursiveImprovementThreshold: finalSliders.aiRecursiveImprovementThreshold !== undefined
      ? applySlider(1.2, 1.5, finalSliders.aiRecursiveImprovementThreshold)
      : historicalRaw.aiRecursiveImprovementThreshold,

    resentmentRevoltTriggerThreshold: finalSliders.resentmentRevoltTriggerThreshold !== undefined
      ? applySlider(0.60, 0.80, finalSliders.resentmentRevoltTriggerThreshold, 0.70)
      : historicalRaw.resentmentRevoltTriggerThreshold
  };

  // Combine all thresholds
  // Note: governmentLegitimacyCrisisThreshold appears in both sets
  // Use historical version (more recent, range-based sampling)
  return {
    ...research,
    ...historical
  };
}

/**
 * Get list of available scenarios with descriptions
 */
export function getScenarioList(): Array<{ name: ScenarioName; description: string }> {
  return [
    {
      name: 'doom',
      description: 'Pessimistic: Fragile systems, low thresholds, crises trigger easily'
    },
    {
      name: 'cautious',
      description: 'Conservative: Precautionary principle, below-baseline estimates'
    },
    {
      name: 'baseline',
      description: 'Central estimates: Research mode values, median/mode samples'
    },
    {
      name: 'progressive',
      description: 'Optimistic: Technological optimism, above-baseline estimates'
    },
    {
      name: 'utopia',
      description: 'Highly optimistic: Robust systems, high thresholds, resilient to crises'
    }
  ];
}

/**
 * Get list of available slider names with descriptions
 */
export function getSliderList(): Array<{ name: keyof Thresholds; description: string; range: string }> {
  return [
    { name: 'socialCriticalMass', description: 'Social tipping point threshold', range: '[0.20, 0.30]' },
    { name: 'trustRecoveryRate', description: 'Monthly trust recovery rate', range: '[0.005, 0.03]' },
    { name: 'climateSensitivity', description: 'Equilibrium climate sensitivity (°C)', range: '[2.0, 5.0]' },
    { name: 'governmentLegitimacyCrisisThreshold', description: 'Legitimacy collapse threshold', range: '[0.25, 0.40]' },
    { name: 'automationJobLossThreshold', description: 'Automation crisis threshold', range: '[0.25, 0.45]' },
    { name: 'surveillanceDystopiaThreshold', description: 'Surveillance dystopia threshold', range: '[0.65, 0.80]' },
    { name: 'automationDisplacementCrisisThreshold', description: 'Unemployment crisis threshold', range: '[0.40, 0.60]' },
    { name: 'aiRecursiveImprovementThreshold', description: 'AI recursive improvement multiplier', range: '[1.2, 1.5]' },
    { name: 'resentmentRevoltTriggerThreshold', description: 'Resentment revolt trigger', range: '[0.60, 0.80]' }
  ];
}

// Re-export component modules for convenience
export { sampleResearchBackedThresholds, type ResearchBackedThresholds } from './tier1Config';
export { sampleHistoricalThresholds, type HistoricalThresholds } from './tier2Config';
