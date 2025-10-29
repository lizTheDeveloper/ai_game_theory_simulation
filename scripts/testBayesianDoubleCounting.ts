/**
 * Test script to diagnose double-counting bug in Bayesian mortality system
 *
 * Expected behavior:
 * - resolveMortality() applies deaths once to population
 * - cumulativeCrisisDeaths should equal sum of deathsByCategory
 *
 * Actual behavior (BUG):
 * - Deaths counted twice: once in cumulativeCrisisDeaths, once in deathsByCategory
 * - Causes 45B deaths from 8B population
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { addMortalityRisk, resolveMortality } from '../src/simulation/bayesianMortality';

console.log('\n=== Bayesian Mortality Double-Counting Test ===\n');

// Initialize game state
const state = createDefaultInitialState();
const rng = () => 0.5; // Simple deterministic RNG for testing

const initialPopulation = state.humanPopulationSystem.population;
console.log(`Initial population: ${initialPopulation.toFixed(3)}B`);
console.log(`Initial cumulative deaths: ${state.humanPopulationSystem.cumulativeCrisisDeaths.toFixed(1)}M`);
console.log(`Initial deathsByCategory.famine: ${state.humanPopulationSystem.deathsByCategory.famine.toFixed(1)}M\n`);

// Add a single mortality risk: 1% famine risk globally
console.log('Adding 1% famine mortality risk (global scope)...\n');
addMortalityRisk(state.humanPopulationSystem, {
  type: 'famine',
  baseRisk: 0.01,  // 1% base risk
  proximate: 'famine',
  root: 'ecosystem',
  description: 'Test famine',
  confidence: 'HIGH',
  scope: 'GLOBAL',
  month: 1
});

// Resolve mortality
console.log('Resolving mortality...\n');
const result = resolveMortality(state, rng);

// Check results
const pop = state.humanPopulationSystem;
console.log('=== RESULTS ===\n');
console.log(`Population after: ${pop.population.toFixed(3)}B`);
console.log(`Deaths applied (from result): ${result.totalDeaths.toFixed(1)}M`);
console.log(`Population lost: ${(initialPopulation - pop.population).toFixed(3)}B = ${((initialPopulation - pop.population) * 1000).toFixed(1)}M\n`);

console.log(`cumulativeCrisisDeaths: ${pop.cumulativeCrisisDeaths.toFixed(1)}M`);
console.log(`deathsByCategory.famine: ${pop.deathsByCategory.famine.toFixed(1)}M\n`);

// Calculate sum of deathsByCategory
const categorySum = Object.values(pop.deathsByCategory)
  .reduce((sum: number, val) => sum + (typeof val === 'number' ? val : 0), 0);

console.log(`Sum of deathsByCategory: ${categorySum.toFixed(1)}M`);
console.log(`Difference: ${(pop.cumulativeCrisisDeaths - categorySum).toFixed(1)}M\n`);

// DIAGNOSIS
if (Math.abs(pop.cumulativeCrisisDeaths - categorySum) < 0.01) {
  console.log('✅ PASS: cumulativeCrisisDeaths equals sum of categories (no double-counting)');
} else {
  console.log('❌ FAIL: cumulativeCrisisDeaths does NOT equal sum of categories (DOUBLE-COUNTING BUG!)');
  console.log(`   Expected: ${categorySum.toFixed(1)}M`);
  console.log(`   Actual: ${pop.cumulativeCrisisDeaths.toFixed(1)}M`);
  console.log(`   Ratio: ${(pop.cumulativeCrisisDeaths / categorySum).toFixed(2)}x`);
}

// Check if population change matches reported deaths
const populationLostMillions = (initialPopulation - pop.population) * 1000;
if (Math.abs(populationLostMillions - result.totalDeaths) < 0.1) {
  console.log('✅ PASS: Population change matches reported deaths');
} else {
  console.log('❌ FAIL: Population change does NOT match reported deaths');
  console.log(`   Population lost: ${populationLostMillions.toFixed(1)}M`);
  console.log(`   Reported deaths: ${result.totalDeaths.toFixed(1)}M`);
}
