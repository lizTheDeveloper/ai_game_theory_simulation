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

import { SimulationPhase, PhaseResult, RNGFunction, PhaseContext } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';

export class FamineSystemPhase implements SimulationPhase {
  readonly id = 'famine_system';
  readonly name = 'Famine System';
  readonly order = 21.5;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    if (!state.famineSystem) return { events: [] };

    // 1. Check regional biodiversity for new famine triggers (ecosystem collapse)
    const { checkRegionalFamineRisk } = require('../../qualityOfLife');
    checkRegionalFamineRisk(state, state.currentMonth);

    // 2. Update active famines (progress death curves)
    const { updateFamineSystem } = require('../../../types/famine');
    
    const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    const resourcesAvailable = state.resourceEconomy.food.currentStock > 50;
    
    const famineDeaths = updateFamineSystem(
      state.famineSystem,
      totalAICapability,
      resourcesAvailable
    );

    // 3. Apply famine deaths to population
    if (famineDeaths > 0) {
      state.humanPopulationSystem.population -= famineDeaths;

      // MULTI-DIMENSIONAL TRACKING (Oct 18, 2025)
      // PROXIMATE: Famine (starvation, malnutrition)
      state.humanPopulationSystem.deathsByCategory.famine += famineDeaths;

      // ROOT CAUSE: Attribute based on active famine causes
      // TODO: Proper attribution requires iterating through activeFamines
      // For now, aggregate all famine deaths and attribute proportionally
      const famines = state.famineSystem.activeFamines;
      if (famines.length > 0) {
        // Attribute deaths based on famine causes
        let conflictFamines = 0;
        let climateFamines = 0;
        let governanceFamines = 0;
        let naturalFamines = 0;

        for (const famine of famines) {
          if (famine.cause === 'war_displacement' || famine.cause === 'aid_blockade' || famine.cause === 'nuclear_winter') {
            conflictFamines++;
          } else if (famine.cause === 'crop_failure') {
            climateFamines++;
          } else if (famine.cause === 'drought') {
            naturalFamines++; // Natural drought (may be climate-driven)
          } else {
            governanceFamines++; // economic_collapse, resource_extraction
          }
        }

        const total = conflictFamines + climateFamines + governanceFamines + naturalFamines;
        if (total > 0) {
          state.humanPopulationSystem.deathsByRootCause.conflict += famineDeaths * (conflictFamines / total);
          state.humanPopulationSystem.deathsByRootCause.climateChange += famineDeaths * (climateFamines / total);
          state.humanPopulationSystem.deathsByRootCause.governance += famineDeaths * (governanceFamines / total);
          state.humanPopulationSystem.deathsByRootCause.natural += famineDeaths * (naturalFamines / total);
        } else {
          // Fallback: default to governance (policy/distribution failures)
          state.humanPopulationSystem.deathsByRootCause.governance += famineDeaths;
        }
      } else {
        // No active famines (shouldn't happen) - default to governance
        state.humanPopulationSystem.deathsByRootCause.governance += famineDeaths;
      }

      state.humanPopulationSystem.cumulativeCrisisDeaths += famineDeaths;
      state.humanPopulationSystem.monthlyExcessDeaths += famineDeaths;
      
      // Log significant famine deaths (> 1M)
      const deathsMillions = famineDeaths * 1000;
      if (deathsMillions > 1) {
        console.log(`💀 Famine deaths this month: ${deathsMillions.toFixed(1)}M`);
        console.log(`   Active famines: ${state.famineSystem.activeFamines.length}`);
        console.log(`   Total famine deaths: ${(state.famineSystem.totalDeaths * 1000).toFixed(0)}M`);
      }
    }

    return { events: [] };
  }
}

