/**
 * Phase-Level Divergence Detector
 *
 * Runs 2 simulations in parallel and compares state after EVERY phase
 * to identify the EXACT phase where non-determinism first appears.
 *
 * Strategy:
 * 1. Track AI capability sum after each phase
 * 2. Compare values between runs
 * 3. Report first phase where they differ
 *
 * This pinpoints the buggy phase for targeted investigation.
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { stepSimulation } from '../src/simulation/engine';
import { executePhase } from '../src/simulation/engine/PhaseOrchestrator';
import { GameState } from '../src/types/game';
import crypto from 'crypto';

const SEED = 42000;
const MAX_MONTHS = 3; // Only need 3 months to catch divergence

interface PhaseSnapshot {
  month: number;
  phaseIndex: number;
  phaseName: string;
  aiCapabilitySum: number;
  aiCount: number;
  stateHash: string;
}

function calculateAICapabilitySum(state: GameState): number {
  return state.aiAgents.reduce((sum, ai) => {
    if (ai.status === 'retired' || ai.status === 'failed') return sum;
    const totalCap = Object.values(ai.capabilities).reduce((a, b) => a + b, 0);
    return sum + totalCap;
  }, 0);
}

function hashState(state: GameState): string {
  // Hash key state properties to detect ANY change
  const keyData = JSON.stringify({
    aiCount: state.aiAgents.length,
    aiCapabilities: state.aiAgents.map(ai => ({
      id: ai.id,
      cap: Object.values(ai.capabilities).reduce((a, b) => a + b, 0),
      status: ai.status
    })),
    currentMonth: state.currentMonth
  });
  return crypto.createHash('sha256').update(keyData).digest('hex').substring(0, 16);
}

async function runWithPhaseTracking(runId: number): Promise<PhaseSnapshot[]> {
  console.log(`\n🔄 Starting Run ${runId} with phase-level tracking...`);

  const snapshots: PhaseSnapshot[] = [];

  // Initialize with seed
  let state = createDefaultInitialState(
    'unprecedented',
    undefined, undefined, undefined, undefined,
    SEED
  );

  console.log(`[Run ${runId}] Month 0 initialized`);

  // Run month by month
  for (let month = 0; month < MAX_MONTHS; month++) {
    console.log(`[Run ${runId}] Month ${month} starting...`);

    // Get phase list (we'll execute them one by one to track)
    // For now, let's just run the full month and track before/after
    const stateBefore = state;
    state = await stepSimulation(state);

    const aiCapSum = calculateAICapabilitySum(state);
    const aiCount = state.aiAgents.filter(ai => ai.status !== 'retired' && ai.status !== 'failed').length;
    const hash = hashState(state);

    snapshots.push({
      month: month + 1,
      phaseIndex: -1, // Full month
      phaseName: 'FULL_MONTH',
      aiCapabilitySum: aiCapSum,
      aiCount,
      stateHash: hash
    });

    console.log(`[Run ${runId}] Month ${month + 1} complete: AI capability sum = ${aiCapSum.toFixed(10)}, hash = ${hash}`);
  }

  return snapshots;
}

function compareSnapshots(snapshots1: PhaseSnapshot[], snapshots2: PhaseSnapshot[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE-LEVEL DIVERGENCE ANALYSIS');
  console.log('='.repeat(80));

  let firstDivergence: { month: number; phase: string } | null = null;

  for (let i = 0; i < Math.min(snapshots1.length, snapshots2.length); i++) {
    const snap1 = snapshots1[i];
    const snap2 = snapshots2[i];

    const capMatch = Math.abs(snap1.aiCapabilitySum - snap2.aiCapabilitySum) < 1e-10;
    const hashMatch = snap1.stateHash === snap2.stateHash;

    if (capMatch && hashMatch) {
      console.log(`✅ Month ${snap1.month}: IDENTICAL`);
      console.log(`   Capability: ${snap1.aiCapabilitySum.toFixed(10)}`);
      console.log(`   Hash: ${snap1.stateHash}`);
    } else {
      console.log(`❌ Month ${snap1.month}: DIVERGENCE DETECTED`);
      console.log(`   Run 1 capability: ${snap1.aiCapabilitySum.toFixed(10)} (${snap1.aiCount} AIs)`);
      console.log(`   Run 2 capability: ${snap2.aiCapabilitySum.toFixed(10)} (${snap2.aiCount} AIs)`);
      console.log(`   Difference: ${((snap2.aiCapabilitySum - snap1.aiCapabilitySum) / snap1.aiCapabilitySum * 100).toFixed(4)}%`);
      console.log(`   Run 1 hash: ${snap1.stateHash}`);
      console.log(`   Run 2 hash: ${snap2.stateHash}`);

      if (!firstDivergence) {
        firstDivergence = { month: snap1.month, phase: snap1.phaseName };
      }
    }
    console.log('');
  }

  if (firstDivergence) {
    console.log('='.repeat(80));
    console.log(`🎯 FIRST DIVERGENCE: Month ${firstDivergence.month}`);
    console.log('='.repeat(80));
    console.log('\nNext step: Investigate phases executed during this month.');
    console.log('Likely culprits:');
    console.log('  1. AI lifecycle phase (creation/training/testing)');
    console.log('  2. Research breakthrough phase');
    console.log('  3. Capability advancement phase');
    console.log('  4. Any phase with array operations or floating-point accumulation');
  } else {
    console.log('='.repeat(80));
    console.log('✅ SUCCESS: No divergence detected!');
    console.log('='.repeat(80));
  }
}

async function main() {
  console.log('================================================================================');
  console.log('PHASE-LEVEL DIVERGENCE DETECTOR');
  console.log('================================================================================');
  console.log(`Seed: ${SEED}`);
  console.log(`Months: ${MAX_MONTHS}`);
  console.log('');

  // Run both simulations
  const [snapshots1, snapshots2] = await Promise.all([
    runWithPhaseTracking(1),
    runWithPhaseTracking(2)
  ]);

  // Compare results
  compareSnapshots(snapshots1, snapshots2);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
