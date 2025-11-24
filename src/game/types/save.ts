/**
 * Save/Load System Types
 *
 * Preserves game state including RNG state for deterministic replay.
 *
 * CRITICAL: RNG state preservation is essential for research validity.
 * Same save file + same version must produce identical results.
 */

import type { ResearchScenarioId } from './scenario';
import type { Campaign, Coalition, PlayerDecision, InfluenceDomain } from './advocacy';

/**
 * Current save format version
 */
export const SAVE_FORMAT_VERSION = '1.0.0';

/**
 * RNG state for deterministic replay
 *
 * CRITICAL: Per Sylvia's approval conditions, game layer MUST use
 * separate RNG from simulation for determinism protection.
 */
export interface RNGState {
  /** Original seed */
  seed: number;

  /** Number of times RNG has been called */
  callCount: number;

  /** Game layer RNG seed (separate from simulation) */
  gameLayerSeed: number;

  /** Game layer RNG call count */
  gameLayerCallCount: number;
}

/**
 * Save metadata
 */
export interface SaveMetadata {
  /** Unique save ID */
  saveId: string;

  /** User-provided save name */
  saveName: string;

  /** When save was created */
  createdAt: string;

  /** When save was last modified */
  lastModified: string;

  /** Scenario being played */
  scenario: ResearchScenarioId;

  /** Current simulation month */
  currentMonth: number;

  /** Current outcome classification */
  outcomeClassification: string;

  /** Total playtime in minutes */
  playtimeMinutes: number;

  /** Game version (for compatibility) */
  gameVersion: string;

  /** Simulation schema version */
  schemaVersion: number;
}

/**
 * Game layer state (separate from simulation state)
 */
export interface GameLayerState {
  /** Active campaigns */
  activeCampaigns: Campaign[];

  /** Formed coalitions */
  coalitions: Coalition[];

  /** Player decision history (for counterfactuals) */
  decisionHistory: PlayerDecision[];

  /** Total influence spent */
  totalInfluenceSpent: number;

  /** Influence by domain */
  influenceByDomain: Record<InfluenceDomain, number>;

  /** Critical junctures encountered */
  juncturesEncountered: string[];

  /** Milestones achieved */
  milestonesAchieved: string[];

  /** Active cooldowns (action ID -> month when available) */
  activeCooldowns: Record<string, number>;
}

/**
 * Serialized simulation state
 *
 * This is the GameState from src/types/game.ts, serialized to JSON.
 * We don't import GameState here to maintain module boundary.
 */
export type SerializedGameState = Record<string, unknown>;

/**
 * Complete save state
 */
export interface SaveState {
  /** Save format version */
  version: string;

  /** Save metadata */
  metadata: SaveMetadata;

  /** Serialized simulation state */
  simulationState: SerializedGameState;

  /** Game layer state */
  gameLayerState: GameLayerState;

  /** RNG state for deterministic replay */
  rngState: RNGState;
}

/**
 * Save validation result
 */
export interface SaveValidationResult {
  /** Whether save is valid */
  valid: boolean;

  /** Validation errors */
  errors: string[];

  /** Validation warnings */
  warnings: string[];

  /** Whether migration is needed */
  needsMigration: boolean;

  /** Source version if needs migration */
  sourceVersion?: string;

  /** Target version if needs migration */
  targetVersion?: string;
}

/**
 * Migration function type
 */
export type MigrationFn = (save: SaveState) => SaveState;

/**
 * Migration registry
 */
export interface MigrationRegistry {
  /** Available migrations keyed by "fromVersion_to_toVersion" */
  migrations: Record<string, MigrationFn>;

  /** Latest version */
  latestVersion: string;
}
