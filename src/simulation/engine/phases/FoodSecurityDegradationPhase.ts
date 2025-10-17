/**
 * Food Security Degradation Phase
 *
 * Phase 1B Refinement (Oct 17, 2025): Apply monthly food security degradation during crises
 *
 * Degradation applies when environmental/resource crises are active, NOT just during cascades.
 * This ensures famines can trigger even if planetary boundary cascades haven't started yet.
 *
 * Research basis:
 * - Historical food crises show 5-15% monthly decline in food availability
 * - Multiple simultaneous crises have compounding effects
 * - Infrastructure breakdown accelerates food system collapse
 *
 * Order: 34.5 (AFTER QualityOfLifePhase at 34.0, which calculates initial food security)
 * CRITICAL: Must run AFTER QualityOfLifePhase, otherwise degradation gets overwritten!
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';

export class FoodSecurityDegradationPhase implements SimulationPhase {
  readonly id = 'food-security-degradation';
  readonly name = 'Food Security Degradation';
  readonly order = 34.5;  // AFTER QualityOfLifePhase (34.0)

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Only degrade if survivalFundamentals exists
    if (!state.survivalFundamentals) {
      return { events: [] };
    }

    const currentFoodSec = state.survivalFundamentals.foodSecurity;

    // Phase 1B Refinement (Oct 17, 2025): Crisis-accelerated food degradation
    // This happens EVERY MONTH when crises are active, not just during cascades

    // Baseline degradation: 1% per month in normal conditions
    let degradationRate = 0.01;

    // Count active crises (multiple systems can fail simultaneously)
    const activeCrises = [
      state.crises?.phosphorusCrisis?.active ? 1 : 0,
      state.crises?.freshwaterCrisis?.active ? 1 : 0,
      state.crises?.biodiversityCrisis?.active ? 1 : 0,
      state.environmentalAccumulation?.tipSurpassed ? 1 : 0,
      state.planetaryBoundariesSystem?.cascadeActive ? 1 : 0,
    ].reduce((sum, c) => sum + c, 0);

    // Each active crisis increases degradation by 50% (compound effect)
    // Example: 2 crises → 1% × 1.5² = 2.25%/month
    // Example: 3 crises → 1% × 1.5³ = 3.375%/month
    if (activeCrises > 0) {
      degradationRate *= Math.pow(1.5, activeCrises);
    }

    // Apply degradation (cap at 15% per month to prevent unrealistic spikes)
    degradationRate = Math.min(0.15, degradationRate);
    const newFoodSec = Math.max(0, currentFoodSec * (1 - degradationRate));
    state.survivalFundamentals.foodSecurity = newFoodSec;

    // DEBUG: Log every month to verify phase is running
    if (state.currentMonth % 12 === 0) {
      console.log(`  [DEBUG Month ${state.currentMonth}] FoodSecurityDegradationPhase: ${(currentFoodSec * 100).toFixed(1)}% → ${(newFoodSec * 100).toFixed(1)}%, crises: ${activeCrises}, rate: ${(degradationRate * 100).toFixed(2)}%`);
    }

    // Log when degradation accelerates significantly
    if (activeCrises >= 2 && degradationRate > 0.02) {
      console.log(`  🌾 Food system under stress: ${activeCrises} active crises, degradation ${(degradationRate * 100).toFixed(1)}%/month`);
      console.log(`     Food security: ${(currentFoodSec * 100).toFixed(1)}% → ${(newFoodSec * 100).toFixed(1)}%`);
    }

    return { events: [] };
  }
}
