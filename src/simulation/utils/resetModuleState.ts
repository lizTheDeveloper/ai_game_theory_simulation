/**
 * Reset all module-level state for deterministic simulation
 *
 * CRITICAL FIX (Nov 24, 2025): Module-level state persists between runs
 * in the same Node.js process, causing non-determinism in Monte Carlo simulations.
 *
 * This function resets all known singletons to their initial state.
 * Call this at the start of each simulation run.
 */

import { clearDeterministicRng } from './deterministicRng';
import { resetGlobalWUE } from '../aiInfrastructureResources';
import { governmentActionRegistry } from '../government/core/actionRegistry';
import { resetValidationContext } from './stateValidation';
import { resetCrisisEventIdCounter } from '../government/actions/crisisActions';
import { resetEnvironmentalEventIdCounter } from '../government/actions/environmentalActions';

/**
 * Reset all module-level state for a fresh simulation run
 *
 * Call this BEFORE creating a new SimulationEngine and GameState.
 * Ensures each run starts with identical conditions.
 */
export function resetModuleState(): void {
  // Clear global RNG singleton
  clearDeterministicRng();

  // Reset WUE to initial value
  resetGlobalWUE();

  // Reset validation context
  resetValidationContext();

  // Clear government action registry (will be repopulated by initialization)
  governmentActionRegistry.clear();

  // Reset event ID counters (Nov 24, 2025 - architecture review finding)
  resetCrisisEventIdCounter();
  resetEnvironmentalEventIdCounter();
}
