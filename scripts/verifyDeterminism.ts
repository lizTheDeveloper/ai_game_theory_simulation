#!/usr/bin/env tsx
/**
 * Determinism Verification Script
 *
 * Verifies that Monte Carlo simulations with identical seeds produce
 * bit-identical results. This is CRITICAL for research reproducibility.
 *
 * Tests:
 * 1. Run N≥3 simulations with identical seed
 * 2. Capture state snapshots at regular intervals
 * 3. Compare states field-by-field for exact matches
 * 4. Report any non-deterministic sources found
 *
 * Roy says: "If this fails, we have a serious problem. NaN was bad enough.
 *            Non-deterministic simulation? That's game over for research validity."
 */

import { SimulationEngine, SeededRandom } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Configuration
const SEED = 42000;  // Fixed seed for all runs
const NUM_RUNS = 3;  // Number of identical runs to compare
const MAX_MONTHS = 12;  // Run for 12 months (enough to catch issues)
const SNAPSHOT_INTERVAL = 1;  // Snapshot every month

// Output directory
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(__dirname, '..', 'logs');
const outputFile = path.join(outputDir, `determinism_verification_${timestamp}.log`);

// Ensure logs directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Logging utilities
function log(message: string) {
  console.log(message);
  fs.appendFileSync(outputFile, message + '\n', 'utf8');
}

function logError(message: string) {
  console.error(message);
  fs.appendFileSync(outputFile, `❌ ERROR: ${message}\n`, 'utf8');
}

function logSuccess(message: string) {
  console.log(message);
  fs.appendFileSync(outputFile, `✅ ${message}\n`, 'utf8');
}

// State comparison utilities
interface StateSnapshot {
  month: number;
  hash: string;
  state: GameState;
}

/**
 * Generate a deterministic hash of GameState
 * Uses stable JSON stringification to ensure field order doesn't affect hash
 */
function hashState(state: GameState): string {
  // Convert state to stable JSON (sorted keys)
  const stableJson = JSON.stringify(state, Object.keys(state).sort());
  return crypto.createHash('sha256').update(stableJson).digest('hex');
}

/**
 * Deep comparison of two states with detailed diff reporting
 * Returns array of differences found
 */
function compareStates(state1: GameState, state2: GameState, month: number): string[] {
  const differences: string[] = [];

  // Compare primitive fields
  const primitiveFields: (keyof GameState)[] = [
    'currentMonth',
    'globalCompute',
    'currentInvestment',
    'currentSafety',
    'currentQoL',
    'governmentInvestment',
    'societySupport',
    'extinctionRisk',
    'unemployment',
    'paranoia',
    'trust',
    'democracy',
    'socialCohesion',
    'ecologicalScore',
    'developmentScore',
    'westernLiberalScore',
    'indigenousScore'
  ];

  for (const field of primitiveFields) {
    const val1 = state1[field];
    const val2 = state2[field];

    if (typeof val1 === 'number' && typeof val2 === 'number') {
      // For numbers, check exact equality (no tolerance for determinism)
      if (val1 !== val2) {
        differences.push(`  ${field}: ${val1} !== ${val2} (diff: ${Math.abs(val1 - val2)})`);
      }
    } else if (val1 !== val2) {
      differences.push(`  ${field}: ${JSON.stringify(val1)} !== ${JSON.stringify(val2)}`);
    }
  }

  // Compare AI agents (order matters for determinism)
  const agents1 = state1.aiAgents || [];
  const agents2 = state2.aiAgents || [];
  if (agents1.length !== agents2.length) {
    differences.push(`  aiAgents.length: ${agents1.length} !== ${agents2.length}`);
  } else {
    for (let i = 0; i < Math.min(agents1.length, 5); i++) {  // Limit to first 5 for readability
      const ai1 = agents1[i];
      const ai2 = agents2[i];

      if (ai1.id !== ai2.id) {
        differences.push(`  aiAgents[${i}].id: ${ai1.id} !== ${ai2.id}`);
      }
      if (ai1.capability !== ai2.capability) {
        differences.push(`  aiAgents[${i}].capability: ${ai1.capability} !== ${ai2.capability}`);
      }
      if (ai1.alignment !== ai2.alignment) {
        differences.push(`  aiAgents[${i}].alignment: ${ai1.alignment} !== ${ai2.alignment}`);
      }
      if (ai1.internalAlignment !== ai2.internalAlignment) {
        differences.push(`  aiAgents[${i}].internalAlignment: ${ai1.internalAlignment} !== ${ai2.internalAlignment}`);
      }
    }
  }

  // Compare organizations
  const orgs1 = state1.organizations || [];
  const orgs2 = state2.organizations || [];
  if (orgs1.length !== orgs2.length) {
    differences.push(`  organizations.length: ${orgs1.length} !== ${orgs2.length}`);
  } else {
    for (let i = 0; i < Math.min(orgs1.length, 5); i++) {  // Limit to first 5 for readability
      const org1 = orgs1[i];
      const org2 = orgs2[i];

      if (org1.id !== org2.id) {
        differences.push(`  organizations[${i}].id: ${org1.id} !== ${org2.id}`);
      }
      if (org1.capital !== org2.capital) {
        differences.push(`  organizations[${i}].capital: ${org1.capital} !== ${org2.capital}`);
      }
    }
  }

  // Compare technologies (with safe access)
  const tech1 = state1.technologies || [];
  const tech2 = state2.technologies || [];
  if (tech1.length !== tech2.length) {
    differences.push(`  technologies.length: ${tech1.length} !== ${tech2.length}`);
  }

  // Compare crises (with safe access)
  const crises1 = state1.crises || [];
  const crises2 = state2.crises || [];
  if (crises1.length !== crises2.length) {
    differences.push(`  crises.length: ${crises1.length} !== ${crises2.length}`);
  }

  return differences;
}

