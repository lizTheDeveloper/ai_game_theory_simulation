#!/usr/bin/env tsx
/**
 * Quick test of 1990 vs 2025 regional population initialization
 */
import { createDefaultInitialState } from '../src/simulation/initialization';
import seedrandom from 'seedrandom';

const rng = seedrandom('test-1990');

// Test 1990 initialization
const state1990 = createDefaultInitialState(
  rng,
  'historical',
  undefined, undefined, undefined, undefined,
  {
    startYear: 1990,
    co2Ppm: 354,
    temperatureAnomalyC: 0.45,
    globalPopulationBillions: 5.327,
    emissionsGtCO2PerYear: 22.6
  }
);

console.log('\n=== 1990 INITIALIZATION TEST ===');
console.log(`Year: ${state1990.currentYear}`);
console.log(`Global population: ${state1990.humanPopulationSystem.population.toFixed(3)}B`);
console.log(`\nRegional Populations (millions):`);

let total = 0;
for (const region of state1990.humanPopulationSystem.regionalPopulations) {
  console.log(`  ${region.name}: ${region.population.toFixed(0)}M`);
  total += region.population;
}

console.log(`\nTotal regional: ${(total / 1000).toFixed(3)}B`);
console.log(`Expected (UN): 5.327B`);
console.log(`Deviation: ${((total / 1000 - 5.327) / 5.327 * 100).toFixed(2)}%`);

// Test 2025 initialization (default)
const rng2025 = seedrandom('test-2025');
const state2025 = createDefaultInitialState(rng2025);

console.log(`\n=== 2025 INITIALIZATION TEST ===`);
console.log(`Year: ${state2025.currentYear}`);
console.log(`Global population: ${state2025.humanPopulationSystem.population.toFixed(3)}B`);

let total2025 = 0;
for (const region of state2025.humanPopulationSystem.regionalPopulations) {
  total2025 += region.population;
}

console.log(`Total regional: ${(total2025 / 1000).toFixed(3)}B`);
console.log(`Expected (UN): 8.136B`);
console.log(`Deviation: ${((total2025 / 1000 - 8.136) / 8.136 * 100).toFixed(2)}%`);
