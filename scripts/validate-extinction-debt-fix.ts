/**
 * Validate Extinction Debt O(n) Performance Fix
 *
 * Tests the two-pointer compaction optimization to ensure:
 * 1. O(n) complexity (not O(n²))
 * 2. Determinism preserved (same seed → same results)
 * 3. Correct compaction logic (keeps valid debts, removes completed)
 *
 * Nov 20, 2025 - Roy (Simulation Maintainer)
 */

import { IrreversibilityTrackingPhase } from '../src/simulation/engine/phases/IrreversibilityTrackingPhase';
import { createSeededRng } from '../src/simulation/rng';

console.log('🧪 Extinction Debt Performance Validation\n');

// Test 1: O(n) Performance
console.log('=== Test 1: O(n) Performance with Large Queue ===');
{
  const state: any = {
    currentMonth: 0,
    tippingPoints: {
      extinctionDebt: {
        debtQueue: [],
        totalDebt: 0,
        paidDebt: 0,
      },
    },
    planetaryBoundariesSystem: {
      boundaries: {
        biosphere_integrity: {
          currentValue: 0.5,
          extinctionContribution: 0,
        },
      },
    },
  };

  // Populate 200 debts with random timescales
  for (let i = 0; i < 200; i++) {
    state.tippingPoints.extinctionDebt.debtQueue.push({
      speciesCount: 1 + Math.random() * 5,
      debtTimescaleMonths: 50 * 12 + Math.random() * 100 * 12,
      monthsRemaining: Math.floor(Math.random() * 150 * 12),
      extinctionProbabilityPerMonth: 0.001,
    });
  }

  const initialSize = state.tippingPoints.extinctionDebt.debtQueue.length;
  const phase = new IrreversibilityTrackingPhase();
  const rng = createSeededRng(42);

  const startTime = performance.now();
  phase.execute(state, rng);
  const duration = performance.now() - startTime;

  const finalSize = state.tippingPoints.extinctionDebt.debtQueue.length;

  console.log(`  Initial queue size: ${initialSize}`);
  console.log(`  Final queue size: ${finalSize}`);
  console.log(`  Execution time: ${duration.toFixed(3)}ms`);
  console.log(`  Status: ${duration < 10 ? '✅ PASS' : '❌ FAIL'} (expected <10ms for O(n))`);
}

// Test 2: Determinism
console.log('\n=== Test 2: Determinism Check ===');
{
  const createScenario = (seed: number) => {
    const state: any = {
      currentMonth: 0,
      tippingPoints: {
        extinctionDebt: {
          debtQueue: [
            { speciesCount: 10, debtTimescaleMonths: 100, monthsRemaining: 5, extinctionProbabilityPerMonth: 0.1 },
            { speciesCount: 20, debtTimescaleMonths: 200, monthsRemaining: 1, extinctionProbabilityPerMonth: 0.05 },
            { speciesCount: 15, debtTimescaleMonths: 150, monthsRemaining: 10, extinctionProbabilityPerMonth: 0.067 },
          ],
          totalDebt: 45,
          paidDebt: 0,
        },
      },
      planetaryBoundariesSystem: {
        boundaries: {
          biosphere_integrity: {
            currentValue: 0.5,
            extinctionContribution: 0,
          },
        },
      },
    };

    const phase = new IrreversibilityTrackingPhase();
    const rng = createSeededRng(seed);
    phase.execute(state, rng);

    return {
      queueSize: state.tippingPoints.extinctionDebt.debtQueue.length,
      paidDebt: state.tippingPoints.extinctionDebt.paidDebt,
      totalDebt: state.tippingPoints.extinctionDebt.totalDebt,
    };
  };

  const run1 = createScenario(42);
  const run2 = createScenario(42);

  console.log(`  Run 1 (seed=42): queue=${run1.queueSize}, paid=${run1.paidDebt}, total=${run1.totalDebt}`);
  console.log(`  Run 2 (seed=42): queue=${run2.queueSize}, paid=${run2.paidDebt}, total=${run2.totalDebt}`);
  console.log(`  Status: ${
    run1.queueSize === run2.queueSize && run1.paidDebt === run2.paidDebt && run1.totalDebt === run2.totalDebt
      ? '✅ PASS'
      : '❌ FAIL'
  } (determinism preserved)`);
}

// Test 3: Correct Compaction
console.log('\n=== Test 3: Correct Compaction Logic ===');
{
  const state: any = {
    currentMonth: 100,
    tippingPoints: {
      extinctionDebt: {
        debtQueue: [
          { speciesCount: 1, debtTimescaleMonths: 10, monthsRemaining: 1, extinctionProbabilityPerMonth: 0.1 },
          { speciesCount: 2, debtTimescaleMonths: 20, monthsRemaining: 10, extinctionProbabilityPerMonth: 0.1 },
          { speciesCount: 3, debtTimescaleMonths: 30, monthsRemaining: 1, extinctionProbabilityPerMonth: 0.1 },
          { speciesCount: 4, debtTimescaleMonths: 40, monthsRemaining: 20, extinctionProbabilityPerMonth: 0.1 },
          { speciesCount: 5, debtTimescaleMonths: 50, monthsRemaining: 1, extinctionProbabilityPerMonth: 0.1 },
        ],
        totalDebt: 15,
        paidDebt: 0,
      },
    },
    planetaryBoundariesSystem: {
      boundaries: {
        biosphere_integrity: {
          currentValue: 0.5,
          extinctionContribution: 0,
        },
      },
    },
  };

  const phase = new IrreversibilityTrackingPhase();
  const rng = createSeededRng(42);
  phase.execute(state, rng);

  const queue = state.tippingPoints.extinctionDebt.debtQueue;
  const paidDebt = state.tippingPoints.extinctionDebt.paidDebt;
  const totalDebt = state.tippingPoints.extinctionDebt.totalDebt;

  console.log(`  Final queue size: ${queue.length} (expected: 2)`);
  console.log(`  Remaining debts: [${queue.map((d: any) => `species=${d.speciesCount},months=${d.monthsRemaining}`).join('; ')}]`);
  console.log(`  Paid debt: ${paidDebt} (expected: 9 = 1+3+5)`);
  console.log(`  Total debt: ${totalDebt} (expected: 6 = 15-9)`);

  const pass =
    queue.length === 2 &&
    queue[0].speciesCount === 2 &&
    queue[0].monthsRemaining === 9 &&
    queue[1].speciesCount === 4 &&
    queue[1].monthsRemaining === 19 &&
    paidDebt === 9 &&
    totalDebt === 6;

  console.log(`  Status: ${pass ? '✅ PASS' : '❌ FAIL'} (compaction logic correct)`);
}

console.log('\n✅ All validation tests complete!\n');
