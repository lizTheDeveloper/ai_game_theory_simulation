#!/usr/bin/env tsx
/**
 * Quick test - single threshold value, single run
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState, ParameterSweepConfig } from '../src/simulation/initialization';

function createSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

async function main() {
  console.log('Testing single simulation with threshold = 0.10');
  
  const parameterSweepConfig: ParameterSweepConfig = {
    bifurcationThreshold: 0.10
  };
  
  const rng = createSeededRng(42);
  
  const state = createDefaultInitialState(
    rng,
    'historical',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    parameterSweepConfig
  );
  
  const engine = new SimulationEngine();
  const initialPop = state.humanPopulationSystem.population;
  
  console.log(`Initial population: ${initialPop.toFixed(2)}B`);
  console.log(`Starting simulation for 120 months...`);
  
  let month = 0;
  while (state.currentMonth < 120) {
    engine.step(state, rng);
    month++;
    if (month % 12 === 0) {
      console.log(`  Year ${month/12}: Pop=${(state.humanPopulationSystem.population).toFixed(2)}B`);
    }
  }
  
  const finalPop = state.humanPopulationSystem.population;
  const mortality = 1 - (finalPop / initialPop);
  
  console.log(`\nFinal population: ${finalPop.toFixed(2)}B`);
  console.log(`Mortality rate: ${(mortality * 100).toFixed(1)}%`);
  console.log(`✅ Test complete`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
