/**
 * System Abstraction Interfaces - Phase 2
 *
 * Provides common interfaces for simulation systems to:
 * - Standardize initialization and update patterns
 * - Enable centralized system management
 * - Make system dependencies explicit
 * - Simplify testing and composition
 */

import { GameState } from '@/types/game';

/**
 * Base interface for all simulation systems
 */
export interface SimulationSystem<TState = any> {
  /**
   * Unique identifier for this system
   */
  readonly id: string;

  /**
   * Human-readable name
   */
  readonly name: string;

  /**
   * Initialize system state
   */
  initialize(): TState;

  /**
   * Update system state for one time step
   * @param globalState - Full game state (read-only for most systems)
   */
  update(globalState: GameState): void;
}

/**
 * System that tracks accumulation toward crisis
 *
 * Examples: Environmental degradation, social unrest, technological risk
 */
export interface AccumulationSystem<TState = any> extends SimulationSystem<TState> {
  /**
   * Calculate sustainability level (0 = crisis, 1 = perfect)
   */
  getSustainability(globalState: GameState): number;

  /**
   * Check if system is in crisis state
   */
  hasCrisis(globalState: GameState): boolean;

  /**
   * Get list of active crises for this system
   */
  getActiveCrises(globalState: GameState): string[];
}

/**
 * System that tracks positive spirals toward utopia
 *
 * Examples: Abundance spiral, cognitive spiral, democratic spiral
 */
export interface SpiralSystem<TState = any> extends SimulationSystem<TState> {
  /**
   * Check if spiral is currently active
   */
  isActive(globalState: GameState): boolean;

  /**
   * Get spiral strength (0-1)
   */
  getStrength(globalState: GameState): number;

  /**
   * Get spiral activation requirements
   */
  getRequirements(): string[];

  /**
   * Check which requirements are met
   */
  checkRequirements(globalState: GameState): Record<string, boolean>;
}

/**
 * System with measurable quality/level metric
 *
 * Examples: Quality of life, governance quality, meaning renaissance
 */
export interface QualitySystem<TState = any> extends SimulationSystem<TState> {
  /**
   * Get overall quality level (0-1 or custom range)
   */
  getQuality(globalState: GameState): number;

  /**
   * Get breakdown of quality contributors
   */
  getQualityBreakdown(globalState: GameState): Record<string, number>;
}
