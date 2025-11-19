/**
 * Novel Entities Boundary Update with Energy-Constrained Cleanup (Nov 16, 2025)
 *
 * Models slow decay, atmospheric redeposition, and energy/concentration constraints for cleanup.
 *
 * Research backing:
 * - Cousins et al. (2022): 99% of cleanup rains back down globally (atmospheric cycling)
 * - EPA (2024): 75 GJ/ton median energy requirement for PFAS destruction
 * - Fennell (2024): 6-9 orders of magnitude concentration gap
 * - Ling (2024): Prevention >> Cleanup effectiveness
 *
 * @see research/novel_entities_irreversibility_20251116.md
 * @see plans/novel_entities_irreversibility_implementation_plan.md
 */

import type { GameState, RNGFunction } from '@/types/game';
import { getAllTech, type TechDefinition } from './techTree/comprehensiveTechTree';
import { applyEnergyConstrainedCleanup } from './utils/energyConstrainedCleanup';
import { assertFinite, assertStateProperty } from './utils/assertions';

/**
 * Update Novel Entities planetary boundary with slow decay model
 *
 * Flow:
 * 1. Production rate (new emissions from economy)
 * 2. Prevention technologies (reduce production)
 * 3. Cleanup technologies (energy-constrained)
 * 4. Natural decay (500-year half-life)
 * 5. Atmospheric redeposition (99% of cleanup rains back)
 *
 * @param state - Game state
 * @param rng - Deterministic RNG (REQUIRED for rebound coefficient sampling)
 */