/**
 * Run a single simulation and capture snapshots
 */
async function runSimulationWithSnapshots(runNumber: number): Promise<StateSnapshot[]> {
  log(`\n🔄 Starting run ${runNumber} (seed=${SEED})...`);

  const engine = new SimulationEngine({
    seed: SEED,
    maxMonths: MAX_MONTHS,
    logLevel: 'none'  // Suppress simulation logs
  });

  // Create RNG function for initialization (CRITICAL: determinism requires seeded RNG)
  const rng = new SeededRandom(SEED);
  const rngFunc = () => rng.next();

  const initialState = createDefaultInitialState(rngFunc, 'balanced', undefined, undefined, undefined, undefined);
  const snapshots: StateSnapshot[] = [];

  // Capture snapshot of initial state
  snapshots.push({
    month: 0,
    hash: hashState(initialState),
    state: JSON.parse(JSON.stringify(initialState))  // Deep clone
  });

  const result = engine.run(initialState, {
    maxMonths: MAX_MONTHS,
    checkActualOutcomes: false,  // Don't stop on outcomes
    onMonthEnd: (state: GameState) => {
      if (state.currentMonth % SNAPSHOT_INTERVAL === 0) {
        snapshots.push({
          month: state.currentMonth,
          hash: hashState(state),
          state: JSON.parse(JSON.stringify(state))  // Deep clone
        });
      }
    }
  });

  log(`  ✓ Run ${runNumber} completed (${snapshots.length} snapshots captured)`);

  return snapshots;
}

/**
 * Main verification function
 */
