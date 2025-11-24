/**
 * Game Layer - Public API
 *
 * This module provides the game layer interface for the simulation.
 * It observes and influences the simulation indirectly while maintaining
 * strict separation from simulation internals.
 *
 * CRITICAL MODULE BOUNDARY RULES (Sylvia-enforced):
 * 1. Game layer NEVER imports from src/simulation/ internal modules
 * 2. Game layer NEVER mutates simulation state directly
 * 3. All influence through PlayerDecisionPhase (order 8.51)
 * 4. Maximum 15% cumulative player influence
 * 5. Game layer uses SEPARATE RNG from simulation (determinism protection)
 * 6. All game->simulation interfaces use Readonly<T> types
 *
 * Architecture:
 * - /types/     - Type definitions (scenario, advocacy, save, events)
 * - /core/      - Core game logic (GameSession, InfluenceCalculator, etc.)
 * - /scenarios/ - Research-validated scenarios (baseline, optimistic, pessimistic)
 * - /observers/ - Event observation (SimulationObserver, MetricsCollector)
 * - /providers/ - React context providers (GameStateProvider)
 */

// === Types (Public) ===
export type {
  // Core interfaces
  GameSessionInterface,
  GameStateSnapshot,
  SimulationEvent,
  ValidationResult,
  ValidationIssue,
  AggregateMetrics,

  // Scenario types
  ResearchScenarioId,
  ResearchSource,
  ScenarioValidation,
  ResearchScenario,
  ScenarioConfig,
  MonteCarloResults,
  ScenarioComparisonResult,

  // Advocacy types
  InfluenceMechanism,
  InfluenceDomain,
  AdvocacyActionId,
  CoalitionActionId,
  CrisisResponseId,
  AdvocacyAction,
  AdvocacyPrerequisite,
  Coalition,
  Campaign,
  InfluenceValidationResult,
  PlayerDecision,
  QueueResult,

  // Save/Load types
  RNGState,
  SaveMetadata,
  GameLayerState,
  SerializedGameState,
  SaveState,
  SaveValidationResult,
  MigrationFn,
  MigrationRegistry,

  // Event types
  GameLayerEventType,
  GameLayerSeverity,
  GameLayerEvent,
  CrisisEvent,
  TechnologyEvent,
  OutcomeEvent,
  BoundaryEvent,
  JunctureEvent,
  GameLayerEventHandler,
  EventSubscription,
} from './types';

// Import types needed for factory functions
import type { ResearchScenarioId } from './types';

// Constants
export { INFLUENCE_BOUNDS, SAVE_FORMAT_VERSION } from './types';

// === Core Classes ===
import { GameSession as GameSessionClass, type GameSessionConfig } from './core/GameSession';
import { ScenarioManager as ScenarioManagerClass } from './core/ScenarioManager';
import { InfluenceCalculator as InfluenceCalculatorClass } from './core/InfluenceCalculator';
import { OutcomeInterpreter as OutcomeInterpreterClass } from './core/OutcomeInterpreter';

export { GameSessionClass as GameSession, type GameSessionConfig };
export { ScenarioManagerClass as ScenarioManager };
export { InfluenceCalculatorClass as InfluenceCalculator };
export { OutcomeInterpreterClass as OutcomeInterpreter };

// === Observers ===
import { SimulationObserver as SimulationObserverClass, type ISimulationObserver } from './observers/SimulationObserver';
import { MetricsCollector as MetricsCollectorClass, type MetricHistory, type MetricWithTrend, type TrendDirection } from './observers/MetricsCollector';
import { CriticalJunctureDetector as CriticalJunctureDetectorClass, type JunctureType } from './observers/CriticalJunctureDetector';

export { SimulationObserverClass as SimulationObserver, type ISimulationObserver };
export { MetricsCollectorClass as MetricsCollector, type MetricHistory, type MetricWithTrend, type TrendDirection };
export { CriticalJunctureDetectorClass as CriticalJunctureDetector, type JunctureType };

// === Scenarios ===
export { BASELINE_SCENARIO } from './scenarios/baseline';
export { OPTIMISTIC_SCENARIO } from './scenarios/optimistic';
export { PESSIMISTIC_SCENARIO } from './scenarios/pessimistic';

// Validation utilities
export {
  VALIDATION_THRESHOLDS,
  validateScenario,
  runMonteCarloValidation,
  calculateDeviationFromBaseline,
  calculateCoefficientOfVariation,
  calculateMaxPlayerInfluence,
  compareScenarios,
  passesValidationGates,
  generateValidationReport,
} from './scenarios/validation';

// === Factory Functions ===

/**
 * Create a new game session
 */
export function createGameSession(config: {
  scenario: ResearchScenarioId;
  seed?: number;
  queueDecisionCallback?: (decision: unknown) => void;
}): GameSessionClass {
  return new GameSessionClass({
    scenario: config.scenario,
    seed: config.seed,
    queueDecisionCallback: config.queueDecisionCallback,
  });
}

/**
 * Get scenario manager instance
 */
export function getScenarioManager(): ScenarioManagerClass {
  return new ScenarioManagerClass();
}

/**
 * Create simulation observer
 */
export function createSimulationObserver(): SimulationObserverClass {
  return new SimulationObserverClass();
}

/**
 * Create metrics collector
 */
export function createMetricsCollector(): MetricsCollectorClass {
  return new MetricsCollectorClass();
}

/**
 * Create critical juncture detector
 */
export function createCriticalJunctureDetector(): CriticalJunctureDetectorClass {
  return new CriticalJunctureDetectorClass();
}

// === React Providers ===
// Note: Providers are exported separately to avoid pulling React into non-React contexts
// Import directly from '@/game/providers/GameStateProvider' for React usage
