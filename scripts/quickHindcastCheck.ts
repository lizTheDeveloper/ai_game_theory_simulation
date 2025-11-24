#!/usr/bin/env tsx
/**
 * Quick hindcast check - 12 months with verbose logging
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { HISTORICAL_BASELINES, type RNGFunction } from '../src/types/config';

const START_YEAR = 1990;
const SEED = 42;

console.log('='.repeat(80));
console.log('QUICK HINDCAST CHECK (12 months)');
console.log('='.repeat(80));

// Create simulation engine
const engine = new SimulationEngine({ seed: SEED });
const rng: RNGFunction = engine.getRNG().next.bind(engine.getRNG());

// Get historical overrides
const historicalOverrides = HISTORICAL_BASELINES[START_YEAR];

// Create initial state
const state = createDefaultInitialState(
  rng,
  'historical',
  undefined,
  undefined,
  undefined,
  undefined,
  historicalOverrides
);

console.log(`\nInitial state:`);
console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
console.log(`  Temperature: ${state.resourceEconomy.co2.temperatureAnomaly.toFixed(2)}C`);
console.log(`  CO2: ${state.resourceEconomy.co2.atmosphericCO2.toFixed(1)} ppm`);
console.log(`  Cumulative deaths: ${state.humanPopulationSystem.cumulativeCrisisDeaths.toFixed(2)}M`);

// Run 12 months
for (let month = 0; month < 12; month++) {
  const prevPop = state.humanPopulationSystem.population;
  const prevCumulativeDeaths = state.humanPopulationSystem.cumulativeCrisisDeaths;

  engine.step(state);

  const newPop = state.humanPopulationSystem.population;
  const newCumulativeDeaths = state.humanPopulationSystem.cumulativeCrisisDeaths;
  const monthlyDeaths = state.humanPopulationSystem.monthlyExcessDeaths || 0;
  const popChange = newPop - prevPop;
  const deathsAdded = newCumulativeDeaths - prevCumulativeDeaths;

  console.log(`\n--- Month ${month + 1} ---`);
  console.log(`  Population: ${prevPop.toFixed(3)}B → ${newPop.toFixed(3)}B (${popChange >= 0 ? '+' : ''}${(popChange * 1000).toFixed(1)}M)`);
  console.log(`  Deaths this month (field): ${monthlyDeaths.toFixed(2)}M`);
  console.log(`  Cumulative deaths: ${prevCumulativeDeaths.toFixed(2)}M → ${newCumulativeDeaths.toFixed(2)}M (+${deathsAdded.toFixed(2)}M)`);
  console.log(`  Temperature: ${state.resourceEconomy.co2.temperatureAnomaly.toFixed(2)}C`);
  console.log(`  Climate stability: ${(state.environmentalAccumulation.climateStability * 100).toFixed(1)}%`);
  console.log(`  Food security: ${(state.qualityOfLifeSystems.survivalFundamentals.foodSecurity * 100).toFixed(1)}%`);

  // Expected: Net growth ~1.4%/year = 0.12%/month = ~6.4M/month births - 4M/month deaths = +2.4M/month
  const expectedNetGrowth = 5.3 * 0.014 / 12; // 1.4%/year = 0.006B/month
  console.log(`  Expected net growth: ~${(expectedNetGrowth * 1000).toFixed(1)}M/month`);
}

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Final population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
console.log(`Expected: ~5.31B (growth from 5.30B)`);
console.log(`Cumulative deaths: ${state.humanPopulationSystem.cumulativeCrisisDeaths.toFixed(2)}M`);
console.log(`Expected: ~48M (4M/month × 12)`);
