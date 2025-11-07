#!/usr/bin/env tsx
/**
 * Phase-by-Phase Determinism Debug
 * Runs a SINGLE month with phase-level hashing to identify divergence point
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import * as crypto from 'crypto';

const SEED = 42000;

function hashState(state: any): string {
  // Simple hash of AI capability sum (first divergent metric)
  const aiCapabilitySum = state.aiAgents.reduce((sum: number, ai: any) => sum + ai.capability, 0);
  return aiCapabilitySum.toFixed(10);
}

console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
console.log(`║  PHASE-BY-PHASE DETERMINISM DEBUG                             ║`);
console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

for (let run = 1; run <= 3; run++) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`RUN ${run} (seed=${SEED})`);
  console.log('='.repeat(80) + '\n');

  const engine = new SimulationEngine({
    seed: SEED,
    maxMonths: 1,
    logLevel: 'none'
  });

  const initialState = createDefaultInitialState();

  console.log(`Initial state hash: ${hashState(initialState)}`);

  const result = engine.run(initialState, {
    maxMonths: 1,
    checkActualOutcomes: false
  });

  if (result && result.finalState) {
    console.log(`Month 1 final hash: ${hashState(result.finalState)}`);
    console.log(`AI count: ${result.finalState.aiAgents.length}`);
    console.log(`First 3 AI capabilities:`);
    for (let i = 0; i < Math.min(3, result.finalState.aiAgents.length); i++) {
      const ai = result.finalState.aiAgents[i];
      console.log(`  ${ai.id}: ${ai.capability.toFixed(10)} (align: ${ai.alignment.toFixed(6)})`);
    }
  }
}

console.log(`\n\n${'='.repeat(80)}`);
console.log(`Compare the three runs above`);
console.log('='.repeat(80));
