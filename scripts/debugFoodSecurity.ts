#!/usr/bin/env tsx
/**
 * Debug script to track food security values throughout a simulation run
 *
 * Logs:
 * - Food security value each month
 * - Active crises
 * - Population levels
 * - Infrastructure penalties
 * - When famines should trigger (< 0.6)
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('\n=== FOOD SECURITY DEBUG RUN ===\n');

const initialState = createDefaultInitialState();
const seed = 42000;
console.log(`Seed: ${seed}`);
console.log(`Starting food security: ${(initialState.survivalFundamentals?.foodSecurity ?? 0).toFixed(3)}`);
console.log(`Starting population: ${initialState.humanPopulationSystem.population.toFixed(3)}B\n`);

const engine = new SimulationEngine({ seed, maxMonths: 120 });

// Create a custom observer to log food security
let monthCounter = 0;
const observer = {
  onMonthComplete: (state: any) => {
    monthCounter++;
    const foodSec = state.survivalFundamentals?.foodSecurity ?? 0;
    const pop = state.humanPopulationSystem.population;
    const popRatio = pop / 8.0;

    // Log every month when food security is low, or every 12 months
    if (foodSec < 0.65 || monthCounter % 12 === 0) {
      console.log(`\n[Month ${monthCounter}] Food Security: ${foodSec.toFixed(3)} ${foodSec < 0.6 ? '⚠️  BELOW FAMINE THRESHOLD' : ''}`);
      console.log(`  Population: ${pop.toFixed(3)}B (${(popRatio * 100).toFixed(1)}% of 8B)`);

      // Check active crises
      const activeCrises = [
        state.crises?.phosphorusCrisis?.active ? 'phosphorus' : null,
        state.crises?.freshwaterCrisis?.active ? 'freshwater' : null,
        state.crises?.biodiversityCrisis?.active ? 'biodiversity' : null,
        state.environmentalAccumulation?.tipSurpassed ? 'tipping point' : null,
      ].filter(Boolean);

      if (activeCrises.length > 0) {
        console.log(`  Active crises (${activeCrises.length}): ${activeCrises.join(', ')}`);
      }

      // Check for active famines
      const activeFamines = state.famineSystem?.activeFamines?.length ?? 0;
      if (activeFamines > 0) {
        console.log(`  ✅ Active famines: ${activeFamines}`);
      }

      // Check food stock
      if (state.resourceEconomy?.food) {
        console.log(`  Food stock: ${state.resourceEconomy.food.currentStock.toFixed(1)}`);
      }
    }
  }
};

const result = engine.run(initialState, { maxMonths: 120, checkActualOutcomes: false });

console.log('\n=== DEBUG RUN COMPLETE ===\n');
console.log(`Final month: ${monthCounter}`);
console.log(`Outcome: ${result.finalState.extinctionState.extinct ? 'EXTINCTION' : result.finalState.outcomeState?.type || 'IN PROGRESS'}`);
console.log(`Final food security: ${(result.finalState.survivalFundamentals?.foodSecurity ?? 0).toFixed(3)}`);
console.log(`Final population: ${result.finalState.humanPopulationSystem.population.toFixed(3)}B`);
