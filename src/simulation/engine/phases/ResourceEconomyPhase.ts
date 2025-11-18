/**
 * Resource Economy Phase (TIER 3 + 4.4)
 *
 * Consolidated resource economy management:
 * - Resource depletion & economic sustainability (TIER 3)
 * - Resource extraction & technology efficiency (TIER 3)
 * - Power generation & AI energy consumption (TIER 4.4)
 *
 * Research:
 * - IPCC AR6 (2021): Resource constraints and climate feedbacks
 * - IEA (2024): Global energy transitions and AI compute demands
 * - Cordell et al. (2014): Resource efficiency improvements
 *
 * Order: 17.0 (after MAD deterrence, before resource-specific phases)
 *
 * Batch 3 Consolidation (Nov 9, 2025): Absorbed ResourceTechnologyPhase + PowerGenerationPhase
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions'; // Module uses assertions
import { updateResourceEconomy } from '../../resourceDepletion';
import { updatePowerGeneration } from '../../powerGeneration';
import { applyTechnologyToResources, applyIndustryOppositionToTech } from '../../resourceTechnology';

export class ResourceEconomyPhase implements SimulationPhase {
  readonly id = 'resource-economy';
  readonly name = 'Resource Economy Update';
  readonly order = 17.00; // Resource production - first
  readonly dependencies = ['ai-agent-actions', 'tech-tree']; // Resource tech depends on AI actions

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    setDeterministicRng(rng);

    // === RESOURCE ECONOMY BASELINE ===
    // Updates resource depletion & economic sustainability
    updateResourceEconomy(state);

    // === RESOURCE TECHNOLOGY EFFICIENCY ===
    // Applies technology improvements to resource extraction and industry opposition
    applyTechnologyToResources(state);
    applyIndustryOppositionToTech(state);

    // === POWER GENERATION & AI ENERGY ===
    // Updates electricity generation, AI efficiency, crypto mining, climate impact
    updatePowerGeneration(state, rng);

    return { events: [] };
  }
}
