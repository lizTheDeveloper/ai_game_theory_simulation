/**
 * GameSession - Main game session manager
 *
 * Coordinates game layer operations without directly mutating simulation state.
 *
 * CRITICAL MODULE BOUNDARY RULES (Sylvia-enforced):
 * 1. NEVER import from src/simulation/ internal modules
 * 2. NEVER mutate simulation state directly
 * 3. All influence through queued PlayerDecisions
 * 4. Use separate RNG from simulation (determinism protection)
 */

import type {
  GameSessionInterface,
  GameStateSnapshot,
  GameLayerEvent,
  GameLayerState,
  SaveState,
  SaveMetadata,
  RNGState,
  ResearchScenarioId,
  AdvocacyActionId,
  CoalitionActionId,
  CrisisResponseId,
  QueueResult,
  ValidationResult,
  AggregateMetrics,
  InfluenceDomain,
} from '../types';
import { SAVE_FORMAT_VERSION, INFLUENCE_BOUNDS } from '../types';
import { ScenarioManager } from './ScenarioManager';
import { InfluenceCalculator } from './InfluenceCalculator';
import { OutcomeInterpreter } from './OutcomeInterpreter';

/**
 * Game session configuration
 */
export interface GameSessionConfig {
  /** Initial simulation state (from external source) */
  simulationState?: GameStateSnapshot;

  /** Existing game layer state (for load) */
  gameLayerState?: GameLayerState;

  /** Scenario ID */
  scenario: ResearchScenarioId;

  /** RNG seed */
  seed?: number;

  /** Callback to queue decisions to simulation */
  queueDecisionCallback?: (decision: unknown) => void;
}

/**
 * Create initial game layer state
 */
function createInitialGameLayerState(): GameLayerState {
  return {
    activeCampaigns: [],
    coalitions: [],
    decisionHistory: [],
    totalInfluenceSpent: 0,
    influenceByDomain: {
      ai_policy: 0,
      climate_action: 0,
      social_cohesion: 0,
      international_cooperation: 0,
      research_direction: 0,
    },
    juncturesEncountered: [],
    milestonesAchieved: [],
    activeCooldowns: {},
  };
}

/**
 * Simple seeded RNG for game layer (separate from simulation RNG)
 *
 * Per Sylvia's approval conditions: Game layer MUST use separate RNG
 */
function createGameLayerRng(seed: number): () => number {
  let state = seed;

  return function(): number {
    // Simple LCG - separate from simulation's RNG
    state = (state * 1664525 + 1013904223) % 0x100000000;
    return state / 0x100000000;
  };
}

/**
 * Main game session class
 */
export class GameSession implements GameSessionInterface {
  private simulationState: GameStateSnapshot | null = null;
  private gameLayerState: GameLayerState;
  private scenario: ResearchScenarioId;
  private seed: number;
  private rngCallCount: number = 0;
  private gameLayerRng: () => number;
  private gameLayerRngCallCount: number = 0;

  private eventHandlers: Set<(event: GameLayerEvent) => void> = new Set();
  private scenarioManager: ScenarioManager;
  private influenceCalculator: InfluenceCalculator;
  private outcomeInterpreter: OutcomeInterpreter;
  private queueDecisionCallback?: (decision: unknown) => void;

  private startTime: number = Date.now();

  constructor(config: GameSessionConfig) {
    this.scenario = config.scenario;
    this.seed = config.seed ?? Math.floor(Math.random() * 0x100000000);
    this.gameLayerRng = createGameLayerRng(this.seed + 1); // Offset seed for separation

    this.gameLayerState = config.gameLayerState ?? createInitialGameLayerState();
    this.simulationState = config.simulationState ?? null;
    this.queueDecisionCallback = config.queueDecisionCallback;

    this.scenarioManager = new ScenarioManager();
    this.influenceCalculator = new InfluenceCalculator(this.gameLayerState);
    this.outcomeInterpreter = new OutcomeInterpreter();
  }

  // === Initialization ===

  startNewGame(scenario: ResearchScenarioId, seed?: number): void {
    this.scenario = scenario;
    this.seed = seed ?? Math.floor(Math.random() * 0x100000000);
    this.gameLayerRng = createGameLayerRng(this.seed + 1);
    this.gameLayerRngCallCount = 0;
    this.rngCallCount = 0;

    this.gameLayerState = createInitialGameLayerState();
    this.influenceCalculator = new InfluenceCalculator(this.gameLayerState);
    this.startTime = Date.now();

    // Note: Actual simulation initialization is handled externally
    // This just sets up game layer state
  }

  loadGame(saveState: SaveState): void {
    this.scenario = saveState.metadata.scenario;
    this.seed = saveState.rngState.seed;
    this.rngCallCount = saveState.rngState.callCount;
    this.gameLayerRngCallCount = saveState.rngState.gameLayerCallCount;

    // Recreate RNG and advance to saved position
    this.gameLayerRng = createGameLayerRng(saveState.rngState.gameLayerSeed);
    for (let i = 0; i < this.gameLayerRngCallCount; i++) {
      this.gameLayerRng();
    }

    this.gameLayerState = saveState.gameLayerState;
    this.influenceCalculator = new InfluenceCalculator(this.gameLayerState);

    // Note: Simulation state restoration is handled externally
  }

