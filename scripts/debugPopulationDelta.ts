/**
 * Debug script to trace population delta through a single month
 *
 * Creates hindcast state at 1990, runs ONE month, logs every population change
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';
import seedrandom from 'seedrandom';

async function main() {
  console.log('=== POPULATION DELTA DEBUG (1 month trace) ===\n');

  const rng = seedrandom('debug-delta');

  // Initialize to 1990 with historical mode
  const state = createDefaultInitialState(
    rng,
    'historical',
    undefined, undefined, undefined, undefined,
    {
      startYear: 1990,
      co2Ppm: 354,
      temperatureAnomalyC: 0.45,
      populationBillions: 5.258,
      emissionsGtCO2PerYear: 22.6  // 1990 emissions
    }
  );

  console.log(`Initial state (1990):
  Population: ${state.humanPopulationSystem.population.toFixed(3)}B
  Regional total: ${(state.humanPopulationSystem.regionalPopulations.reduce((sum, r) => sum + r.population, 0) / 1000).toFixed(3)}B
  Scenario mode: ${state.config.scenarioMode}
  Current year: ${state.currentYear}
`);

  // RNG already created above

  // Create phase orchestrator
  const orchestrator = new PhaseOrchestrator();

  // Hook into population changes
  const originalPop = state.humanPopulationSystem.population;

  // Proxy to track writes
  const popProxy = new Proxy(state.humanPopulationSystem, {
    set(target, property, value) {
      if (property === 'population') {
        const delta = value - target.population;
        const pctChange = ((delta / target.population) * 100).toFixed(4);
        console.log(`  📊 POPULATION CHANGE: ${target.population.toFixed(6)}B → ${value.toFixed(6)}B (${delta > 0 ? '+' : ''}${delta.toFixed(6)}B, ${pctChange}%)`);
        console.trace('  Stack trace:');
      }
      target[property] = value;
      return true;
    }
  });

  state.humanPopulationSystem = popProxy;

  console.log('\n=== RUNNING MONTH 1 (1990-01) ===\n');

  // Run one month
  orchestrator.runMonth(state, rng);

  console.log(`\n=== FINAL STATE ===
  Population: ${state.humanPopulationSystem.population.toFixed(3)}B
  Regional total: ${(state.humanPopulationSystem.regionalPopulations.reduce((sum, r) => sum + r.population, 0) / 1000).toFixed(3)}B
  Delta: ${(state.humanPopulationSystem.population - originalPop).toFixed(6)}B
  Birth rate: ${(state.humanPopulationSystem.adjustedBirthRate * 100).toFixed(2)}% annual
  Death rate: ${(state.humanPopulationSystem.adjustedDeathRate * 100).toFixed(2)}% annual
  Net growth: ${(state.humanPopulationSystem.netGrowthRate * 100).toFixed(2)}% annual
`);

  console.log('\nRegional populations:');
  for (const region of state.humanPopulationSystem.regionalPopulations) {
    console.log(`  ${region.name}: ${region.population.toFixed(1)}M`);
  }
}

main().catch(console.error);
