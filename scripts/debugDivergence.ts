#!/usr/bin/env tsx
/**
 * Debug Month 2 Divergence
 *
 * Run simulation twice with same seed and compare Month 2 state byte-by-byte
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import * as fs from 'fs';

const SEED = 42000;

async function main() {
  console.log('\n=== DIVERGENCE DEBUG ===\n');

  // Run 1
  console.log('Run 1: Executing...');
  const engine1 = new SimulationEngine({ seed: SEED });
  const initialState1 = createDefaultInitialState('unprecedented', undefined, undefined, undefined, undefined, SEED);

  // Write Month 0 (initialization) BEFORE any mutations
  fs.writeFileSync('/Users/annhoward/src/superalignmenttoutopia/logs/debug_state1_month0.json', JSON.stringify(initialState1, null, 2));

  let current1 = initialState1;
  for (let m = 1; m <= 2; m++) {
    const result = engine1.step(current1);
    current1 = result.state;
  }

  // Run 2
  console.log('Run 2: Executing...');
  const engine2 = new SimulationEngine({ seed: SEED });
  const initialState2 = createDefaultInitialState('unprecedented', undefined, undefined, undefined, undefined, SEED);

  // Write Month 0 (initialization) BEFORE any mutations
  fs.writeFileSync('/Users/annhoward/src/superalignmenttoutopia/logs/debug_state2_month0.json', JSON.stringify(initialState2, null, 2));

  let current2 = initialState2;

  for (let m = 1; m <= 2; m++) {
    const result = engine2.step(current2);
    current2 = result.state;
  }

  console.log('\n=== COMPARISON ===\n');

  // Compare Month 0 (initial state)
  const cap1_m0 = initialState1.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const cap2_m0 = initialState2.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);

  console.log(`Month 0 Capability Sum 1: ${cap1_m0.toFixed(6)}`);
  console.log(`Month 0 Capability Sum 2: ${cap2_m0.toFixed(6)}`);
  console.log(`Month 0 Difference: ${Math.abs(cap1_m0 - cap2_m0).toFixed(10)}`);
  if (cap1_m0 !== cap2_m0) {
    console.log('⚠️  DIVERGENCE AT INITIALIZATION!\n');
  } else {
    console.log('✅ Month 0 identical\n');
  }

  // Compare AI capability sums
  const cap1 = current1.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const cap2 = current2.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);

  console.log(`Capability Sum 1: ${cap1.toFixed(6)}`);
  console.log(`Capability Sum 2: ${cap2.toFixed(6)}`);
  console.log(`Difference: ${Math.abs(cap1 - cap2).toFixed(6)} (${((Math.abs(cap1 - cap2) / cap1) * 100).toFixed(2)}%)`);

  if (cap1 === cap2) {
    console.log('\n✅ IDENTICAL - Capabilities match!');
  } else {
    console.log('\n❌ DIVERGENCE - Capabilities differ!');

    // Compare individual AIs
    console.log('\n=== Per-AI Comparison ===\n');
    for (let i = 0; i < Math.min(current1.aiAgents.length, current2.aiAgents.length); i++) {
      const ai1 = current1.aiAgents[i];
      const ai2 = current2.aiAgents[i];

      if (ai1.capability !== ai2.capability) {
        console.log(`AI ${i} (${ai1.name}):`);
        console.log(`  Run 1: ${ai1.capability.toFixed(6)}`);
        console.log(`  Run 2: ${ai2.capability.toFixed(6)}`);
        console.log(`  Diff: ${(ai1.capability - ai2.capability).toFixed(6)}`);
      }
    }
  }

  // Write full states to files for manual inspection
  fs.writeFileSync('/Users/annhoward/src/superalignmenttoutopia/logs/debug_state1.json', JSON.stringify(current1, null, 2));
  fs.writeFileSync('/Users/annhoward/src/superalignmenttoutopia/logs/debug_state2.json', JSON.stringify(current2, null, 2));
  console.log('\n📝 Full states written to logs/debug_state1.json and logs/debug_state2.json');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
