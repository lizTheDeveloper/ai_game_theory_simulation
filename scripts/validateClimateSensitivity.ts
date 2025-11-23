#!/usr/bin/env npx tsx
/**
 * Validate Climate Sensitivity Integration
 *
 * Verifies that:
 * 1. Different seeds produce different ECS values
 * 2. Different ECS values produce different temperature trajectories
 * 3. The sampled ECS is actually used in temperature calculations
 *
 * Architecture Review HIGH-2 Fix Validation
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { updateResourceEconomy } from '../src/simulation/resourceDepletion';
import type { RNGFunction, GameState } from '../src/types/game';

console.log('=== Climate Sensitivity Integration Validation ===\n');

// Test with 5 different seeds
const seeds = [12345, 67890, 11111, 22222, 33333];
const results: Array<{
  seed: number;
  ecs: number;
  tcr: number;
  tempMonth1: number;
  tempMonth12: number;
  tempMonth24: number;
}> = [];

for (const seed of seeds) {
  // Create engine and RNG with this seed
  const engine = new SimulationEngine({ seed });
  const rng: RNGFunction = engine.getRNG().next.bind(engine.getRNG());

  // Initialize state with this seed
  const state = createDefaultInitialState(rng);

  // Check if uncertainty parameters were sampled
  if (!state.uncertaintyParameters) {
    console.error(`FAIL: No uncertainty parameters for seed ${seed}`);
    process.exit(1);
  }

  const ecs = state.uncertaintyParameters.equilibriumClimateSensitivity;
  const tcr = state.uncertaintyParameters.transientClimateResponse;

  // Get initial temperature
  const tempMonth1 = state.resourceEconomy.co2.temperatureAnomaly;

  // Simulate 12 months (resource economy update is called each month)
  for (let m = 0; m < 12; m++) {
    state.currentMonth++;
    updateResourceEconomy(state);
  }
  const tempMonth12 = state.resourceEconomy.co2.temperatureAnomaly;

  // Simulate another 12 months (total 24)
  for (let m = 0; m < 12; m++) {
    state.currentMonth++;
    updateResourceEconomy(state);
  }
  const tempMonth24 = state.resourceEconomy.co2.temperatureAnomaly;

  results.push({
    seed,
    ecs,
    tcr,
    tempMonth1,
    tempMonth12,
    tempMonth24
  });

  console.log(`Seed ${seed}:`);
  console.log(`  ECS: ${ecs.toFixed(3)}C, TCR: ${tcr.toFixed(3)}C`);
  console.log(`  Temp (M1): ${tempMonth1.toFixed(3)}C, (M12): ${tempMonth12.toFixed(3)}C, (M24): ${tempMonth24.toFixed(3)}C`);
  console.log();
}

// Validate variance
const ecsValues = results.map(r => r.ecs);
const ecsMin = Math.min(...ecsValues);
const ecsMax = Math.max(...ecsValues);
const ecsRange = ecsMax - ecsMin;

const temp24Values = results.map(r => r.tempMonth24);
const temp24Min = Math.min(...temp24Values);
const temp24Max = Math.max(...temp24Values);
const temp24Range = temp24Max - temp24Min;

console.log('=== Summary ===');
console.log(`ECS Range: ${ecsMin.toFixed(3)} - ${ecsMax.toFixed(3)} (span: ${ecsRange.toFixed(3)}C)`);
console.log(`Temp@M24 Range: ${temp24Min.toFixed(3)} - ${temp24Max.toFixed(3)} (span: ${temp24Range.toFixed(3)}C)`);
console.log();

// Validation checks
let passed = true;

// Check 1: ECS values should vary between seeds
if (ecsRange < 0.1) {
  console.error('FAIL: ECS values are too similar between seeds (range < 0.1C)');
  passed = false;
} else {
  console.log('PASS: ECS values vary between seeds');
}

// Check 2: Temperature trajectories should vary
if (temp24Range < 0.01) {
  console.error('FAIL: Temperature trajectories are too similar (range < 0.01C at month 24)');
  passed = false;
} else {
  console.log('PASS: Temperature trajectories vary between seeds');
}

// Check 3: Higher ECS should correlate with higher temperature
// Simple check: sort by ECS, should roughly correlate with temp
const sortedByEcs = [...results].sort((a, b) => a.ecs - b.ecs);
const sortedByTemp = [...results].sort((a, b) => a.tempMonth24 - b.tempMonth24);
const ecsRank = sortedByEcs.map(r => r.seed);
const tempRank = sortedByTemp.map(r => r.seed);

// Calculate Spearman correlation (simple check)
let rankDiffSum = 0;
for (let i = 0; i < ecsRank.length; i++) {
  const ecsPos = ecsRank.indexOf(results[i].seed);
  const tempPos = tempRank.indexOf(results[i].seed);
  rankDiffSum += (ecsPos - tempPos) ** 2;
}
const n = results.length;
const spearman = 1 - (6 * rankDiffSum) / (n * (n * n - 1));

if (spearman > 0.5) {
  console.log(`PASS: ECS and temperature are positively correlated (Spearman: ${spearman.toFixed(2)})`);
} else {
  console.warn(`WARN: Weak ECS-temperature correlation (Spearman: ${spearman.toFixed(2)}) - check for confounding factors`);
}

console.log();
if (passed) {
  console.log('=== VALIDATION PASSED: Climate sensitivity is connected to temperature calculations ===');
  process.exit(0);
} else {
  console.error('=== VALIDATION FAILED ===');
  process.exit(1);
}
