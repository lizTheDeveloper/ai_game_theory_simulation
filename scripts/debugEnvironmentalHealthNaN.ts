#!/usr/bin/env tsx
/**
 * Debug script for CRITICAL-1: environmentalHealth NaN crash
 *
 * Traces environmental health calculation through BifurcationLogicPhase
 * to identify which input goes negative/NaN around month 142-146
 *
 * Usage: npx tsx scripts/debugEnvironmentalHealthNaN.ts --seed=28183
 */

import { SimulationEngine, SeededRandom } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

const args = process.argv.slice(2);
const seedArg = args.find(arg => arg.startsWith('--seed='));
const seed = seedArg ? parseInt(seedArg.split('=')[1], 10) : 28183;

console.log(`\n=== Debugging environmentalHealth NaN Crash ===`);
console.log(`Seed: ${seed}`);
console.log(`Expected crash: Month 142-146\n`);

const engine = new SimulationEngine({ seed, maxMonths: 150 });
const seededRandom = new SeededRandom(seed);
const rng = () => seededRandom.next();
let state = createDefaultInitialState(rng);

// Run simulation with detailed logging for environmental metrics
let crashed = false;

try {
  // Add custom logging callback that monitors environmental health
  let lastLogMonth = 0;

  state = engine.run(state, {
    maxMonths: 150,
    onMonthEnd: (monthState) => {
      const month = monthState.currentMonth;

      // Log every month starting from 140
      if (month >= 140 && month !== lastLogMonth) {
        lastLogMonth = month;

        const climateStability = monthState.environmentalAccumulation.climateStability;
        const biodiversityIndex = monthState.environmentalAccumulation.biodiversityIndex;
        const resourceReserves = monthState.environmentalAccumulation.resourceReserves;
        const pollutionLevel = monthState.environmentalAccumulation.pollutionLevel;

        // Calculate what envHealth would be
        const product = climateStability * biodiversityIndex * resourceReserves * (1 - pollutionLevel);
        const envHealth = Math.pow(product, 0.25);

        console.log(`\n📊 Month ${month} Environmental Metrics:`);
        console.log(`  climateStability: ${climateStability.toFixed(4)}`);
        console.log(`  biodiversityIndex: ${biodiversityIndex.toFixed(4)}`);
        console.log(`  resourceReserves: ${resourceReserves.toFixed(4)}`);
        console.log(`  pollutionLevel: ${pollutionLevel.toFixed(4)}`);
        console.log(`  (1 - pollutionLevel): ${(1 - pollutionLevel).toFixed(4)}`);
        console.log(`  product (before ^0.25): ${product.toFixed(6)}`);
        console.log(`  environmentalHealth: ${envHealth.toFixed(4)}`);

        // Check for problematic values
        if (isNaN(climateStability)) console.log(`  ❌ climateStability is NaN`);
        if (isNaN(biodiversityIndex)) console.log(`  ❌ biodiversityIndex is NaN`);
        if (isNaN(resourceReserves)) console.log(`  ❌ resourceReserves is NaN`);
        if (isNaN(pollutionLevel)) console.log(`  ❌ pollutionLevel is NaN`);
        if (climateStability < 0) console.log(`  ⚠️  climateStability is NEGATIVE`);
        if (biodiversityIndex < 0) console.log(`  ⚠️  biodiversityIndex is NEGATIVE`);
        if (resourceReserves < 0) console.log(`  ⚠️  resourceReserves is NEGATIVE`);
        if (pollutionLevel > 1) console.log(`  ⚠️  pollutionLevel > 1.0`);
        if (pollutionLevel < 0) console.log(`  ⚠️  pollutionLevel is NEGATIVE`);
        if (product < 0) console.log(`  ⚠️  product is NEGATIVE (will cause NaN on ^0.25)`);
        if (isNaN(envHealth)) {
          console.log(`  ❌❌❌ environmentalHealth is NaN - THIS IS THE BUG`);
          throw new Error(`environmentalHealth NaN at month ${month}`);
        }
      }
    }
  });
} catch (error: any) {
  console.log(`\n❌ CRASH:`);
  console.log(error.message || error);
  crashed = true;
}

if (!crashed) {
  console.log(`\n✅ Simulation completed without crash (unexpected!)`);
  console.log(`This seed may not reproduce the bug, or the bug is already fixed.`);
} else {
  console.log(`\n💥 Crash reproduced successfully!`);
}