export function updateNovelEntitiesBoundary(state: GameState, rng: RNGFunction): void {
  // CRITICAL: Validate RNG
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation in updateNovelEntitiesBoundary');
  }

  const boundary = state.planetaryBoundariesSystem?.boundaries?.novel_entities;
  if (!boundary) return;

  const previousValue = boundary.currentValue;

  // === 1. PRODUCTION FLOW (increases contamination) ===
  // Base production scales with economic activity
  const economicStage = assertStateProperty(
    state.globalMetrics,
    'economicTransitionStage',
    { location: 'updateNovelEntitiesBoundary', month: state.currentMonth }
  );

  const manufacturingCap = assertStateProperty(
    state.globalMetrics,
    'manufacturingCapability',
    { location: 'updateNovelEntitiesBoundary', month: state.currentMonth }
  );

  // Base production rate (normalized to boundary scale [0, 1])
  let productionRate = (economicStage * 0.002) + (manufacturingCap * 0.001);

  // === 2. PREVENTION TECHNOLOGIES (reduce production at source) ===
  // Get all deployed prevention techs from comprehensive tech tree
  const allTech = getAllTech();
  const preventionTechs = allTech.filter(tech =>
    tech.techType === 'prevention' &&
    tech.deploymentLevel > 0 &&
    (tech.effects.novelEntitiesEmissionReduction !== undefined ||
     tech.effects.pollutionReduction !== undefined)
  );

  for (const tech of preventionTechs) {
    const reduction = (tech.effects.novelEntitiesEmissionReduction ?? tech.effects.pollutionReduction ?? 0);
    productionRate *= (1 - reduction * tech.deploymentLevel);
  }

  // === 3. CLEANUP TECHNOLOGIES (energy-constrained) ===
  let totalCleanup = 0;

  // Diagnostic logging (Nov 19, 2025): Debug cleanup non-deployment
  const allCleanupTechs = allTech.filter(tech => tech.techType === 'cleanup');
  const deployedCleanupTechs = allCleanupTechs.filter(tech => tech.deploymentLevel > 0);
  const cleanupWithEffects = deployedCleanupTechs.filter(tech =>
    tech.effects.pfasReduction !== undefined ||
    tech.effects.microplasticReduction !== undefined ||
    tech.effects.pollutionReduction !== undefined
  );

  if (state.currentMonth % 12 === 0) {
    console.log(`\n🔧 Novel Entities Cleanup Tech Status (Month ${state.currentMonth}):`);
    console.log(`  Total cleanup techs: ${allCleanupTechs.length}`);
    console.log(`  Deployed: ${deployedCleanupTechs.length}`);
    console.log(`  With novel entities effects: ${cleanupWithEffects.length}`);
    if (deployedCleanupTechs.length > 0) {
      deployedCleanupTechs.forEach(tech => {
        console.log(`    - ${tech.name}: deployment ${(tech.deploymentLevel * 100).toFixed(1)}%`);
        console.log(`      Effects: pfas=${tech.effects.pfasReduction}, plastic=${tech.effects.microplasticReduction}, pollution=${tech.effects.pollutionReduction}`);
      });
    }
  }

  const cleanupTechs = cleanupWithEffects;

  for (const tech of cleanupTechs) {
    const result = applyEnergyConstrainedCleanup(state, tech, boundary.currentValue, rng);
    totalCleanup += result.netEffectiveness;

    // Log cleanup details (verbose, only every 12 months)
    if (state.currentMonth % 12 === 0 && result.netEffectiveness > 0.001) {
      console.log(`  🧪 ${tech.name}:`);
      console.log(`    Concentration Factor: ${(result.concentrationFactor * 100).toFixed(2)}%`);
      console.log(`    Energy Factor: ${(result.energyFactor * 100).toFixed(2)}%`);
      console.log(`    Gross → Net: ${(result.grossEffectiveness * 100).toFixed(2)}% → ${(result.netEffectiveness * 100).toFixed(2)}%`);
      if (result.rebound > 0) {
        console.log(`    ⚠️ Rebound: -${(result.rebound * 100).toFixed(2)}%`);
      }
    }
  }

  // === 4. NATURAL DECAY (very slow for irreversible boundaries) ===
  let decayRate = 0;
  if (boundary.irreversible && boundary.recoveryHalfLife) {
    // Exponential decay: dN/dt = -λN, where λ = ln(2) / half-life
    const lambda = Math.log(2) / boundary.recoveryHalfLife;  // per year
    const monthlyLambda = lambda / 12;  // per month
    decayRate = boundary.currentValue * monthlyLambda;

    decayRate = assertFinite(decayRate, {
      location: 'updateNovelEntitiesBoundary',
      valueName: 'decayRate',
      month: state.currentMonth,
      additionalInfo: { halfLife: boundary.recoveryHalfLife, lambda, monthlyLambda },
    });
  }

  // === 5. ATMOSPHERIC REDEPOSITION (counteracts cleanup) ===
  // Research: Cousins et al. 2022 - 99% of cleanup rains back down globally
  // Note: This is novel entities specific behavior (PFAS volatilization)
  let redepositionRate = 0;
  if (boundary.name === 'novel_entities' && totalCleanup > 0) {
    redepositionRate = totalCleanup * 0.99;
    totalCleanup *= 0.01;  // Only 1% stays removed
  }

  // === 6. UPDATE BOUNDARY VALUE ===
  const netChange = productionRate - totalCleanup - decayRate + redepositionRate;

  boundary.currentValue += netChange;
  boundary.currentValue = Math.max(0, Math.min(2, boundary.currentValue));  // Clamp [0, 2]

  boundary.currentValue = assertFinite(boundary.currentValue, {
    location: 'updateNovelEntitiesBoundary',
    valueName: 'novel_entities.currentValue',
    month: state.currentMonth,
    additionalInfo: {
      previousValue,
      productionRate,
      totalCleanup,
      decayRate,
      redepositionRate,
      netChange,
    },
  });

  // === 7. TRACK PEAK (for irreversibility floor) ===
  if (boundary.peak === undefined || boundary.currentValue > boundary.peak) {
    boundary.peak = boundary.currentValue;
  }

  // === 8. LOGGING (monthly summary) ===
  if (state.currentMonth % 1 === 0) {  // Every month
    console.log(`\n🌍 Novel Entities Boundary Update (Month ${state.currentMonth}):`);
    console.log(`  Production: +${(productionRate * 100).toFixed(4)}%`);
    console.log(`  Cleanup (gross): -${((totalCleanup / 0.01) * 100).toFixed(4)}%`);
    if (redepositionRate > 0) {
      console.log(`  Atmospheric Redeposition: +${(redepositionRate * 100).toFixed(4)}% (99% rains back)`);
      console.log(`  Cleanup (net): -${(totalCleanup * 100).toFixed(4)}%`);
    } else {
      console.log(`  Cleanup (net): -${(totalCleanup * 100).toFixed(4)}%`);
    }
    console.log(`  Natural Decay: -${(decayRate * 100).toFixed(6)}% (half-life: ${boundary.recoveryHalfLife ?? 0} years)`);
    console.log(`  Net Change: ${previousValue.toFixed(4)} → ${boundary.currentValue.toFixed(4)} (Δ${(netChange * 100).toFixed(4)}%)`);
    console.log(`  Peak: ${(boundary.peak ?? 0).toFixed(4)}`);
  }
}
