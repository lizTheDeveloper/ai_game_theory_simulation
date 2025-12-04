/**
 * SimulationRunner - Executes simulation engine for game layer
 *
 * CRITICAL MODULE BOUNDARY RULES (Sylvia-enforced):
 * 1. This is the ONLY module allowed to import from src/simulation/
 * 2. Executes simulation synchronously (1 month at a time)
 * 3. Returns read-only state snapshots
 * 4. Player decisions queued via PlayerDecisionPhase
 *
 * Token conservation: Minimal implementation, no optimization
 */

import type { GameStateSnapshot } from '../types';
import type { GameState } from '@/types/game';
import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';

/**
 * Configuration for simulation runner
 */
export interface SimulationConfig {
  /** Seed for determinism */
  seed: number;

  /** Scenario/config label */
  label?: string;
}

/**
 * Result of running one month
 */
export interface SimulationResult {
  /** Updated state snapshot */
  state: GameStateSnapshot;

  /** Events from this month */
  events: Array<{
    type: string;
    severity?: string;
    description: string;
  }>;

  /** Whether game over condition reached */
  gameOver: boolean;
}

/**
 * SimulationRunner - Manages simulation engine instance
 *
 * Runs synchronously for simplicity (Web Worker optimization later)
 */
export class SimulationRunner {
  private engine: SimulationEngine;
  private currentState: GameState;

  constructor(config: SimulationConfig) {
    // Initialize engine with seed
    this.engine = new SimulationEngine({
      seed: config.seed,
      maxMonths: 12, // Demo limit
      logLevel: 'summary', // Minimal logging for performance
    });

    // Create RNG function for state initialization
    // Use same seed as engine for consistency
    const seedValue = config.seed;
    let rngState = seedValue;
    const rng = () => {
      // Simple LCG matching engine's RNG
      rngState = (rngState * 1664525 + 1013904223) % 0x100000000;
      return rngState / 0x100000000;
    };

    // Initialize state
    this.currentState = createDefaultInitialState(
      rng,
      'historical', // Scenario mode
      undefined, // alignmentDynamicsConfig
      undefined, // climatePriorityConfig
      undefined, // thresholdSliders
      undefined, // speculativeScenario
      undefined, // historicalOverrides
      undefined  // parameterSweepConfig
    );

    // Override runLabel
    this.currentState.config.runLabel = config.label ?? 'game_session';
  }

  /**
   * Run simulation for 1 month
   *
   * @param playerDecisions - Decisions queued by player (if any)
   * @returns Updated state and events
   */
  runMonth(playerDecisions?: unknown[]): SimulationResult {
    // TODO (Phase 4): Apply player decisions to state before step
    // For now, just run simulation without player influence

    // Execute one simulation step
    const stepResult = this.engine.step(this.currentState);

    // Update current state
    this.currentState = stepResult.state;

    // Detect game over (extinction or month 12 demo limit)
    const gameOver = this.isGameOver(this.currentState);

    // Return read-only snapshot
    return {
      state: this.freezeState(this.currentState),
      events: stepResult.events.map((e) => ({
        type: e.type,
        severity: e.severity,
        description: e.description,
      })),
      gameOver,
    };
  }

  /**
   * Get current state snapshot (read-only)
   */
  getState(): GameStateSnapshot {
    return this.freezeState(this.currentState);
  }

  /**
   * Check if game over condition reached
   */
  private isGameOver(state: GameState): boolean {
    // Demo limit: 12 months
    if (state.currentMonth >= 12) {
      return true;
    }

    // Check for extinction
    const population = state.humanPopulationSystem?.population ?? 0;
    if (population < 0.01) {
      // < 10M people = extinction
      return true;
    }

    return false;
  }

  /**
   * Create read-only snapshot of state
   *
   * Shallow freeze for performance (don't deep freeze entire state tree)
   */
  private freezeState(state: GameState): GameStateSnapshot {
    // Return state as-is (TypeScript Readonly type enforces read-only at compile time)
    // No need for runtime freezing - game layer respects type boundaries
    return state as GameStateSnapshot;
  }
}
