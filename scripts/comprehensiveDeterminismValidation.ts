#!/usr/bin/env tsx
/**
 * Comprehensive Determinism Validation
 *
 * Extended validation after nuclear option fix:
 * - N=10 runs (vs standard N=3)
 * - 36 months (vs standard 12)
 * - Statistical analysis of variance
 *
 * Priya's Note: "After fixing Object.entries() and initialization bugs,
 * we need to validate across a longer timeline to ensure no drift accumulates."
 */

import { SimulationEngine, SeededRandom } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';
import * as crypto from 'crypto';

// COMPREHENSIVE CONFIGURATION
const SEED = 42000;
const NUM_RUNS = 10;  // 10 runs for statistical confidence
const MAX_MONTHS = 36;  // 3 years to catch any drift
const SNAPSHOT_INTERVAL = 1;

interface StateSnapshot {
  month: number;
  hash: string;
  capabilitySum: number;
  alignmentSum: number;
}

function captureSnapshot(state: GameState, month: number): StateSnapshot {
  // Hash entire state for O(1) comparison
  const stateStr = JSON.stringify(state, Object.keys(state).sort());
  const hash = crypto.createHash('sha256').update(stateStr).digest('hex');

  // Also track AI aggregates for detailed comparison
  const capabilitySum = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const alignmentSum = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0);

  return { month, hash, capabilitySum, alignmentSum };
}

function compareSnapshots(snapshots: StateSnapshot[][]): {
  identical: boolean;
  firstDivergence: number | null;
  statistics: any;
} {
  const months = snapshots[0].length;

  for (let m = 0; m < months; m++) {
    const hashes = snapshots.map(run => run[m].hash);
    const allIdentical = hashes.every(h => h === hashes[0]);

    if (!allIdentical) {
      // Calculate statistics at divergence point
      const capabilities = snapshots.map(run => run[m].capabilitySum);
      const alignments = snapshots.map(run => run[m].alignmentSum);

      const capMean = capabilities.reduce((a, b) => a + b) / capabilities.length;
      const capStdDev = Math.sqrt(
        capabilities.reduce((sum, val) => sum + Math.pow(val - capMean, 2), 0) / capabilities.length
      );
      const capCV = (capStdDev / capMean) * 100;

      return {
        identical: false,
        firstDivergence: m,
        statistics: {
          month: m,
          capabilityCV: capCV,
          capabilityRange: [Math.min(...capabilities), Math.max(...capabilities)],
          alignmentRange: [Math.min(...alignments), Math.max(...alignments)]
        }
      };
    }
  }

  return { identical: true, firstDivergence: null, statistics: null };
}

async function main() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('COMPREHENSIVE DETERMINISM VALIDATION');
  console.log(`${'='.repeat(80)}\n`);
  console.log(`Configuration:`);
  console.log(`  Seed: ${SEED}`);
  console.log(`  Runs: ${NUM_RUNS} (for statistical confidence)`);
  console.log(`  Duration: ${MAX_MONTHS} months (3 years)`);
  console.log(`  Snapshot interval: ${SNAPSHOT_INTERVAL} month(s)\n`);

  const allSnapshots: StateSnapshot[][] = [];

  // Run N simulations
  for (let runNum = 1; runNum <= NUM_RUNS; runNum++) {
    console.log(`🔄 Starting Run ${runNum}/${NUM_RUNS}...`);

    const engine = new SimulationEngine({ seed: SEED });

    // CRITICAL FIX (Nov 24, 2025): RNG now required as first parameter
    // Use a fresh SeededRandom for initialization with same seed each run
    const initRng = new SeededRandom(SEED);
    const initialState = createDefaultInitialState(
      () => initRng.next(),
      'unprecedented'
    );

    const runSnapshots: StateSnapshot[] = [];
    runSnapshots.push(captureSnapshot(initialState, 0));

    let currentState = initialState;

    for (let month = 1; month <= MAX_MONTHS; month++) {
      const result = engine.step(currentState);
      currentState = result.state;

      // Check if simulation ended (outcome is in state, not result)
      if (currentState.outcome && currentState.outcome !== 'ongoing') {
        console.log(`   ⚠️ Run ${runNum} ended at month ${month}: ${currentState.outcome}`);
        break;
      }

      if (month % SNAPSHOT_INTERVAL === 0) {
        runSnapshots.push(captureSnapshot(currentState, month));
      }

      // Progress indicator every 6 months
      if (month % 6 === 0) {
        const capSum = currentState.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
        console.log(`   Month ${month}: AI capability sum = ${capSum.toFixed(4)}`);
      }
    }

    allSnapshots.push(runSnapshots);
    console.log(`✅ Run ${runNum} complete: ${runSnapshots.length} snapshots\n`);
  }

  // Compare all runs
  console.log(`\n${'='.repeat(80)}`);
  console.log('DETERMINISM ANALYSIS');
  console.log(`${'='.repeat(80)}\n`);

  const comparison = compareSnapshots(allSnapshots);

  if (comparison.identical) {
    console.log(`✅ SUCCESS: All ${NUM_RUNS} runs produced IDENTICAL results for ${MAX_MONTHS} months!`);
    console.log(`\n📊 Statistical Validation:`);
    console.log(`   Coefficient of Variation: 0.000% (perfect determinism)`);
    console.log(`   All state hashes match across all runs`);
    console.log(`\n✅ DETERMINISM VERIFIED - Ready for Monte Carlo analysis\n`);
    process.exit(0);
  } else {
    console.log(`❌ FAILURE: Non-determinism detected at Month ${comparison.firstDivergence}`);
    console.log(`\n📊 Divergence Statistics:`);
    console.log(`   Capability CV: ${comparison.statistics.capabilityCV.toFixed(4)}%`);
    console.log(`   Capability range: ${comparison.statistics.capabilityRange[0].toFixed(4)} - ${comparison.statistics.capabilityRange[1].toFixed(4)}`);
    console.log(`   Alignment range: ${comparison.statistics.alignmentRange[0].toFixed(4)} - ${comparison.statistics.alignmentRange[1].toFixed(4)}`);
    console.log(`\n❌ DETERMINISM BUG STILL PRESENT - Monte Carlo results invalid\n`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Validation failed with error:', error);
  process.exit(1);
});
