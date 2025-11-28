#!/usr/bin/env tsx
/**
 * HIGH-7 Fix Validation Script (Nov 28, 2025)
 *
 * Tests that CoordinatedDeploymentPhase historical mode guard fixes -76% population error.
 *
 * Before fix:
 * - Population 1990: 5.32B → 2024: ~2.0B (mean across runs)
 * - Absolute error: -6.1B (-76%)
 *
 * After fix:
 * - Population should grow: 5.32B → 8.12B (+52.8%)
 * - Target: Within ±10% of 8.12B (7.31B to 8.93B acceptable)
 *
 * Usage:
 *   npx tsx scripts/validateHIGH7Fix.ts
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createHistoricalInitialState } from '../src/simulation/historicalInitialization';

// Seed RNG for reproducibility
function createSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

async function main() {
  console.log('=== HIGH-7 Fix Validation ===\n');
  console.log('Testing CoordinatedDeploymentPhase historical mode guard...\n');

  const seed = 19900102;
  const rng = createSeededRng(seed);

  // Create 1990 historical state
  const state = await createHistoricalInitialState({
    year: 1990,
    rng,
    includeAIAgents: false,
    scenarioMode: 'historical'
  });

  console.log(`Initial state (1990):`);
  console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
  console.log(`  Year: ${state.currentYear}`);
  console.log(`  Historical mode: ${state.config.historicalMode}`);
  console.log(`  AI agents: ${state.aiAgents.length}\n`);

  // Run simulation to 2024 (34 years = 408 months)
  const engine = new SimulationEngine(state);
  const maxMonths = 34 * 12; // 1990 → 2024
  let month = 0;

  console.log('Running simulation 1990 → 2024...\n');

  // Track population every 5 years
  const checkpoints = [0, 60, 120, 180, 240, 300, 360, 408]; // 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024

  for (month = 0; month < maxMonths; month++) {
    try {
      engine.step(rng);
    } catch (error) {
      console.error(`\n❌ Simulation crashed at month ${month}:`);
      console.error(error);
      process.exit(1);
    }

    // Log checkpoints
    if (checkpoints.includes(month)) {
      const year = 1990 + Math.floor(month / 12);
      const pop = engine.state.humanPopulationSystem.population;
      console.log(`  ${year}: ${pop.toFixed(3)}B`);
    }
  }

  // Final validation
  const finalPop = engine.state.humanPopulationSystem.population;
  const finalYear = engine.state.currentYear;
  const expectedPop = 8.12; // UN DESA 2024
  const error = ((finalPop - expectedPop) / expectedPop) * 100;

  console.log(`\n=== Results ===`);
  console.log(`Final year: ${finalYear}`);
  console.log(`Final population: ${finalPop.toFixed(3)}B`);
  console.log(`Expected population: ${expectedPop.toFixed(2)}B`);
  console.log(`Absolute error: ${(finalPop - expectedPop).toFixed(2)}B (${error.toFixed(1)}%)`);

  // Acceptance criteria: Within ±10% of 8.12B
  const minAcceptable = 7.31;
  const maxAcceptable = 8.93;

  if (finalPop >= minAcceptable && finalPop <= maxAcceptable) {
    console.log(`\n✅ PASS: Population within acceptable range (${minAcceptable}B - ${maxAcceptable}B)`);
    process.exit(0);
  } else {
    console.log(`\n❌ FAIL: Population outside acceptable range (${minAcceptable}B - ${maxAcceptable}B)`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
