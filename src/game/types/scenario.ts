/**
 * Research Scenario Types
 *
 * Research-validated scenarios for the game layer.
 * Builds on existing ScenarioDefinition from src/types/scenarios.ts
 *
 * CRITICAL CONSTRAINT (Sylvia-enforced):
 * - All scenarios must have 2+ peer-reviewed sources
 * - Scenario deviation from baseline must be <= 15%
 * - Monte Carlo validation required (N >= 100)
 */

import type { ScenarioDefinition } from '@/types/scenarios';

/**
 * Research scenario IDs - predefined validated scenarios
 */
export type ResearchScenarioId =
  | 'baseline'     // Consensus trajectory (control)
  | 'optimistic'   // Best case supported by evidence
  | 'pessimistic'  // Realistic worst case
  | 'custom';      // Academic users only (requires validation)

/**
 * Research source - peer-reviewed citation
 */
export interface ResearchSource {
  /** Full academic citation */
  citation: string;

  /** Publication year (2024-2025 preferred) */
  year: number;

  /** Key findings relevant to scenario */
  relevantFindings: string;

  /** How findings justify parameters */
  parameterJustification: string;

  /** DOI if available */
  doi?: string;

  /** Zotero ID for tracking */
  zoteroId?: string;
}

/**
 * Scenario validation results
 *
 * MANDATORY before scenario is playable
 */
export interface ScenarioValidation {
  /** Number of Monte Carlo runs (must be >= 100) */
  monteCarloRuns: number;

  /** Deviation from baseline outcomes (must be <= 0.15) */
  baselineDeviation: number;

  /** Determinism verified (CV < 0.01% for same seed) */
  deterministicVerified: boolean;

  /** No single choice > 20% outcome shift */
  playerAgencyBounded: boolean;

  /** Explicit sign-off from research skeptic */
  sylviaApproved: boolean;

  /** Date of validation */
  validationDate: string;

  /** Validation notes */
  validationNotes?: string;
}

/**
 * Research-validated scenario for game layer
 */
export interface ResearchScenario {
  /** Scenario identifier */
  id: ResearchScenarioId;

  /** Human-readable name */
  name: string;

  /** Scenario description */
  description: string;

  /** Research foundation */
  researchSources: ResearchSource[];

  /** Maps to simulation ScenarioDefinition */
  simulationConfig: ScenarioDefinition;

  /** Validation results (REQUIRED before playable) */
  validation: ScenarioValidation;

  /** Recommended player strategies (for guidance) */
  recommendedStrategies?: string[];

  /** Expected challenges */
  expectedChallenges?: string[];
}

/**
 * Scenario configuration for game start
 */
export interface ScenarioConfig {
  /** Selected scenario ID */
  scenarioId: ResearchScenarioId;

  /** RNG seed (for determinism) */
  seed?: number;

  /** Custom parameters (academic users only) */
  customParams?: Partial<ScenarioDefinition>;
}

/**
 * Monte Carlo results for scenario validation
 */
export interface MonteCarloResults {
  /** Number of runs */
  runCount: number;

  /** Seed used */
  seeds: number[];

  /** Outcome distribution */
  outcomeDistribution: Record<string, number>;

  /** Mean final QoL */
  meanFinalQoL: number;

  /** Standard deviation of QoL */
  stdDevQoL: number;

  /** Coefficient of variation */
  coefficientOfVariation: number;

  /** Same-seed run results (for determinism check) */
  sameSeedRuns?: {
    seed: number;
    outcomes: string[];
    cv: number;
  };
}

/**
 * Scenario comparison result
 */
export interface ScenarioComparisonResult {
  /** Baseline scenario results */
  baseline: MonteCarloResults;

  /** Test scenario results */
  test: MonteCarloResults;

  /** Deviation from baseline */
  deviation: number;

  /** Whether within acceptable bounds (15%) */
  withinBounds: boolean;

  /** Key differences identified */
  keyDifferences: string[];
}
