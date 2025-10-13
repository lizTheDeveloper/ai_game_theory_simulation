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
      
      // Track cumulative deaths by category
      state.humanPopulationSystem.deathsByCategory.famine += famineDeaths;
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

