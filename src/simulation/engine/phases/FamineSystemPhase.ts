/**
 * Famine System Phase (TIER 1.7)
 *
 * Manages realistic famine progression and ecosystem collapse famines
 * - Checks regional biodiversity for ecosystem collapse → famine triggers
 * - Updates active famines with gradual 30-60 day death curves
 * - Applies famine deaths to population
 * - Tracks tech deployment effectiveness vs genocide scenarios
 *
 * Research: Gaza/Yemen/Sudan (2024-25), IPBES (2019), FAO (2024)
 *
 * Order: 21.5 (after planetary boundaries 21.0, before extinctions 37.0)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { addMortalityRisk } from '@/simulation/bayesianMortality';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class FamineSystemPhase implements SimulationPhase {
  readonly id = 'famine_system';
  readonly name = 'Famine System';
  readonly order = 21.5;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    if (!state.famineSystem) return { events: [] };
    setDeterministicRng(rng);

    // 1. Check regional biodiversity for new famine triggers (ecosystem collapse)
    const { checkRegionalFamineRisk } = require('../../qualityOfLife');
    checkRegionalFamineRisk(state, state.currentMonth);

    // 2. Update active famines (progress death curves)
    const { updateFamineSystem } = require('../../../types/famine');

    const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    const resourcesAvailable = state.resourceEconomy.food.reserves > 0.5;

    // FIX (Oct 26, 2025): Pass current month for seasonal mortality calculation
    const famineDeaths = updateFamineSystem(
      state.famineSystem,
      totalAICapability,
      resourcesAvailable,
      state.currentMonth
    );

    // 3. Apply famine deaths to population via centralized mortality system
    if (famineDeaths > 0) {
      const famines = state.famineSystem.activeFamines;

      // For each active famine, add mortality risk with appropriate root cause
      // This allows proper Bayesian compounding of multi-causal famines
      if (famines.length > 0) {
        for (const famine of famines) {
          // Estimate this famine's contribution (proportional to active famines)
          const famineMortalityRate = (famineDeaths / famines.length) / state.humanPopulationSystem.population;

          // Determine root cause based on famine cause
          let rootCause: 'conflict' | 'climate' | 'social' | 'ecosystem' = 'social';
          let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';

          if (famine.cause === 'war_displacement' || famine.cause === 'aid_blockade' || famine.cause === 'nuclear_winter') {
            rootCause = 'conflict';
            confidence = 'HIGH'; // War-driven famines well documented
          } else if (famine.cause === 'crop_failure') {
            rootCause = 'climate';
            confidence = 'HIGH'; // Climate-driven crop failures
          } else if (famine.cause === 'drought') {
            rootCause = 'climate'; // Drought is climate-driven
            confidence = 'MEDIUM'; // May have natural variability component
          } else {
            rootCause = 'social'; // economic_collapse, resource_extraction
            confidence = 'HIGH';
          }

          addMortalityRisk(state.humanPopulationSystem, {
            type: 'famine',
            baseRisk: famineMortalityRate,
            proximate: 'famine',
            root: rootCause,
            confidence,
            scope: 'REGIONAL', // Famines are regional
            region: famine.affectedRegion,
            month: state.currentMonth,
            description: `Famine in ${famine.affectedRegion}: ${famine.cause}`,
          });
        }
      } else {
        // No active famines (shouldn't happen) - add aggregate risk with social cause
        const mortalityRate = famineDeaths / state.humanPopulationSystem.population;
        addMortalityRisk(state.humanPopulationSystem, {
          type: 'famine',
          baseRisk: mortalityRate,
          proximate: 'famine',
          root: 'social', // Default to policy/distribution failures
          confidence: 'LOW', // Unknown cause
          scope: 'SEMI-GLOBAL',
          month: state.currentMonth,
          description: 'Unattributed famine deaths',
        });
      }

      // Log significant famine deaths (> 1K)
      const deathsMillions = famineDeaths; // Already in millions
      if (deathsMillions > 0.001) {
        console.log(`💀 Famine deaths this month: ${deathsMillions.toFixed(1)}M`);
        console.log(`   Active famines: ${state.famineSystem.activeFamines.length}`);
        console.log(`   Total famine deaths: ${state.famineSystem.totalDeaths.toFixed(0)}M`);
      }
    }

    return { events: [] };
  }
}

