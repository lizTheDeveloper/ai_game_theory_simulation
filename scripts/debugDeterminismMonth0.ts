#!/usr/bin/env tsx
/**
 * Simple determinism debug script
 * Runs TWO simulations with identical seed for Month 0 ONLY
 * Captures full console output to compare action selection
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import * as fs from 'fs';
import * as path from 'path';

const SEED = 42000;
const MAX_MONTHS = 1;  // Just month 0

console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
console.log(`║  DETERMINISM DEBUG: Month 0 AI Action Selection              ║`);
console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

for (let run = 1; run <= 2; run++) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`RUN ${run} (seed=${SEED})`);
  console.log('='.repeat(80));

  const engine = new SimulationEngine({
    seed: SEED,
    maxMonths: MAX_MONTHS,
    logLevel: 'normal'  // Enable logs!
  });

  const initialState = createDefaultInitialState();

  const result = engine.run(initialState, {
    maxMonths: MAX_MONTHS,
    checkActualOutcomes: false
  });

  console.log(`\n✅ Run ${run} completed`);
  if (result && result.finalState) {
    console.log(`Final AI count: ${result.finalState.aiAgents.length}`);
    console.log(`Final total capability: ${result.finalState.aiAgents.reduce((sum, ai) => sum + ai.capability, 0).toFixed(6)}`);
  }
}

console.log(`\n\n${'='.repeat(80)}`);
console.log(`Compare the two runs above - they should be IDENTICAL`);
console.log('='.repeat(80));
