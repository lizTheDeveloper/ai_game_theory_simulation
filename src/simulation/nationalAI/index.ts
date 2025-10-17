/**
 * National AI System - Main Module
 *
 * This module coordinates all national AI subsystems:
 * - Deployment & capability development
 * - Competition & race dynamics
 * - International cooperation
 * - Regulatory arbitrage
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Creates interaction cache once per step (O(1) lookups)
 * - Eliminates nested country loops (O(n²) → O(n))
 * - Pre-computes bilateral relationships
 */

import { GameState } from '@/types/game';
import { NationalAISystem } from '@/types/nationalAI';

// Import subsystems
import { createInteractionCache } from './interactionCache';
import {
  updateDomesticPresence,
  updateIndigenousCapabilities,
  updateOpenSourceFrontier,
  applyExportControls,
  updateEspionage,
  updateEffectiveCapabilities,
  updateStrategicPositions,
} from './deployment';
import {
  calculateRaceIntensity,
  updateFirstMoverAdvantage,
  applyRaceEffectsOnSafety,
  applyNationalAIToMAD,
} from './competition';
import {
  checkCooperationTriggers,
  updateCooperationAgreement,
  updateInternationalCooperation,
} from './cooperation';
import {
  updateRegulatoryArbitrage,
} from './regulation';

// Re-export initialization
export { initializeNationalAI } from './initialization';

// Re-export for external use (MAD integration)
export { applyNationalAIToMAD, calculateRaceIntensity };

// ============================================================================
// MAIN UPDATE
// ============================================================================

/**
 * Main national AI update function
 * Called once per simulation step
 *
 * PERFORMANCE: Creates interaction cache at start to eliminate O(n²) lookups
 */
export function updateNationalAI(state: GameState): void {
  const natAI = state.nationalAI;

  // === OPTIMIZATION: Create interaction cache (O(n) one-time cost) ===
  // This converts O(n²) nested loops throughout the module to O(1) Map lookups
  const cache = createInteractionCache(state);

  // === DEPLOYMENT & CAPABILITIES ===
  // Update domestic presence (which orgs/AIs belong to which nations)
  updateDomesticPresence(state);

  // Update indigenous capabilities from domestic labs
  updateIndigenousCapabilities(state, cache);

  // Update open source frontier
  updateOpenSourceFrontier(state);

  // Apply export controls (restrict commercial access)
  applyExportControls(state, cache);

  // Espionage attempts (steal models)
  updateEspionage(state, cache);

  // Calculate effective capabilities (max of all sources)
  updateEffectiveCapabilities(state);

  // Update strategic positions (gaps, leaders)
  updateStrategicPositions(state, cache);

  // === COMPETITION & RACE DYNAMICS ===
  // Calculate AI race intensity
  calculateRaceIntensity(state, cache);

  // Update first-mover advantages
  updateFirstMoverAdvantage(state, cache);

  // Apply race effects on safety
  applyRaceEffectsOnSafety(state, cache);

  // === COOPERATION ===
  // Check for cooperation triggers
  checkCooperationTriggers(state);

  // Update cooperation agreement (if active)
  if (natAI.cooperationAgreement?.active) {
    updateCooperationAgreement(state, cache);
  }

  // Update international cooperation (low probability formation)
  updateInternationalCooperation(state, cache);

  // === REGULATION ===
  // Update regulatory arbitrage dynamics
  updateRegulatoryArbitrage(state, cache);
}
