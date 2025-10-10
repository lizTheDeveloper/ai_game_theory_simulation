/**
 * System Registry - Phase 2
 *
 * Central registry for managing all simulation systems.
 * Provides coordinated initialization, updates, and queries across systems.
 */

import { SimulationSystem, AccumulationSystem, SpiralSystem, QualitySystem } from './interfaces';
import { GameState } from '@/types/game';

/**
 * Central registry for all simulation systems
 */
export class SystemRegistry {
  private systems: Map<string, SimulationSystem> = new Map();
  private accumulationSystems: AccumulationSystem[] = [];
  private spiralSystems: SpiralSystem[] = [];
  private qualitySystems: QualitySystem[] = [];

  /**
   * Register a system
   */
  register(system: SimulationSystem): void {
    this.systems.set(system.id, system);

    // Track by type for specialized operations
    if (this.isAccumulationSystem(system)) {
      this.accumulationSystems.push(system);
    }
    if (this.isSpiralSystem(system)) {
      this.spiralSystems.push(system);
    }
    if (this.isQualitySystem(system)) {
      this.qualitySystems.push(system);
    }
  }

  /**
   * Get a system by ID
   */
  get(id: string): SimulationSystem | undefined {
    return this.systems.get(id);
  }

  /**
   * Initialize all registered systems
   */
  initializeAll(): Record<string, any> {
    const states: Record<string, any> = {};

    for (const [id, system] of this.systems) {
      states[id] = system.initialize();
    }

    return states;
  }

  /**
   * Update all systems in registered order
   */
  updateAll(globalState: GameState): void {
    for (const system of this.systems.values()) {
      system.update(globalState);
    }
  }

  /**
   * Get overall sustainability (average of all accumulation systems)
   * Returns 0-1 where 1 = all systems sustainable, 0 = all in crisis
   */
  getOverallSustainability(globalState: GameState): number {
    if (this.accumulationSystems.length === 0) return 1.0;

    const sum = this.accumulationSystems.reduce(
      (total, system) => total + system.getSustainability(globalState),
      0
    );

    return sum / this.accumulationSystems.length;
  }

  /**
   * Check if any accumulation system is in crisis
   */
  hasAnyCrisis(globalState: GameState): boolean {
    return this.accumulationSystems.some(system => system.hasCrisis(globalState));
  }

  /**
   * Get all active crises across all systems
   */
  getAllCrises(globalState: GameState): string[] {
    return this.accumulationSystems.flatMap(system =>
      system.getActiveCrises(globalState)
    );
  }

  /**
   * Get count of active spirals
   */
  getActiveSpiralCount(globalState: GameState): number {
    return this.spiralSystems.filter(spiral =>
      spiral.isActive(globalState)
    ).length;
  }

  /**
   * Get overall quality (average of all quality systems)
   * Returns 0-1 where 1 = highest quality across all systems
   */
  getOverallQuality(globalState: GameState): number {
    if (this.qualitySystems.length === 0) return 0.5;

    const sum = this.qualitySystems.reduce(
      (total, system) => total + system.getQuality(globalState),
      0
    );

    return sum / this.qualitySystems.length;
  }

  /**
   * Get all registered system IDs
   */
  getSystemIds(): string[] {
    return Array.from(this.systems.keys());
  }

  /**
   * Get system count by type
   */
  getSystemCount(): {
    total: number;
    accumulation: number;
    spiral: number;
    quality: number;
  } {
    return {
      total: this.systems.size,
      accumulation: this.accumulationSystems.length,
      spiral: this.spiralSystems.length,
      quality: this.qualitySystems.length,
    };
  }

  // Type guards
  private isAccumulationSystem(system: SimulationSystem): system is AccumulationSystem {
    return 'getSustainability' in system && 'hasCrisis' in system;
  }

  private isSpiralSystem(system: SimulationSystem): system is SpiralSystem {
    return 'isActive' in system && 'getStrength' in system;
  }

  private isQualitySystem(system: SimulationSystem): system is QualitySystem {
    return 'getQuality' in system && 'getQualityBreakdown' in system;
  }
}
