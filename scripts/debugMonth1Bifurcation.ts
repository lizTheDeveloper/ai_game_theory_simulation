#!/usr/bin/env npx tsx

/**
 * Debug script for Month 1 environmental bifurcation investigation
 *
 * Runs simulation for first 3 months with seed 42000 to see actual environmental health values
 * and identify what triggers the collapse.
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';
import { mulberry32 } from '../src/simulation/utils/math';

const SEED = 42000;
const MAX_MONTHS = 3;

console.log(`\n=== MONTH 1 ENVIRONMENTAL BIFURCATION DEBUG ===`);
console.log(`Seed: ${SEED}`);
console.log(`Max months: ${MAX_MONTHS}\n`);

// Create initial state
const rng = mulberry32(SEED);
const state = createDefaultInitialState(rng, undefined, 'historical');
const orchestrator = new PhaseOrchestrator();

console.log(`\n=== INITIAL STATE (Month 0) ===`);
console.log(`Environmental Accumulation:`);
console.log(`  climateStability: ${state.environmentalAccumulation.climateStability.toFixed(4)}`);
console.log(`  biodiversityIndex: ${state.environmentalAccumulation.biodiversityIndex.toFixed(4)}`);
console.log(`  resourceReserves: ${state.environmentalAccumulation.resourceReserves.toFixed(4)}`);
console.log(`  pollutionLevel: ${state.environmentalAccumulation.pollutionLevel.toFixed(4)}`);

// Calculate environmental health
const climateStability = state.environmentalAccumulation.climateStability;
const biodiversityIndex = state.environmentalAccumulation.biodiversityIndex;
const resourceReserves = state.environmentalAccumulation.resourceReserves;
const pollutionLevel = state.environmentalAccumulation.pollutionLevel;

const envHealthProduct = climateStability * biodiversityIndex * resourceReserves * (1 - pollutionLevel);
const envHealth = Math.pow(envHealthProduct, 0.25);

console.log(`\nCalculated Environmental Health:`);
console.log(`  Product: ${envHealthProduct.toFixed(6)}`);
console.log(`  envHealth = (product)^0.25 = ${envHealth.toFixed(4)}`);

// Get bifurcation threshold
const bifState = state.bifurcationState;
if (bifState) {
  console.log(`\nBifurcation State:`);
  console.log(`  Environmental collapse threshold: ${bifState.environmentalCollapseThreshold.location.toFixed(4)}`);
  console.log(`  Distance to threshold: ${Math.max(0, envHealth - bifState.environmentalCollapseThreshold.location).toFixed(4)}`);
  console.log(`  Current regime: ${bifState.currentRegime}`);
  console.log(`  Variance amplification: ${bifState.varianceAmplification.toFixed(2)}×`);
}

// Run simulation for a few months
for (let month = 1; month <= MAX_MONTHS; month++) {
  console.log(`\n=== SIMULATING MONTH ${month} ===`);

  try {
    const result = orchestrator.executeAll(state, rng);

    console.log(`Simulation successful. Key metrics:`);
    console.log(`  climateStability: ${state.environmentalAccumulation.climateStability.toFixed(4)}`);
    console.log(`  biodiversityIndex: ${state.environmentalAccumulation.biodiversityIndex.toFixed(4)}`);
    console.log(`  resourceReserves: ${state.environmentalAccumulation.resourceReserves.toFixed(4)}`);
    console.log(`  pollutionLevel: ${state.environmentalAccumulation.pollutionLevel.toFixed(4)}`);

    // Recalculate environmental health
    const cs = state.environmentalAccumulation.climateStability;
    const bi = state.environmentalAccumulation.biodiversityIndex;
    const rr = state.environmentalAccumulation.resourceReserves;
    const pl = state.environmentalAccumulation.pollutionLevel;

    const product = cs * bi * rr * (1 - pl);
    const health = Math.pow(product, 0.25);

    console.log(`  Environmental health: ${health.toFixed(4)}`);
    console.log(`  Threshold: ${bifState?.environmentalCollapseThreshold.location.toFixed(4)}`);
    console.log(`  Distance: ${Math.max(0, health - (bifState?.environmentalCollapseThreshold.location || 0)).toFixed(4)}`);

    if (bifState) {
      console.log(`  Regime: ${bifState.currentRegime}`);
      console.log(`  Variance amplification: ${bifState.varianceAmplification.toFixed(2)}×`);
    }

    // Check for dystopia outcome
    if (state.outcomes.dystopiaProgression.isActive) {
      console.log(`\n⚠️ DYSTOPIA ACTIVE at Month ${month}!`);
      console.log(`  Stage: ${state.outcomes.dystopiaProgression.stage}`);
      console.log(`  Severity: ${state.outcomes.dystopiaProgression.severity.toFixed(2)}`);
      console.log(`  Irreversibility: ${state.outcomes.dystopiaProgression.irreversibility.toFixed(2)}`);
    }

  } catch (error: unknown) {
    const err = error as Error;
    console.error(`\n❌ ERROR at Month ${month}:`);
    console.error(err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    break;
  }
}

console.log(`\n=== DEBUG COMPLETE ===\n`);
