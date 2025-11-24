/**
 * ScenarioManager - Research scenario loading and validation
 *
 * Manages research-validated scenarios for the game layer.
 *
 * CRITICAL: All scenarios must pass validation before use:
 * - N >= 100 Monte Carlo runs
 * - Baseline deviation <= 15%
 * - Determinism verified (CV < 0.01%)
 * - Sylvia approved
 */

import type {
  ResearchScenario,
  ResearchScenarioId,
  ScenarioConfig,
  ScenarioValidation,
  MonteCarloResults,
  ScenarioComparisonResult,
} from '../types';

/**
 * Scenario registry - available scenarios
 */
const SCENARIO_REGISTRY: Map<ResearchScenarioId, ResearchScenario> = new Map();

/**
 * ScenarioManager class
 */
export class ScenarioManager {
  /**
   * Get a registered scenario by ID
   */
  getScenario(id: ResearchScenarioId): ResearchScenario | undefined {
    // Import scenarios lazily to avoid circular dependencies
    return SCENARIO_REGISTRY.get(id);
  }

  /**
   * Get all available scenarios
   */
  getAllScenarios(): ResearchScenario[] {
    return Array.from(SCENARIO_REGISTRY.values());
  }

  /**
   * Get playable scenarios (validated and approved)
   */
  getPlayableScenarios(): ResearchScenario[] {
    return this.getAllScenarios().filter(s => this.isPlayable(s));
  }

  /**
   * Check if scenario is playable
   */
  isPlayable(scenario: ResearchScenario): boolean {
    const v = scenario.validation;
    return (
      v.monteCarloRuns >= 100 &&
      v.baselineDeviation <= 0.15 &&
      v.deterministicVerified &&
      v.playerAgencyBounded &&
      v.sylviaApproved
    );
  }

  /**
   * Validate scenario config
   */
  validateConfig(config: ScenarioConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check scenario exists
    const scenario = this.getScenario(config.scenarioId);
    if (!scenario) {
      errors.push(`Scenario '${config.scenarioId}' not found`);
      return { valid: false, errors };
    }

    // Check scenario is playable
    if (!this.isPlayable(scenario)) {
      errors.push(`Scenario '${config.scenarioId}' is not validated for play`);

      const v = scenario.validation;
      if (v.monteCarloRuns < 100) {
        errors.push(`  - Insufficient Monte Carlo runs: ${v.monteCarloRuns} < 100`);
      }
      if (v.baselineDeviation > 0.15) {
        errors.push(`  - Baseline deviation too high: ${v.baselineDeviation.toFixed(3)} > 0.15`);
      }
      if (!v.deterministicVerified) {
        errors.push('  - Determinism not verified');
      }
      if (!v.playerAgencyBounded) {
        errors.push('  - Player agency not bounded');
      }
      if (!v.sylviaApproved) {
        errors.push('  - Awaiting research skeptic approval');
      }
    }

    // Check custom scenario restrictions
    if (config.scenarioId === 'custom' && !config.customParams) {
      errors.push('Custom scenario requires customParams');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get simulation config for scenario
   *
   * Returns the ScenarioDefinition to pass to simulation
   */
  getSimulationConfig(id: ResearchScenarioId): unknown {
    const scenario = this.getScenario(id);
    if (!scenario) {
      throw new Error(`Scenario '${id}' not found`);
    }
    return scenario.simulationConfig;
  }

  /**
   * Register a scenario (for scenario module initialization)
   */
  static registerScenario(scenario: ResearchScenario): void {
    SCENARIO_REGISTRY.set(scenario.id, scenario);
  }

  /**
   * Validate scenario against baseline
   *
   * STUB: Actual validation requires running Monte Carlo simulations
   */
  async validateScenario(
    scenario: ResearchScenario,
    _baselineResults: MonteCarloResults
  ): Promise<ScenarioValidation> {
    // This is a stub - actual implementation requires Monte Carlo runner
    console.warn('ScenarioManager.validateScenario is a stub - requires Monte Carlo runner');

    return {
      monteCarloRuns: 0,
      baselineDeviation: 0,
      deterministicVerified: false,
      playerAgencyBounded: false,
      sylviaApproved: false,
      validationDate: new Date().toISOString(),
      validationNotes: 'STUB - validation not performed',
    };
  }

  /**
   * Compare scenario to baseline
   *
   * STUB: Actual comparison requires Monte Carlo results
   */
  async compareToBaseline(
    scenario: ResearchScenario,
    _runs: number = 100
  ): Promise<ScenarioComparisonResult> {
    // This is a stub
    console.warn('ScenarioManager.compareToBaseline is a stub - requires Monte Carlo runner');

    return {
      baseline: {
        runCount: 0,
        seeds: [],
        outcomeDistribution: {},
        meanFinalQoL: 0,
        stdDevQoL: 0,
        coefficientOfVariation: 0,
      },
      test: {
        runCount: 0,
        seeds: [],
        outcomeDistribution: {},
        meanFinalQoL: 0,
        stdDevQoL: 0,
        coefficientOfVariation: 0,
      },
      deviation: 0,
      withinBounds: false,
      keyDifferences: ['STUB - comparison not performed'],
    };
  }

  /**
   * Get scenario research sources
   */
  getResearchSources(id: ResearchScenarioId): { citation: string; year: number }[] {
    const scenario = this.getScenario(id);
    if (!scenario) {
      return [];
    }
    return scenario.researchSources.map(s => ({
      citation: s.citation,
      year: s.year,
    }));
  }

  /**
   * Get scenario description for UI
   */
  getScenarioDescription(id: ResearchScenarioId): {
    name: string;
    description: string;
    challenges: string[];
    strategies: string[];
  } | null {
    const scenario = this.getScenario(id);
    if (!scenario) {
      return null;
    }
    return {
      name: scenario.name,
      description: scenario.description,
      challenges: scenario.expectedChallenges ?? [],
      strategies: scenario.recommendedStrategies ?? [],
    };
  }
}
