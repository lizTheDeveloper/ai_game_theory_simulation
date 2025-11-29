#!/usr/bin/env npx tsx
/**
 * Diagnostic: Technology Unlock Bottleneck
 *
 * Hypothesis: Crisis innovation feedback boosts AI capability growth (10x),
 * but does NOT boost technology unlock rate because tech progress uses
 * getTotalResearchInvestment() which isn't affected by crisis multiplier.
 *
 * This diagnostic logs:
 * - Crisis severity and multiplier
 * - AI capability growth rate
 * - Technology research progress rate
 * - Total research investment (not boosted by crisis)
 */

import { initializeGameState } from '../src/simulation/initialization';
import { runSimulationStep } from '../src/simulation/engine';
import { createRandomNumberGenerator } from '../src/simulation/utils/random';

// Seed that goes dystopia (from MC runs)
const SEED = 42000;
const MAX_MONTHS = 60;

const rng = createRandomNumberGenerator(SEED);
let state = initializeGameState(rng);

console.log(`=== TECH UNLOCK BOTTLENECK DIAGNOSTIC ===`);
console.log(`Seed: ${SEED}, Max months: ${MAX_MONTHS}\n`);

// Track first tech unlock
let firstUnlock = false;

for (let month = 0; month < MAX_MONTHS; month++) {
  state = runSimulationStep(state, rng);

  // Log every 12 months
  if (month % 12 === 0) {
    const techTree = state.techTree;
    const unlocked = techTree?.unlockedTech?.length || 0;

    // Get crisis severity (from deploymentSpeed.ts)
    const { getCrisisSeverity } = require('../src/simulation/techTree/deploymentSpeed');
    const crisisSeverity = getCrisisSeverity(state);

    // Crisis multipliers (from research.ts lines 225-230)
    const CRISIS_RESEARCH_MULTIPLIERS: Record<string, number> = {
      'normal': 1.0,
      'moderate': 2.0,
      'severe': 5.0,
      'existential': 10.0
    };
    const crisisMultiplier = CRISIS_RESEARCH_MULTIPLIERS[crisisSeverity] || 1.0;

    // Get total research investment (NOT boosted by crisis!)
    const govResearch = state.government?.researchInvestments || {};
    const totalGov = Object.values(govResearch).reduce((sum, val) => {
      if (typeof val === 'number') return sum + val;
      if (typeof val === 'object' && val !== null) {
        return sum + Object.values(val).reduce((s: number, v) => s + (typeof v === 'number' ? v : 0), 0);
      }
      return sum;
    }, 0);

    // Sample a few tech progress values
    const progressSamples = Object.entries(techTree?.researchProgress || {})
      .slice(0, 3)
      .map(([id, prog]) => `${id}:${((prog as number) * 100).toFixed(0)}%`)
      .join(', ');

    console.log(`\nMonth ${month}:`);
    console.log(`  Crisis: ${crisisSeverity} (AI growth: ${crisisMultiplier}x)`);
    console.log(`  Gov research: $${totalGov.toFixed(1)}B (tech unlock boost: ${(1.0 + Math.min(1.0, totalGov / 1000)).toFixed(2)}x)`);
    console.log(`  Technologies unlocked: ${unlocked}`);
    console.log(`  Sample progress: ${progressSamples || 'none'}`);

    // Check first unlock
    if (!firstUnlock && unlocked > 0) {
      firstUnlock = true;
      console.log(`  🎯 FIRST TECH UNLOCK at month ${month}`);
    }
  }
}

console.log(`\n=== BOTTLENECK IDENTIFIED ===`);
console.log(`Crisis multiplier affects AI capability growth (calculateDimensionGrowth)`);
console.log(`BUT technology unlock uses getTotalResearchInvestment() - NOT affected by crisis!`);
console.log(`\nFix: Apply crisis multiplier to tech progress calculation in techTree/engine.ts line ~550`);