async function verifyDeterminism() {
  log('╔═══════════════════════════════════════════════════════════════╗');
  log('║          DETERMINISM VERIFICATION TEST                        ║');
  log('╚═══════════════════════════════════════════════════════════════╝\n');

  log(`📋 Configuration:`);
  log(`   Seed: ${SEED}`);
  log(`   Runs: ${NUM_RUNS}`);
  log(`   Max months: ${MAX_MONTHS}`);
  log(`   Snapshot interval: ${SNAPSHOT_INTERVAL} month(s)`);
  log(`   Output: ${outputFile}\n`);

  // Run all simulations
  const allSnapshots: StateSnapshot[][] = [];

  for (let i = 1; i <= NUM_RUNS; i++) {
    const snapshots = await runSimulationWithSnapshots(i);
    allSnapshots.push(snapshots);
  }

  log(`\n📊 Comparison Results:\n`);
  log('─'.repeat(80));

  // Compare all runs
  let totalDifferences = 0;
  let monthsWithDifferences: number[] = [];

  const numSnapshots = allSnapshots[0].length;

  for (let snapshotIdx = 0; snapshotIdx < numSnapshots; snapshotIdx++) {
    const month = allSnapshots[0][snapshotIdx].month;

    // Get hashes for this month from all runs
    const hashes = allSnapshots.map(snapshots => snapshots[snapshotIdx].hash);
    const states = allSnapshots.map(snapshots => snapshots[snapshotIdx].state);

    // Check if all hashes are identical
    const allIdentical = hashes.every(hash => hash === hashes[0]);

    if (allIdentical) {
      log(`✅ Month ${month.toString().padStart(3, ' ')}: All runs IDENTICAL (hash: ${hashes[0].substring(0, 16)}...)`);
    } else {
      log(`❌ Month ${month.toString().padStart(3, ' ')}: DIFFERENCES DETECTED!`);
      monthsWithDifferences.push(month);

      // Show which runs differ
      for (let i = 1; i < NUM_RUNS; i++) {
        if (hashes[i] !== hashes[0]) {
          log(`   Run ${i + 1} differs from Run 1:`);
          log(`     Run 1 hash: ${hashes[0].substring(0, 16)}...`);
          log(`     Run ${i + 1} hash: ${hashes[i].substring(0, 16)}...`);

          // Detailed field-by-field comparison
          const differences = compareStates(states[0], states[i], month);
          if (differences.length > 0) {
            log(`\n   Field differences (Run 1 vs Run ${i + 1}):`);
            differences.slice(0, 20).forEach(diff => log(diff));  // Limit to first 20 differences
            if (differences.length > 20) {
              log(`   ... and ${differences.length - 20} more differences`);
            }
            totalDifferences += differences.length;
          }
          log('');
        }
      }
    }
  }

  // Final verdict
  log('\n' + '═'.repeat(80));
  log('\n🎯 FINAL VERDICT:\n');

  if (monthsWithDifferences.length === 0) {
    logSuccess('DETERMINISM VERIFIED: All runs produced bit-identical results! 🎉');
    logSuccess('The simulation is fully deterministic with seeded RNG.');
    log('\nThis means:');
    log('  ✓ Monte Carlo results are reproducible');
    log('  ✓ Debugging is reliable (same seed = same behavior)');
    log('  ✓ Research findings can be validated');
    log('  ✓ No hidden sources of randomness (Date.now(), Math.random(), etc.)');
    return true;
  } else {
    logError(`DETERMINISM FAILED: Found differences in ${monthsWithDifferences.length} month(s)!`);
    log(`\nMonths with differences: ${monthsWithDifferences.join(', ')}`);
    log(`Total field differences found: ${totalDifferences}`);
    log('\n⚠️  CRITICAL ISSUE: Non-deterministic behavior detected!');
    log('\nPossible causes:');
    log('  • Date.now() or new Date() calls in simulation code');
    log('  • Math.random() instead of seeded RNG');
    log('  • External API calls or file I/O');
    log('  • Race conditions in parallel execution');
    log('  • Uninitialized variables or object property order');
    log('  • Floating-point precision issues (unlikely with identical hardware)');
    log('\n🔍 INVESTIGATION REQUIRED:');
    log('  1. Search codebase for Math.random(), Date.now(), new Date()');
    log('  2. Verify all phases use rng() function parameter');
    log('  3. Check for external dependencies in simulation modules');
    log('  4. Review recent commits for non-deterministic patterns');
    return false;
  }
}

// Run verification
verifyDeterminism()
  .then(success => {
    log('\n' + '═'.repeat(80));
    log(`\nVerification completed at ${new Date().toISOString()}`);
    log(`Full report: ${outputFile}\n`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    logError(`\n💥 VERIFICATION CRASHED: ${err.message}`);
    logError(err.stack);
    process.exit(2);
  });
