#!/usr/bin/env tsx
/**
 * RNG Divergence Detector (Nov 6, 2025)
 *
 * THE PROBLEM:
 * - Month 1 starts with identical totalCapability=2.459466 across all runs
 * - Month 1 ends with divergent AI creation (poissonSample returns different values)
 * - This means some phase WITHIN Month 1 is consuming different numbers of RNG calls
 *
 * THE STRATEGY:
 * 1. Run 2 simulations with LOG_RNG_CALLS=true
 * 2. Capture RNG sequences for Month 0 and Month 1
 * 3. Compare sequences and find the first divergence point
 * 4. Identify which phase is causing non-determinism
 *
 * USAGE:
 *   LOG_RNG_CALLS=true npx tsx scripts/findRngDivergence.ts
 */

import { GameState } from '@/types/game';
import { createDefaultInitialState } from '@/simulation/initialization';
import { SimulationEngine } from '@/simulation/engine';

// CRITICAL: Use same seed for both runs
const SEED = 42; // Numeric seed for SeededRandom
const MAX_MONTHS = 1; // Only run to Month 1

interface RngCall {
  index: number;
  value: string; // Store as string to preserve precision
  phase?: string; // Which phase made this call (if we can infer)
}

/**
 * Extract RNG calls from console output
 */
function extractRngCalls(output: string[]): RngCall[] {
  const calls: RngCall[] = [];
  let currentIndex = 0;

  for (const line of output) {
    const match = line.match(/\[RNG-(\d+)\] ([\d.]+)/);
    if (match) {
      calls.push({
        index: parseInt(match[1], 10),
        value: match[2]
      });
      currentIndex++;
    }
  }

  return calls;
}

/**
 * Capture console.log during simulation
 */
function captureConsoleLog(): {
  start: () => void;
  stop: () => string[];
} {
  const originalLog = console.log;
  let logs: string[] = [];

  return {
    start() {
      logs = [];
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => String(arg)).join(' '));
        // Still output to original console for debugging
        originalLog(...args);
      };
    },
    stop() {
      console.log = originalLog;
      return logs;
    }
  };
}

/**
 * Run a single simulation and capture RNG calls
 */
function runSimulation(runId: number): RngCall[] {
  console.log(`\n========================================`);
  console.log(`🔬 Run ${runId}: Starting simulation with seed=${SEED}`);
  console.log(`========================================\n`);

  // Create engine with seed (it handles RNG internally)
  const engine = new SimulationEngine({ seed: SEED, maxMonths: MAX_MONTHS, logLevel: 'summary' });

  // Create initial state with same seed
  const initialState = createDefaultInitialState('historical', undefined, undefined, undefined, undefined, SEED);

  const capture = captureConsoleLog();

  capture.start();

  // Run simulation to Month 1
  engine.run(initialState, { maxMonths: MAX_MONTHS });

  const logs = capture.stop();
  const rngCalls = extractRngCalls(logs);

  console.log(`\n✅ Run ${runId} complete: ${rngCalls.length} RNG calls recorded`);

  return rngCalls;
}

/**
 * Compare two RNG sequences and find divergence
 */
function compareSequences(run1: RngCall[], run2: RngCall[]): void {
  console.log(`\n========================================`);
  console.log(`📊 Comparing RNG Sequences`);
  console.log(`========================================\n`);

  console.log(`Run 1: ${run1.length} calls`);
  console.log(`Run 2: ${run2.length} calls`);

  const minLength = Math.min(run1.length, run2.length);
  let divergencePoint = -1;

  // Find first divergence
  for (let i = 0; i < minLength; i++) {
    if (run1[i].value !== run2[i].value) {
      divergencePoint = i;
      break;
    }
  }

  if (divergencePoint === -1 && run1.length === run2.length) {
    console.log(`\n✅ SEQUENCES MATCH PERFECTLY!`);
    console.log(`   Both runs made ${run1.length} identical RNG calls`);
    return;
  }

  console.log(`\n❌ DIVERGENCE DETECTED!`);

  if (divergencePoint === -1) {
    // Same values but different lengths
    console.log(`   First ${minLength} calls match, but:`);
    console.log(`   Run 1: ${run1.length} calls`);
    console.log(`   Run 2: ${run2.length} calls`);
    console.log(`\n   One run made ${Math.abs(run1.length - run2.length)} extra RNG calls`);

    // Show the extra calls
    const longerRun = run1.length > run2.length ? run1 : run2;
    const longerRunId = run1.length > run2.length ? 1 : 2;
    console.log(`\n   Extra calls in Run ${longerRunId}:`);
    for (let i = minLength; i < longerRun.length; i++) {
      console.log(`   [${i}] ${longerRun[i].value}`);
    }
  } else {
    // Values diverged
    console.log(`   Divergence at RNG call index: ${divergencePoint}`);
    console.log(`\n   Last matching calls (context):`);
    const contextStart = Math.max(0, divergencePoint - 3);
    for (let i = contextStart; i < divergencePoint; i++) {
      console.log(`   [${i}] ${run1[i].value} (both runs)`);
    }

    console.log(`\n   🔥 DIVERGENCE POINT:`);
    console.log(`   Run 1 [${divergencePoint}]: ${run1[divergencePoint].value}`);
    console.log(`   Run 2 [${divergencePoint}]: ${run2[divergencePoint].value}`);

    console.log(`\n   Next few calls (showing drift):`);
    for (let i = divergencePoint + 1; i < Math.min(divergencePoint + 5, minLength); i++) {
      console.log(`   Run 1 [${i}]: ${run1[i].value}`);
      console.log(`   Run 2 [${i}]: ${run2[i].value}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`🔍 DIAGNOSIS`);
  console.log(`========================================\n`);
  console.log(`The simulation has a non-deterministic RNG consumption pattern.`);
  console.log(`This means some phase is using conditional logic that depends on`);
  console.log(`state values that themselves depend on RNG, causing different`);
  console.log(`numbers of RNG calls across runs.`);
  console.log(`\nNEXT STEPS:`);
  console.log(`1. Review phases that run in Month 0-1`);
  console.log(`2. Look for conditional RNG usage (if statements around rng() calls)`);
  console.log(`3. Ensure all random decisions consume RNG calls consistently`);
  console.log(`4. Consider adding phase-level RNG logging to identify the culprit`);
}

/**
 * Main execution
 */
async function main() {
  if (process.env.LOG_RNG_CALLS !== 'true') {
    console.error(`\n❌ ERROR: LOG_RNG_CALLS environment variable not set!`);
    console.error(`   Usage: LOG_RNG_CALLS=true npx tsx scripts/findRngDivergence.ts\n`);
    process.exit(1);
  }

  console.log(`\n🚀 RNG Divergence Detector`);
  console.log(`   Seed: ${SEED}`);
  console.log(`   Max Months: ${MAX_MONTHS}`);
  console.log(`   RNG Logging: ENABLED\n`);

  // Run two simulations
  const run1Calls = runSimulation(1);
  const run2Calls = runSimulation(2);

  // Compare sequences
  compareSequences(run1Calls, run2Calls);
}

main().catch(error => {
  console.error(`\n❌ FATAL ERROR:`, error);
  process.exit(1);
});
