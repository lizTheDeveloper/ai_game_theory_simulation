/**
 * Game Layer Types - Public API
 *
 * Re-exports all game-specific types.
 *
 * CRITICAL MODULE BOUNDARY RULES (Sylvia-enforced):
 * 1. Game layer NEVER imports from src/simulation/ internal modules
 * 2. Game layer NEVER mutates simulation state directly
 * 3. All influence through PlayerDecisionPhase (order 8.51)
 * 4. Maximum 15% cumulative player influence
 */

// Scenario types
export type {
  ResearchScenarioId,
  ResearchSource,
  ScenarioValidation,
  ResearchScenario,
  ScenarioConfig,
  MonteCarloResults,
  ScenarioComparisonResult,
} from './scenario';

// Import for use in interfaces below
import type { ResearchScenarioId } from './scenario';

// Advocacy types
export type {
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
} from './advocacy';

// Import for use in interfaces below
import type { AdvocacyActionId, CoalitionActionId, CrisisResponseId, QueueResult } from './advocacy';

export { INFLUENCE_BOUNDS } from './advocacy';

// Save/Load types
export type {
  RNGState,
  SaveMetadata,
  GameLayerState,
  SerializedGameState,
  SaveState,
  SaveValidationResult,
  MigrationFn,
  MigrationRegistry,
} from './save';

// Import for use in interfaces below
import type { SaveState } from './save';

export { SAVE_FORMAT_VERSION } from './save';

// Event types
export type {
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
} from './events';

// Import for use in interfaces below
import type { GameLayerEvent } from './events';

// Import GameState and GameEvent from simulation types (READ-ONLY)
// This is the ONLY allowed import from simulation - types only
import type { GameState, GameEvent } from '@/types/game';

/**
 * Read-only snapshot of simulation state
 *
 * Per Sylvia's approval conditions: All game->simulation interfaces
 * must use Readonly<T> types.
 */
export type GameStateSnapshot = Readonly<GameState>;

/**
 * Simulation event (read-only observation)
 */
export type SimulationEvent = Readonly<GameEvent>;

/**
 * Validation result type
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Issues found */
  issues: ValidationIssue[];
}

/**
 * Validation issue
 */
export interface ValidationIssue {
  /** Issue severity */
  severity: 'error' | 'warning' | 'info';

  /** Issue code */
  code: string;

  /** Human-readable message */
  message: string;

  /** Related path in state */
  path?: string;
}

/**
 * Aggregate metrics for UI dashboard
 */
export interface AggregateMetrics {
  /** Current month */
  currentMonth: number;

  /** Outcome classification */
  outcomeClassification: string;

  /** Overall quality of life (0-1) */
  overallQoL: number;

  /** Environmental health (0-1) */
  environmentalHealth: number;

  /** International coordination level (0-1) */
  coordinationLevel: number;

  /** Social stability (0-1) */
  socialStability: number;

  /** AI alignment status (0-1) */
  aiAlignmentStatus: number;

  /** Governance effectiveness (0-1) */
  governanceEffectiveness: number;

  /** Player influence remaining (0-0.15) */
  influenceRemaining: number;

  /** Active crises count */
  activeCrises: number;

  /** Breached boundaries count */
  breachedBoundaries: number;
}

/**
 * Game session interface - public API contract
 *
 * This is what external code interacts with.
 */
export interface GameSessionInterface {
  // === Initialization ===

  /** Start a new game with selected scenario */
  startNewGame(scenario: ResearchScenarioId, seed?: number): void;

  /** Load game from save state */
  loadGame(saveState: SaveState): void;

  // === Observation (read-only) ===

  /** Get current state snapshot */
  getState(): GameStateSnapshot;

  /** Subscribe to game events */
  subscribeToEvents(handler: (event: GameLayerEvent) => void): () => void;

  /** Get aggregate metrics for dashboard */
  getAggregateMetrics(): AggregateMetrics;

  // === Indirect Influence ===

  /** Queue an advocacy action */
  queueAdvocacyAction(actionId: AdvocacyActionId): QueueResult;

  /** Queue a coalition action */
  queueCoalitionAction(actionId: CoalitionActionId): QueueResult;

  /** Queue a crisis response */
  queueCrisisResponse(responseId: CrisisResponseId): QueueResult;

  // === Persistence ===

  /** Save current game state */
  save(): SaveState;

  // === Validation ===

  /** Verify influence within bounds (15% max) */
  validateInfluenceBounds(): ValidationResult;

  /** Get current influence state */
  getInfluenceState(): {
    total: number;
    byDomain: Record<string, number>;
    remaining: number;
  };
}
