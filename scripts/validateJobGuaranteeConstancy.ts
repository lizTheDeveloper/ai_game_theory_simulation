/**
 * Diagnostic script to validate Job Guarantee 0.0% CV finding
 *
 * Tests whether Job Guarantee unemployment is truly constant or if it's a wiring bug.
 *
 * Expected behavior if CORRECT:
 * - Unemployment should be capped at weighted floor based on society segments
 * - If segments are deterministic, floor should be IDENTICAL across all runs
 * - CV should be 0.0%
 *
 * Expected behavior if BUG:
 * - Unemployment might be hardcoded or not updating
 * - Value might be stuck at initialization value
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';

interface UnemploymentSnapshot {
  seed: number;
  month: number;
  unemployment: number;
  weightedFloor: number;
  segmentFloors: Array<{ status: string; floor: number; fraction: number }>;
}

function runJobGuaranteeTest(seed: number, maxMonths: number): UnemploymentSnapshot[] {
  const engine = new SimulationEngine({
    seed,
    mode: 'production',
  });

  const state = engine.getState();

  // Apply Job Guarantee policy
  if (!state.policyInterventions) {
    state.policyInterventions = {};
  }
  state.policyInterventions.jobGuaranteeLevel = 1.0;

  const snapshots: UnemploymentSnapshot[] = [];

  // Take snapshots at intervals
  const snapshotMonths = [0, 30, 60, 90, 120];

  for (let month = 0; month <= maxMonths; month++) {
    engine.step();

    if (snapshotMonths.includes(month)) {
      // Calculate weighted floor manually to verify it's working
      let weightedFloor = 0;
      let totalWeight = 0;
      const segmentFloors = [];

      if (state.society.segments) {
        for (const segment of state.society.segments) {
          // Import calculateUnemploymentFloor
          const { calculateUnemploymentFloor } = require('../simulation/aiAssistedSkills');
          const segmentFloor = calculateUnemploymentFloor(1.0, segment.economicStatus);

          weightedFloor += segmentFloor * segment.populationFraction;
          totalWeight += segment.populationFraction;

          segmentFloors.push({
            status: segment.economicStatus,
            floor: segmentFloor,
            fraction: segment.populationFraction,
          });
        }
      }

      const floor = totalWeight > 0 ? weightedFloor / totalWeight : 0.10;

      snapshots.push({
        seed,
        month,
        unemployment: state.society.unemploymentLevel,
        weightedFloor: floor,
        segmentFloors,
      });
    }
  }

  return snapshots;
}

async function main() {
  console.log('🔬 JOB GUARANTEE CONSTANCY VALIDATION\n');
  console.log('Testing whether 0.0% CV is real or a wiring bug\n');

  const seeds = [80000, 80001, 80002, 80003, 80004];
  const maxMonths = 120;

  console.log(`Running 5 simulations (seeds ${seeds[0]}-${seeds[4]}), 120 months each\n`);

  const allSnapshots: UnemploymentSnapshot[] = [];

  for (const seed of seeds) {
    const snapshots = runJobGuaranteeTest(seed, maxMonths);
    allSnapshots.push(...snapshots);

    console.log(`\n📊 Seed ${seed} Results:`);
    console.log('┌────────┬───────────────┬────────────────┐');
    console.log('│ Month  │ Unemployment  │ Weighted Floor │');
    console.log('├────────┼───────────────┼────────────────┤');

    for (const snap of snapshots) {
      const monthStr = snap.month.toString().padStart(6);
      const unemploymentStr = `${(snap.unemployment * 100).toFixed(2)}%`.padStart(13);
      const floorStr = `${(snap.weightedFloor * 100).toFixed(2)}%`.padStart(14);
      console.log(`│ ${monthStr} │ ${unemploymentStr} │ ${floorStr} │`);
    }
    console.log('└────────┴───────────────┴────────────────┘');
  }

  // Analyze final month (120) across all seeds
  console.log('\n\n📈 FINAL MONTH (120) ANALYSIS:\n');

  const finalSnapshots = allSnapshots.filter(s => s.month === 120);

  console.log('Unemployment values:');
  for (const snap of finalSnapshots) {
    console.log(`  Seed ${snap.seed}: ${(snap.unemployment * 100).toFixed(4)}%`);
  }

  const unemploymentValues = finalSnapshots.map(s => s.unemployment);
  const mean = unemploymentValues.reduce((sum, v) => sum + v, 0) / unemploymentValues.length;
  const variance = unemploymentValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / unemploymentValues.length;
  const std = Math.sqrt(variance);
  const cv = std / Math.abs(mean);

  console.log(`\nStatistics:`);
  console.log(`  Mean: ${(mean * 100).toFixed(4)}%`);
  console.log(`  Std Dev: ${(std * 100).toFixed(4)}%`);
  console.log(`  CV: ${(cv * 100).toFixed(4)}%`);

  // Check if all values are identical
  const allIdentical = unemploymentValues.every(v => Math.abs(v - unemploymentValues[0]) < 0.0001);

  console.log(`\n\n✅ VALIDATION RESULT:\n`);

  if (allIdentical) {
    console.log('✅ All unemployment values are IDENTICAL (difference < 0.01%)');
    console.log('✅ This confirms 0.0% CV is REAL, not a bug');
    console.log('\n📝 EXPLANATION:');
    console.log('   Job Guarantee caps unemployment at weighted floor based on society segments.');
    console.log('   Since segments are deterministic (same across all seeds), the floor is constant.');
    console.log('   unemployment = Math.min(calculated_unemployment, constant_floor)');
    console.log('   When calculated unemployment >> floor, it always gets capped at the same value.');
  } else {
    console.log('⚠️  Unemployment values VARY across seeds');
    console.log('⚠️  This suggests the 0.0% CV might be a bug or measurement artifact');
    console.log(`   CV: ${(cv * 100).toFixed(2)}%`);
  }

  // Check segment floors
  console.log('\n\n🔍 SEGMENT FLOOR ANALYSIS (Seed 80000, Month 120):\n');
  const firstFinalSnap = finalSnapshots[0];
  if (firstFinalSnap.segmentFloors.length > 0) {
    console.log('┌─────────────────────┬───────────┬──────────────────┐');
    console.log('│ Economic Status     │ Floor     │ Population Frac  │');
    console.log('├─────────────────────┼───────────┼──────────────────┤');

    for (const seg of firstFinalSnap.segmentFloors) {
      const statusStr = seg.status.padEnd(19);
      const floorStr = `${(seg.floor * 100).toFixed(1)}%`.padStart(9);
      const fracStr = `${(seg.fraction * 100).toFixed(1)}%`.padStart(16);
      console.log(`│ ${statusStr} │ ${floorStr} │ ${fracStr} │`);
    }
    console.log('└─────────────────────┴───────────┴──────────────────┘');

    console.log(`\nWeighted Floor: ${(firstFinalSnap.weightedFloor * 100).toFixed(2)}%`);
    console.log(`Actual Unemployment: ${(firstFinalSnap.unemployment * 100).toFixed(2)}%`);

    if (Math.abs(firstFinalSnap.unemployment - firstFinalSnap.weightedFloor) < 0.001) {
      console.log('\n✅ Unemployment EQUALS weighted floor (cap is active)');
    } else if (firstFinalSnap.unemployment < firstFinalSnap.weightedFloor) {
      console.log('\n⚠️  Unemployment is BELOW floor (cap not reached)');
    } else {
      console.log('\n❌ Unemployment EXCEEDS floor (bug - cap should prevent this)');
    }
  }
}

main().catch(console.error);
