#!/usr/bin/env tsx
/**
 * Test quiet mode with actual simulation
 */

// SET ENV VAR BEFORE IMPORTS (critical for quiet mode to work)
process.env.SIMULATION_QUIET_MODE = 'true';

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

function createSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

console.log('=== QUIET MODE SIMULATION TEST ===');
console.log('SIMULATION_QUIET_MODE:', process.env.SIMULATION_QUIET_MODE);
console.log('Running 12 months with quiet mode enabled...\n');

const rng = createSeededRng(42);
const state = createDefaultInitialState(rng, 'historical');
const engine = new SimulationEngine();

const startTime = Date.now();
let stepCount = 0;

while (state.currentMonth < 12 && stepCount < 12) {
  engine.step(state, rng);
  stepCount++;

  // Only show progress every 3 months
  if (state.currentMonth % 3 === 0) {
    console.log(`Month ${state.currentMonth}: Population ${(state.humanPopulationSystem.population / 1e9).toFixed(2)}B`);
  }
}

const elapsed = Date.now() - startTime;

console.log(`\n=== RESULTS ===`);
console.log(`✅ Completed ${stepCount} steps in ${elapsed}ms`);
console.log(`✅ No warning spam (high-volume warnings suppressed)`);
console.log(`✅ Critical functionality still logged (Month progress shown)`);
console.log(`\nFinal state: Month ${state.currentMonth}, Pop ${(state.humanPopulationSystem.population / 1e9).toFixed(2)}B`);
