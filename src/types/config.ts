// Configuration & Scenario Types

/**
 * P0.7 (Oct 16, 2025): Scenario Mode System
 * Parallel parameter sets for "historical" vs "unprecedented" tail-risk assessment
 *
 * Historical: Calibrated to worst documented crises (Black Death, Spanish Flu, WWII)
 * Unprecedented: Models hyperconnected systemic failures with no historical precedent
 */
export type ScenarioMode = 'historical' | 'unprecedented';

export interface ScenarioParameters {
  // Environmental mortality rates
  cascadeMortalityRate: number;        // Monthly mortality during tipping cascade (historical: 0.5%, unprecedented: 1.5%)
  environmentalShockProbability: number; // Base probability of shock events (historical: 0.02, unprecedented: 0.05)
  environmentalShockMagnitude: number;  // Mortality spike multiplier (historical: 2.0x, unprecedented: 3.5x)

  // Cascade interaction multipliers
  cascadeMultiplier: number;            // Crisis interaction multiplier (historical: 1.8x, unprecedented: 3.5x)

  // Recovery probabilities
  recoveryProbability: number;          // Chance of recovery after bottleneck (historical: 0.10, unprecedented: 0.01)
  babyBoomMultiplier: number;          // Post-crisis fertility spike (historical: 1.6x, unprecedented: 1.2x)

  // Ecosystem dynamics
  ecosystemRegenerationRate: number;    // Recovery speed (historical: faster, unprecedented: slower/irreversible)
}

export interface ConfigurationSettings {
  governmentActionFrequency: number; // [0.1, 4.0] actions per month
  socialAdaptationRate: number; // [0.1, 2.0] speed multiplier
  aiCoordinationMultiplier: number; // [0.8, 3.0] coordination efficiency
  economicTransitionRate: number; // [0.3, 3.0] evolution speed
  runLabel?: string; // Optional label for logs (e.g., "Run 1/10" in Monte Carlo)

  // P0.7 (Oct 16, 2025): Scenario mode selection
  scenarioMode: ScenarioMode; // 'historical' or 'unprecedented'
  scenarioParameters?: ScenarioParameters; // Computed parameters for selected scenario
}

/**
 * RNG function type for deterministic simulation
 * Always use this instead of Math.random() for reproducibility
 */
export type RNGFunction = () => number;
