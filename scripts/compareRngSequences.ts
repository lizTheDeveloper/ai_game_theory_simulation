#!/usr/bin/env tsx
/**
 * RNG Sequence Comparison Tool
 *
 * Runs 2 simulations with IDENTICAL seed and compares RNG call sequences
 * to find the first divergence point (indicating non-deterministic behavior).
 *
 * Usage:
 *   LOG_RNG_CALLS=true npx tsx scripts/compareRngSequences.ts
 *   LOG_RNG_CALLS=true LOG_RNG_STACKS=true npx tsx scripts/compareRngSequences.ts
 *
 * Roy says: "If these sequences diverge, we have conditional RNG consumption.
 *            Find the divergence, trace it back, kill it with fire."
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import fs from 'fs';
import path from 'path';

async function runWithLogging(runNumber: number, seed: number): Promise<string[]> {
  console.log(`\n🔬 Run ${runNumber}: Creating engine with seed=${seed}`);

  const engine = new SimulationEngine({ seed, maxMonths: 1, logLevel: 'summary' });
  const initialState = createDefaultInitialState();

  // Capture console output - extract just VALUES, ignore counters
  const logLines: string[] = [];
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    const line = args.join(' ');
    if (line.includes('[RNG-')) {
      // Extract value: [RNG-N] 0.1234567890 -> 0.1234567890
      const match = line.match(/\[RNG-\d+\]\s+([\d.]+)/);
      if (match) {
        logLines.push(match[1]); // Just the value
      }
    }
    originalLog(...args);
  };

  // Run simulation
  const { finalState } = await engine.run(initialState);

  // Restore console
  console.log = originalLog;

  console.log(`✅ Run ${runNumber} complete: Month ${finalState.currentMonth}, ${finalState.aiAgents.length} AI agents`);

  return logLines;
}

async function compareSequences() {
  console.log('🎲 RNG SEQUENCE COMPARISON TEST');
  console.log('================================\n');
  console.log('Strategy: Run 2 simulations with IDENTICAL seed');
  console.log('Expected: Sequences should be IDENTICAL (deterministic)');
  console.log('Reality: Will find WHERE they diverge\n');

  // Enable logging
  if (process.env.LOG_RNG_CALLS !== 'true') {
    console.error('❌ LOG_RNG_CALLS=true not set! Run with:');
    console.error('   LOG_RNG_CALLS=true npx tsx scripts/compareRngSequences.ts');
    process.exit(1);
  }

  // Same seed for both runs
  const seed = 42;

  // Run both simulations
  const log1 = await runWithLogging(1, seed);
  const log2 = await runWithLogging(2, seed);

  console.log(`\n📊 RNG Call Counts:`);
  console.log(`   Run 1: ${log1.length} calls`);
  console.log(`   Run 2: ${log2.length} calls`);

  // Find first divergence
  const minLength = Math.min(log1.length, log2.length);
  let firstDivergence = -1;

  for (let i = 0; i < minLength; i++) {
    if (log1[i] !== log2[i]) {
      firstDivergence = i;
      break;
    }
  }

  if (firstDivergence === -1 && log1.length === log2.length) {
    console.log('\n✅ SEQUENCES ARE IDENTICAL! Determinism working correctly.');
    return;
  }

  // Divergence detected
  console.log(`\n❌ DIVERGENCE DETECTED at call #${firstDivergence + 1}`);
  console.log('\nContext:');

  // Show 3 calls before divergence
  if (firstDivergence > 0) {
    const start = Math.max(0, firstDivergence - 3);
    console.log('\n=== Last matching calls ===');
    for (let i = start; i < firstDivergence; i++) {
      console.log(`  [${i}] ${log1[i]}`);
    }
  }

  // Show divergence point
  console.log('\n=== DIVERGENCE POINT ===');
  console.log(`  Run 1 [${firstDivergence}]: ${log1[firstDivergence]}`);
  console.log(`  Run 2 [${firstDivergence}]: ${log2[firstDivergence]}`);

  // Show next few calls
  console.log('\n=== Following calls ===');
  for (let i = firstDivergence + 1; i < Math.min(firstDivergence + 4, minLength); i++) {
    console.log(`  Run 1 [${i}]: ${log1[i]}`);
    console.log(`  Run 2 [${i}]: ${log2[i]}`);
  }

  // Length difference
  if (log1.length !== log2.length) {
    console.log(`\n⚠️ Call count mismatch: ${log1.length} vs ${log2.length}`);
    console.log('   This indicates CONDITIONAL RNG consumption!');
  }

  // Save full logs to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const logsDir = path.join(__dirname, '..', 'logs');
  const run1File = path.join(logsDir, `rng_run1_${timestamp}.log`);
  const run2File = path.join(logsDir, `rng_run2_${timestamp}.log`);

  fs.writeFileSync(run1File, log1.join('\n'), 'utf8');
  fs.writeFileSync(run2File, log2.join('\n'), 'utf8');

  console.log(`\n📁 Full logs saved to:`);
  console.log(`   ${run1File}`);
  console.log(`   ${run2File}`);

  console.log('\n💡 Next steps:');
  console.log('   1. Examine divergence point above');
  console.log('   2. If LOG_RNG_STACKS=true, check stack traces');
  console.log('   3. Find the phase/function making conditional RNG calls');
  console.log('   4. Fix by making RNG consumption unconditional');
}

compareSequences().catch(err => {
  console.error('❌ Error:', err);
  console.error(err.stack);
  process.exit(1);
});
