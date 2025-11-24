/**
 * Scenario Validation Utilities
 *
 * Monte Carlo validation pipeline for research scenarios.
 *
 * CRITICAL CONSTRAINTS (Sylvia-enforced):
 * - N >= 100 Monte Carlo runs
 * - Baseline deviation <= 15%
 * - Determinism: CV < 0.01% for same seed
 * - No choice > 20% outcome shift
 */

import type {
  ResearchScenario,
  ScenarioValidation,
  MonteCarloResults,
  ScenarioComparisonResult,
} from '../types';

/**
 * Validation thresholds
 */
export const VALIDATION_THRESHOLDS = {
  /** Minimum Monte Carlo runs required */
  MIN_MONTE_CARLO_RUNS: 100,

  /** Maximum baseline deviation (15%) */
  MAX_BASELINE_DEVIATION: 0.15,

  /** Maximum coefficient of variation for same-seed runs */
  MAX_CV_SAME_SEED: 0.0001,  // 0.01%

  /** Maximum single choice outcome shift */
  MAX_SINGLE_CHOICE_SHIFT: 0.20,  // 20%
} as const;

/**
 * Validation result for a single run
 */
interface RunResult {
  seed: number;
  outcome: string;
  finalQoL: number;
  monthsSimulated: number;
}

/**
 * Validate a scenario against thresholds
 *
 * STUB: Actual validation requires running Monte Carlo simulations.
 * This provides the validation framework.
 */
export async function validateScenario(
  _scenario: ResearchScenario,
  _baselineResults: MonteCarloResults
): Promise<ScenarioValidation> {
  // This is a stub - actual implementation requires:
  // 1. Running N=100+ Monte Carlo simulations
  // 2. Computing outcome distributions
  // 3. Comparing to baseline
  // 4. Verifying determinism

  console.warn('validateScenario is a stub - requires Monte Carlo runner integration');

  return {
    monteCarloRuns: 0,
    baselineDeviation: 0,
    deterministicVerified: false,
    playerAgencyBounded: false,
    sylviaApproved: false,
    validationDate: new Date().toISOString(),
    validationNotes: 'STUB: Validation not performed - requires Monte Carlo integration',
  };
}

/**
 * Run Monte Carlo validation
 *
 * STUB: Framework for actual validation
 */
export async function runMonteCarloValidation(
  _scenario: ResearchScenario,
  runs: number = 100
): Promise<MonteCarloResults> {
  console.warn('runMonteCarloValidation is a stub - requires simulation runner');

  return {
    runCount: runs,
    seeds: [],
    outcomeDistribution: {},
    meanFinalQoL: 0,
    stdDevQoL: 0,
    coefficientOfVariation: 0,
  };
}

/**
 * Calculate deviation from baseline
 */
export function calculateDeviationFromBaseline(
  results: MonteCarloResults,
  baselineResults: MonteCarloResults
): number {
  // Deviation = |mean_test - mean_baseline| / mean_baseline
  if (baselineResults.meanFinalQoL === 0) {
    return 0;
  }

  return Math.abs(results.meanFinalQoL - baselineResults.meanFinalQoL) / baselineResults.meanFinalQoL;
}

/**
 * Calculate coefficient of variation
 */
export function calculateCoefficientOfVariation(results: { outcomes: string[] }): number {
  if (!results.outcomes || results.outcomes.length < 2) {
    return 0;
  }

  // For same-seed runs, outcomes should be identical
  // Any variation indicates non-determinism
  const uniqueOutcomes = new Set(results.outcomes);

  if (uniqueOutcomes.size === 1) {
    return 0;  // Perfect determinism
  }

  // Calculate variation (this is a simplification)
  return uniqueOutcomes.size / results.outcomes.length;
}

/**
 * Calculate maximum player influence
 */
export function calculateMaxPlayerInfluence(_results: MonteCarloResults): number {
  // This would analyze decision history to find maximum single-choice impact
  // STUB: Returns placeholder
  return 0.15;
}

/**
 * Compare scenario to baseline
 */
export function compareScenarios(
  testResults: MonteCarloResults,
  baselineResults: MonteCarloResults
): ScenarioComparisonResult {
  const deviation = calculateDeviationFromBaseline(testResults, baselineResults);

  return {
    baseline: baselineResults,
    test: testResults,
    deviation,
    withinBounds: deviation <= VALIDATION_THRESHOLDS.MAX_BASELINE_DEVIATION,
    keyDifferences: identifyKeyDifferences(testResults, baselineResults),
  };
}

