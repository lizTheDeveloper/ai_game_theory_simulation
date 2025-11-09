/**
 * TIER 2: High-Value Coastal Protection Phase
 *
 * Restores high-value coastal areas (coral, kelp, mangroves) where benefit-cost >1.
 *
 * Execution Order: TBD (after ocean crisis detection, before ocean acidification collapse)
 *
 * Evidence Quality: 🟡 MODERATE
 * Research: Bayraktarov et al. (2016), USGS Florida/Puerto Rico cost-benefit studies
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Key Mechanics:
 * - Effectiveness: 15-25% of ocean crisis mitigation (NOT planetary ocean restoration)
 * - Cost per hectare: Log-Normal μ=12.9, σ=1.2 bounded [$13K, $1M]
 * - Scope: Coastal protection only, multiple interventions needed
 * - Deployment: 24-72 months
 *
 * Implementation Date: October 27, 2025
 */

import type {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class Tier2CoastalProtectionPhase implements SimulationPhase {
  id = 'tier2_coastal_protection';
  name = 'TIER 2: High-Value Coastal Protection';
  order = 20.5; // After ocean updates, before ocean acidification crisis
  dependencies = ['tech-tree'];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    if (!state.tier2Interventions || !state.tier2InterventionParameters) {
      return { events };
    }

    const coastalState = state.tier2Interventions.coastalProtection;
    const params = state.tier2InterventionParameters.coastalProtection;

    // === UNLOCK CONDITIONS ===
    if (!coastalState.unlocked) {
      // Unlock when ocean health declining + government responding
      const oceanpH = state.planetaryBoundariesSystem.boundaries.ocean_acidification?.currentValue || 8.1;
      const oceanHealth = (oceanpH - 7.6) / (8.2 - 7.6); // Normalize pH to [0,1]
      // Normalize alignmentResearchInvestment from [0,10] to [0,1] for probability checks
      const governmentInvestment = state.government.alignmentResearchInvestment / 10;

      const shouldUnlock =
        (oceanHealth < 0.60) ||
        (governmentInvestment > 0.40 && oceanHealth < 0.70);

      if (shouldUnlock) {
        coastalState.unlocked = true;
        events.push({
          id: `tier2_coastal_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'high',
          title: 'High-Value Coastal Protection Program Launched',
          description: `Coastal restoration where benefit-cost >1 (coral, kelp, mangroves). ` +
            `Expected ocean crisis mitigation: ${(params.effectiveness * 100).toFixed(0)}%. ` +
            `Cost per hectare: $${(params.costPerHectare / 1000).toFixed(0)}K (avg). ` +
            `Deployment: ${params.deploymentMonths.toFixed(0)} months. ` +
            `Note: Coastal protection only, NOT planetary ocean restoration.`,
          effects: {
            effectiveness: params.effectiveness,
            costPerHectare: params.costPerHectare,
            deploymentMonths: params.deploymentMonths
          },
          agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (coastalState.unlocked && !coastalState.active) {
      const progressIncrement = 1 / params.deploymentMonths;
      coastalState.deploymentProgress = Math.min(1, coastalState.deploymentProgress + progressIncrement);

      // Protect hectares as deployment progresses
      const targetHectares = 1000000; // Target 1M hectares globally (high-value coastal areas)
      const currentHectares = Math.floor(coastalState.deploymentProgress * targetHectares);

      if (currentHectares > coastalState.hectaresProtected) {
        const newHectares = currentHectares - coastalState.hectaresProtected;
        coastalState.hectaresProtected = currentHectares;

        // Accumulate cost
        coastalState.totalCostSpent += newHectares * params.costPerHectare;
      }

      // Activate when 50% deployed
      if (coastalState.deploymentProgress >= 0.50 && !coastalState.active) {
        coastalState.active = true;

        events.push({
          id: `tier2_coastal_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'high',
          title: 'Coastal Protection at Scale',
          description: `${(coastalState.hectaresProtected / 1000).toFixed(0)}K hectares of high-value coastal areas protected. ` +
            `Total investment: $${(coastalState.totalCostSpent / 1e9).toFixed(1)}B. ` +
            `Ocean crisis mitigation active.`,
          effects: {
            hectaresProtected: coastalState.hectaresProtected,
            totalCostSpent: coastalState.totalCostSpent
          },
          agent: "system",
        });
      }
    }

    // === EFFECTS APPLICATION ===
    if (coastalState.active) {
      // Update tracking
      coastalState.oceanCrisisMitigation = params.effectiveness * coastalState.deploymentProgress;

      // Apply ocean crisis mitigation (improve ocean health)
      // (Architecture Review M5 - Oct 27, 2025): Only improve if ocean is acidified
      const oceanBoundary = state.planetaryBoundariesSystem.boundaries.ocean_acidification;
      if (oceanBoundary?.currentValue !== undefined) {
        const SAFE_PH = 8.1; // Pre-industrial baseline (research-backed)
        const currentpH = oceanBoundary.currentValue;

        // Only apply improvement if pH is below safe threshold
        if (currentpH < SAFE_PH) {
          const monthlyImprovement = coastalState.oceanCrisisMitigation * 0.001; // 0.1% monthly at full deployment
          oceanBoundary.currentValue = Math.min(
            SAFE_PH, // Cap at safe level (not overshooting)
            currentpH + monthlyImprovement
          );
        }
      }

      // Log annual updates
      if (state.currentMonth % 12 === 0) {
        events.push({
          id: `tier2_coastal_update_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: 'medium',
          title: 'Coastal Protection Annual Report',
          description: `Hectares protected: ${(coastalState.hectaresProtected / 1000).toFixed(0)}K. ` +
            `Total cost: $${(coastalState.totalCostSpent / 1e9).toFixed(1)}B. ` +
            `Ocean crisis mitigation: ${(coastalState.oceanCrisisMitigation * 100).toFixed(0)}%. ` +
            `Ocean pH: ${state.planetaryBoundariesSystem.boundaries.ocean_acidification?.currentValue?.toFixed(3) || 'N/A'}.`,
          effects: {
            hectaresProtected: coastalState.hectaresProtected,
            oceanCrisisMitigation: coastalState.oceanCrisisMitigation,
            oceanpH: state.planetaryBoundariesSystem.boundaries.ocean_acidification?.currentValue
          },
          agent: "system",
        });
      }
    }

    return { events };
  }
}
