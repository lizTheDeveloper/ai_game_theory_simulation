#!/usr/bin/env tsx
/**
 * Debug hindcast population collapse
 *
 * Investigates why population drops -42% from 1990-2020
 * when historical data shows +46% growth (5.3B → 7.8B)
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import seedrandom from 'seedrandom';

const rng = seedrandom('debug-42');

// Suppress verbose simulation output
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;
console.log = () => {};
console.warn = () => {};
console.error = () => {};

const state = createDefaultInitialState(
  rng,
  'historical',
  undefined, undefined, undefined, undefined,
  {
    startYear: 1990,
    co2Ppm: 354,
    temperatureAnomalyC: 0.45,
    globalPopulationBillions: 5.327,
    emissionsGtCO2PerYear: 22.6,
    environmental: {
      arcticIceLoss: 0.05,
      permafrostThaw: 0.02,
      amazonDieback: 0.01,
      sinkSaturation: 0.15
    },
    planetaryBoundaries: {
      climateChange: 0.35,
      biosphereIntegrity: 0.85,
      biogeochemicalFlows: 0.65,
      landSystemChange: 0.55,
      freshwaterChange: 0.45,
      novelEntities: 0.35,
      oceanAcidification: 0.25,
      stratosphericOzone: 0.95,
      atmosphericAerosols: 0.50
    }
  }
);

const engine = new SimulationEngine({ seed: 42 });

// Re-enable console for debug output
console.log = originalLog;
console.warn = originalWarn;
console.error = originalError;

console.log(`\n🔍 HINDCAST POPULATION DEBUG (1990-2020)\n`);
console.log(`Initial state (1990):`);
console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
console.log(`  Baseline birth rate: ${(state.humanPopulationSystem.baselineBirthRate * 1000).toFixed(2)} per 1000/month`);
console.log(`  Baseline death rate: ${(state.humanPopulationSystem.baselineDeathRate * 1000).toFixed(2)} per 1000/month`);
console.log(`  Adjusted birth rate: ${(state.humanPopulationSystem.adjustedBirthRate * 1000).toFixed(2)} per 1000/month`);
console.log(`  Adjusted death rate: ${(state.humanPopulationSystem.adjustedDeathRate * 1000).toFixed(2)} per 1000/month`);
console.log(`  Net growth: ${((state.humanPopulationSystem.adjustedBirthRate - state.humanPopulationSystem.adjustedDeathRate) * 100).toFixed(3)}% per month`);
console.log(`\n`);

// Suppress simulation output again
console.log = () => {};
console.warn = () => {};
console.error = () => {};

// Run 60 months (5 years)
for (let i = 0; i < 60; i++) {
  engine.step(state);

  // Re-enable for checkpoint logging
  if (i % 12 === 11) { // Every year
    console.log = originalLog;
    const year = state.currentYear;
    const pop = state.humanPopulationSystem.population;
    const birth = state.humanPopulationSystem.adjustedBirthRate;
    const death = state.humanPopulationSystem.adjustedDeathRate;
    const growth = ((birth - death) * 100);

    console.log(`${year}: Pop=${pop.toFixed(3)}B, Birth=${(birth*1000).toFixed(2)}/1k/mo, Death=${(death*1000).toFixed(2)}/1k/mo, Growth=${growth.toFixed(3)}%/mo`);
    console.log = () => {};
  }
}

// Final output
console.log = originalLog;
console.log(`\nFinal state (${state.currentYear}):`);
console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
console.log(`  Adjusted birth rate: ${(state.humanPopulationSystem.adjustedBirthRate * 1000).toFixed(2)} per 1000/month`);
console.log(`  Adjusted death rate: ${(state.humanPopulationSystem.adjustedDeathRate * 1000).toFixed(2)} per 1000/month`);
console.log(`  Net growth rate: ${(state.humanPopulationSystem.netGrowthRate * 100).toFixed(3)}%/year`);
console.log(`  5-year change: ${((state.humanPopulationSystem.population / 5.258 - 1) * 100).toFixed(1)}%`);
console.log(`  Expected (1990-1995 historical): +8.3% (5.327B → 5.744B)`);
console.log(`\n`);