  // === Observation (read-only) ===

  getState(): GameStateSnapshot {
    if (!this.simulationState) {
      throw new Error('Game session not initialized - no simulation state available');
    }
    return this.simulationState;
  }

  /**
   * Update simulation state from external source
   *
   * This is called by the simulation runner to provide state updates.
   * Game layer NEVER creates this state, only observes it.
   */
  updateSimulationState(state: GameStateSnapshot): void {
    this.simulationState = state;
    // Could emit events here based on state changes
  }

  subscribeToEvents(handler: (event: GameLayerEvent) => void): () => void {
    this.eventHandlers.add(handler);

    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  getAggregateMetrics(): AggregateMetrics {
    if (!this.simulationState) {
      return {
        currentMonth: 0,
        outcomeClassification: 'unknown',
        overallQoL: 0,
        environmentalHealth: 0,
        coordinationLevel: 0.5,
        socialStability: 0,
        aiAlignmentStatus: 0,
        governanceEffectiveness: 0,
        influenceRemaining: INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT,
        activeCrises: 0,
        breachedBoundaries: 0,
      };
    }

    return this.outcomeInterpreter.computeAggregateMetrics(
      this.simulationState,
      this.gameLayerState
    );
  }

  // === Indirect Influence ===

  queueAdvocacyAction(actionId: AdvocacyActionId): QueueResult {
    const result = this.influenceCalculator.processAdvocacyAction(
      actionId,
      this.simulationState
    );

    if (result.success && result.queuedDecision) {
      // Queue to simulation via callback
      if (this.queueDecisionCallback) {
        this.queueDecisionCallback(result.queuedDecision);
      }

      // Update game layer state
      this.gameLayerState.decisionHistory.push(result.queuedDecision);
    }

    return result;
  }

  queueCoalitionAction(actionId: CoalitionActionId): QueueResult {
    // Stub - coalition actions convert to player decisions
    return {
      success: false,
      rejectionReason: 'Coalition actions not yet implemented',
    };
  }

  queueCrisisResponse(responseId: CrisisResponseId): QueueResult {
    // Stub - crisis responses convert to player decisions
    return {
      success: false,
      rejectionReason: 'Crisis responses not yet implemented',
    };
  }

  // === Persistence ===

  save(): SaveState {
    const now = new Date().toISOString();
    const playtimeMinutes = Math.floor((Date.now() - this.startTime) / 60000);

    const metadata: SaveMetadata = {
      saveId: `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      saveName: `Save ${now}`,
      createdAt: now,
      lastModified: now,
      scenario: this.scenario,
      currentMonth: this.simulationState?.currentMonth ?? 0,
      outcomeClassification: this.getAggregateMetrics().outcomeClassification,
      playtimeMinutes,
      gameVersion: '1.0.0',
      schemaVersion: this.simulationState?.schemaVersion ?? 1,
    };

    const rngState: RNGState = {
      seed: this.seed,
      callCount: this.rngCallCount,
      gameLayerSeed: this.seed + 1,
      gameLayerCallCount: this.gameLayerRngCallCount,
    };

    return {
      version: SAVE_FORMAT_VERSION,
      metadata,
      simulationState: this.simulationState as unknown as Record<string, unknown>,
      gameLayerState: this.gameLayerState,
      rngState,
    };
  }

  // === Validation ===

  validateInfluenceBounds(): ValidationResult {
    return this.influenceCalculator.validateBounds();
  }

  getInfluenceState(): {
    total: number;
    byDomain: Record<string, number>;
    remaining: number;
  } {
    return {
      total: this.gameLayerState.totalInfluenceSpent,
      byDomain: { ...this.gameLayerState.influenceByDomain },
      remaining: INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT - this.gameLayerState.totalInfluenceSpent,
    };
  }

  // === Internal Helpers ===

  /**
   * Get game layer state (for save/load)
   */
  getGameLayerState(): GameLayerState {
    return this.gameLayerState;
  }

  /**
   * Get RNG seed
   */
  getSeed(): number {
    return this.seed;
  }

  /**
   * Get RNG call count
   */
  getRngCallCount(): number {
    return this.rngCallCount;
  }

  /**
   * Set RNG call count (for external sync)
   */
  setRngCallCount(count: number): void {
    this.rngCallCount = count;
  }

  /**
   * Emit event to all handlers
   */
  protected emitEvent(event: GameLayerEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    }
  }

  /**
   * Use game layer RNG (increments counter)
   */
  protected useRng(): number {
    this.gameLayerRngCallCount++;
    return this.gameLayerRng();
  }
}
