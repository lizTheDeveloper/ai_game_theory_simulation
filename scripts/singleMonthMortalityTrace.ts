#!/usr/bin/env tsx
/**
 * Single month mortality trace - shows exactly what's adding mortality risks
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { HISTORICAL_BASELINES, type RNGFunction } from '../src/types/config';
import { getMortalityRisks } from '../src/simulation/bayesianMortality';

const START_YEAR = 1990;
const SEED = 42;

console.log('='.repeat(80));
console.log('SINGLE MONTH MORTALITY TRACE');
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
console.log(`  scenarioMode: ${state.config.scenarioMode}`);

// Check mortality risks before step
const risksBefore = getMortalityRisks(state.humanPopulationSystem as any);
console.log(`\nMortality risks BEFORE first step: ${risksBefore.length}`);

// Run ONE step
console.log('\n' + '='.repeat(80));
console.log('RUNNING FIRST STEP...');
console.log('='.repeat(80));

engine.step(state);

// Check mortality risks after (should be empty after resolution)
const risksAfter = getMortalityRisks(state.humanPopulationSystem as any);
console.log(`\nMortality risks AFTER first step: ${risksAfter.length}`);

// Check final population
const popChange = state.humanPopulationSystem.population - 5.300;
const deathsThisMonth = state.humanPopulationSystem.monthlyExcessDeaths || 0;
const cumulativeDeaths = state.humanPopulationSystem.cumulativeCrisisDeaths;

console.log('\n' + '='.repeat(80));
console.log('RESULTS');
console.log('='.repeat(80));
console.log(`Population change: ${(popChange * 1000).toFixed(1)}M (${popChange >= 0 ? '+' : ''}${((popChange / 5.300) * 100).toFixed(2)}%)`);
console.log(`Monthly excess deaths: ${deathsThisMonth.toFixed(2)}M`);
console.log(`Cumulative deaths: ${cumulativeDeaths.toFixed(2)}M`);
console.log(`Temperature: ${state.resourceEconomy.co2.temperatureAnomaly.toFixed(2)}C`);
console.log(`Food security: ${(state.qualityOfLifeSystems.survivalFundamentals.foodSecurity * 100).toFixed(1)}%`);

// Calculate regional death totals
let regionalDeathsSum = 0;
if (state.humanPopulationSystem.regionalPopulations) {
  for (const region of state.humanPopulationSystem.regionalPopulations) {
    regionalDeathsSum += region.cumulativeCrisisDeaths || 0;
  }
}

console.log(`\nRegional cumulative deaths sum: ${regionalDeathsSum.toFixed(2)}M`);
console.log(`Global cumulative deaths: ${cumulativeDeaths.toFixed(2)}M`);
console.log(`Ratio (should be ~1.0): ${(cumulativeDeaths / Math.max(regionalDeathsSum, 0.001)).toFixed(2)}x`);

console.log('\n' + '='.repeat(80));
console.log('EXPECTED for 1990:');
console.log('='.repeat(80));
console.log(`  Births: ~129M/year = 10.75M/month`);
console.log(`  Deaths: ~49M/year = 4.08M/month`);
console.log(`  Net growth: ~80M/year = 6.67M/month`);
console.log(`  Population: 5.300B → 5.307B (+6.67M)`);
