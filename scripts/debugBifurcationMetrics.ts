#!/usr/bin/env npx tsx

/**
 * Debug bifurcation avgDistanceToThresholds calculation
 *
 * Tracks the rolling average to understand why it's reporting 0.0% when actual distances are 0.3-0.4
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { BifurcationLogicPhase } from '../src/simulation/engine/phases/BifurcationLogicPhase';
import { getPhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';

// Create seeded RNG for determinism
function createTestRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 0x100000000;
    return state / 0x100000000;
  };
}

const SEED = 42000;
const MAX_MONTHS = 12;

const rng = createTestRng(SEED);
const state = createDefaultInitialState(rng);
const orchestrator = getPhaseOrchestrator();

console.log('=== BIFURCATION METRICS TRACKING ===\n');

console.log('MONTH 0 (Initialization):');
console.log(`  avgDistanceToThresholds: ${state.bifurcationState.metrics?.avgDistanceToThresholds.toFixed(6)}`);
console.log(`  distanceToNearestThreshold: ${state.bifurcationState.distanceToNearestThreshold.toFixed(6)}`);
console.log(`  currentRegime: ${state.bifurcationState.currentRegime}`);

for (let month = 1; month <= MAX_MONTHS; month++) {
  state.currentMonth = month;
  orchestrator.executeStep(state, rng);

  const metrics = state.bifurcationState.metrics;
  const distance = state.bifurcationState.distanceToNearestThreshold;
  const avgDistance = metrics?.avgDistanceToThresholds ?? 0;
  const amplification = state.bifurcationState.varianceAmplification;

  console.log(`\nMONTH ${month}:`);
  console.log(`  Current distance: ${distance.toFixed(6)}`);
  console.log(`  Rolling avg distance: ${avgDistance.toFixed(6)}`);
  console.log(`  Expected next avg: ${(avgDistance * 0.95 + distance * 0.05).toFixed(6)} (formula: prev*0.95 + curr*0.05)`);
  console.log(`  Variance amplification: ${amplification.toFixed(2)}×`);
  console.log(`  Current regime: ${state.bifurcationState.currentRegime}`);

  if (month <= 3) {
    // Show environmental health calculation for first 3 months
    const env = state.environmentalAccumulation;
    const product = env.climateStability * env.biodiversityIndex * env.resourceReserves * (1 - env.pollutionLevel);
    const envHealth = Math.pow(product, 0.25);
    console.log(`  Environmental health: ${envHealth.toFixed(4)} (from climate=${env.climateStability.toFixed(3)}, bio=${env.biodiversityIndex.toFixed(3)}, res=${env.resourceReserves.toFixed(3)}, poll=${env.pollutionLevel.toFixed(3)})`);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Final avgDistanceToThresholds: ${state.bifurcationState.metrics?.avgDistanceToThresholds.toFixed(6)}`);
console.log(`Final distanceToNearestThreshold: ${state.bifurcationState.distanceToNearestThreshold.toFixed(6)}`);
console.log(`\nConclusion: The rolling average formula (prev*0.95 + curr*0.05) takes ~100 months to converge from 1.0 to actual values.`);
console.log(`If the simulation reports 0.0% distance, either:`);
console.log(`  1. The actual distance IS near-zero (environmental collapse happening)`);
console.log(`  2. The rolling average hasn't converged yet (simulation too short)`);
console.log(`  3. There's a bug in distance calculation producing zeros`);
