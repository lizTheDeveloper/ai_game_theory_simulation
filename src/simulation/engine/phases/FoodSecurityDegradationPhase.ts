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
 * Order: 19.7 (AFTER QoL base calculation, BEFORE population mortality)
 * FIX (Oct 25, 2025): Runs after QoL calculates food, then degrades it for mortality calc
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';

export class FoodSecurityDegradationPhase implements SimulationPhase {
  readonly id = 'food-security-degradation';
  readonly name = 'Food Security Degradation';
  readonly order = 19.7;  // AFTER QualityOfLifePhase (19.5), BEFORE population (20.5)

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // Food security degradation runs once per simulation step (once per month)
    // Each engine.step() represents one month advancing
    // Degradation rates are monthly (1-15% per month) - no need to gate on day

    // Only degrade if survivalFundamentals exists
    if (!state.qualityOfLifeSystems?.survivalFundamentals) {
      return { events: [] };
    }

    const currentFoodSec = state.qualityOfLifeSystems.survivalFundamentals.foodSecurity;

    // Phase 1B Refinement (Oct 17, 2025): Crisis-accelerated food degradation
    // This happens EVERY MONTH when crises are active, not just during cascades

    // Baseline degradation: 1% per month in normal conditions
    let degradationRate = 0.01;

    // Count active crises (multiple systems can fail simultaneously)
    if (state.phosphorusSystem === undefined || state.phosphorusSystem.reserves === undefined) {
      throw new Error('❌ state.phosphorusSystem or state.phosphorusSystem.reserves is undefined in FoodSecurityDegradationPhase:45 - initialization bug');
    }
    if (state.freshwaterSystem === undefined || state.freshwaterSystem.blueWater === undefined || state.freshwaterSystem.blueWater.groundwater === undefined) {
      throw new Error('❌ state.freshwaterSystem or state.freshwaterSystem.blueWater.groundwater is undefined in FoodSecurityDegradationPhase:46 - initialization bug');
    }
    if (state.biodiversitySystem === undefined || state.biodiversitySystem.globalBiodiversityIndex === undefined) {
      throw new Error('❌ state.biodiversitySystem or state.biodiversitySystem.globalBiodiversityIndex is undefined in FoodSecurityDegradationPhase:47 - initialization bug');
    }
    const activeCrises = [
      state.phosphorusSystem.reserves < 0.3 ? 1 : 0,  // Phosphorus crisis when reserves < 30%
      state.freshwaterSystem.blueWater.groundwater < 0.3 ? 1 : 0,  // Freshwater crisis when groundwater < 30%
      state.biodiversitySystem.globalBiodiversityIndex < 0.3 ? 1 : 0,  // Biodiversity crisis when BLI < 30%
      (state.environmentalAccumulation?.climateCrisisActive || state.environmentalAccumulation?.ecosystemCrisisActive) ? 1 : 0,
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

    // FIX (Oct 25, 2025 PART 3): Apply infrastructure penalty HERE alongside crisis degradation
    // Moved from calculateFoodSecurity() to avoid conflict with preservation logic
    // Research: Tainter (1988) - complexity requires minimum population to maintain
    const populationRatio = state.humanPopulationSystem.population / 8.0; // 8B baseline
    const infrastructurePenalty = Math.min(1.0, Math.max(0.3, populationRatio)); // 30%-100% capacity

    // Apply BOTH crisis degradation AND infrastructure penalty
    const crisisDegradation = 1 - degradationRate;
    const newFoodSec = Math.max(0, currentFoodSec * crisisDegradation * infrastructurePenalty);
    state.qualityOfLifeSystems.survivalFundamentals.foodSecurity = newFoodSec;

    // DEBUG: Log every month to verify phase is running
    if (state.currentMonth % 12 === 0) {
      console.log(`[Phase ${this.order}] ${this.name}: Food sec BEFORE = ${(currentFoodSec * 100).toFixed(1)}%, AFTER = ${(newFoodSec * 100).toFixed(1)}% | Crises: ${activeCrises}, CrisisRate: ${(degradationRate * 100).toFixed(2)}%/mo, InfraPenalty: ${(infrastructurePenalty * 100).toFixed(0)}%`);
    }

    // Log when degradation accelerates significantly
    if (activeCrises >= 2 && degradationRate > 0.02) {
      console.log(`  🌾 Food system under stress: ${activeCrises} active crises, degradation ${(degradationRate * 100).toFixed(1)}%/month`);
      console.log(`     Food security: ${(currentFoodSec * 100).toFixed(1)}% → ${(newFoodSec * 100).toFixed(1)}%`);
    }

    return { events: [] };
  }
}