/**
 * Identify key differences between scenario results
 */
function identifyKeyDifferences(
  test: MonteCarloResults,
  baseline: MonteCarloResults
): string[] {
  const differences: string[] = [];

  // QoL difference
  const qolDiff = test.meanFinalQoL - baseline.meanFinalQoL;
  if (Math.abs(qolDiff) > 0.05) {
    differences.push(`QoL ${qolDiff > 0 ? 'higher' : 'lower'} by ${(Math.abs(qolDiff) * 100).toFixed(1)}%`);
  }

  // Outcome distribution differences
  const testOutcomes = Object.entries(test.outcomeDistribution);
  const baselineOutcomes = Object.entries(baseline.outcomeDistribution);

  for (const [outcome, count] of testOutcomes) {
    const baselineCount = baseline.outcomeDistribution[outcome] ?? 0;
    const diff = count - baselineCount;

    if (Math.abs(diff) > 10) {
      differences.push(`${outcome}: ${diff > 0 ? '+' : ''}${diff} occurrences`);
    }
  }

  if (differences.length === 0) {
    differences.push('No significant differences from baseline');
  }

  return differences;
}

/**
 * Check if scenario passes all validation gates
 */
export function passesValidationGates(validation: ScenarioValidation): {
  passes: boolean;
  failedGates: string[];
} {
  const failedGates: string[] = [];

  if (validation.monteCarloRuns < VALIDATION_THRESHOLDS.MIN_MONTE_CARLO_RUNS) {
    failedGates.push(`Insufficient Monte Carlo runs: ${validation.monteCarloRuns} < ${VALIDATION_THRESHOLDS.MIN_MONTE_CARLO_RUNS}`);
  }

  if (validation.baselineDeviation > VALIDATION_THRESHOLDS.MAX_BASELINE_DEVIATION) {
    failedGates.push(`Baseline deviation too high: ${(validation.baselineDeviation * 100).toFixed(1)}% > ${VALIDATION_THRESHOLDS.MAX_BASELINE_DEVIATION * 100}%`);
  }

  if (!validation.deterministicVerified) {
    failedGates.push('Determinism not verified');
  }

  if (!validation.playerAgencyBounded) {
    failedGates.push('Player agency bounds not verified');
  }

  if (!validation.sylviaApproved) {
    failedGates.push('Research skeptic approval pending');
  }

  return {
    passes: failedGates.length === 0,
    failedGates,
  };
}

/**
 * Generate validation report
 */
export function generateValidationReport(
  scenario: ResearchScenario,
  comparison?: ScenarioComparisonResult
): string {
  const lines: string[] = [
    `# Validation Report: ${scenario.name}`,
    '',
    `**Scenario ID:** ${scenario.id}`,
    `**Validation Date:** ${scenario.validation.validationDate || 'Not validated'}`,
    '',
    '## Validation Status',
    '',
  ];

  const { passes, failedGates } = passesValidationGates(scenario.validation);

  if (passes) {
    lines.push('**Status:** PASSED');
  } else {
    lines.push('**Status:** FAILED');
    lines.push('');
    lines.push('### Failed Gates:');
    for (const gate of failedGates) {
      lines.push(`- ${gate}`);
    }
  }

  lines.push('');
  lines.push('## Validation Metrics');
  lines.push('');
  lines.push(`- Monte Carlo runs: ${scenario.validation.monteCarloRuns}`);
  lines.push(`- Baseline deviation: ${(scenario.validation.baselineDeviation * 100).toFixed(1)}%`);
  lines.push(`- Determinism verified: ${scenario.validation.deterministicVerified ? 'Yes' : 'No'}`);
  lines.push(`- Player agency bounded: ${scenario.validation.playerAgencyBounded ? 'Yes' : 'No'}`);
  lines.push(`- Sylvia approved: ${scenario.validation.sylviaApproved ? 'Yes' : 'No'}`);

  if (comparison) {
    lines.push('');
    lines.push('## Baseline Comparison');
    lines.push('');
    lines.push(`- Deviation: ${(comparison.deviation * 100).toFixed(1)}%`);
    lines.push(`- Within bounds: ${comparison.withinBounds ? 'Yes' : 'No'}`);
    lines.push('');
    lines.push('### Key Differences:');
    for (const diff of comparison.keyDifferences) {
      lines.push(`- ${diff}`);
    }
  }

  if (scenario.validation.validationNotes) {
    lines.push('');
    lines.push('## Notes');
    lines.push('');
    lines.push(scenario.validation.validationNotes);
  }

  return lines.join('\n');
}
