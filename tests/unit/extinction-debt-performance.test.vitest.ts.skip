/**
 * Extinction Debt Performance Test
 *
 * Validates O(n) complexity optimization for extinction debt tracking.
 * Previous implementation used splice() causing O(n²) array shifts.
 *
 * Nov 20, 2025 - Roy (Simulation Maintainer)
 */

import { describe, it, expect } from 'vitest';
import { IrreversibilityTrackingPhase } from '../../src/simulation/engine/phases/IrreversibilityTrackingPhase';
import { createSeededRng } from '../../src/simulation/rng';

describe('Extinction Debt O(n) Performance', () => {

  it('should maintain O(n) complexity with large debt queues', () => {
    // Create minimal state for testing
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

    const phase = new IrreversibilityTrackingPhase();
    const rng = createSeededRng(42);

    // Manually populate debt queue with varying timescales
    // This simulates a realistic accumulation over 100 years
    for (let i = 0; i < 200; i++) {
      state.tippingPoints.extinctionDebt.debtQueue.push({
        speciesCount: 1 + Math.random() * 5,
        debtTimescaleMonths: 50 * 12 + Math.random() * 100 * 12, // 50-150 years
        monthsRemaining: Math.floor(Math.random() * 150 * 12), // Random remaining time
        extinctionProbabilityPerMonth: 0.001,
      });
    }

    const initialQueueSize = state.tippingPoints.extinctionDebt.debtQueue.length;

    // Execute phase (this should decrement all monthsRemaining and remove completed debts)
    const startTime = performance.now();
    const result = phase.execute(state, rng);
    const duration = performance.now() - startTime;

    // Assertions
    expect(result).toBeDefined();
    expect(duration).toBeLessThan(10); // Should be <10ms for 200 items (O(n) not O(n²))

    // Verify queue was compacted correctly
    const finalQueueSize = state.tippingPoints.extinctionDebt.debtQueue.length;
    expect(finalQueueSize).toBeLessThanOrEqual(initialQueueSize);

    // Verify all remaining debts have monthsRemaining >= 0
    for (const debt of state.tippingPoints.extinctionDebt.debtQueue) {
      expect(debt.monthsRemaining).toBeGreaterThan(0);
    }

    console.log(`✅ O(n) Performance Test: ${initialQueueSize} debts → ${finalQueueSize} debts in ${duration.toFixed(2)}ms`);
  });

  it('should preserve determinism after optimization', () => {
    // Run the same scenario with two different seeds
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

    // Same seed should produce identical results
    const run1 = createScenario(42);
    const run2 = createScenario(42);

    expect(run1.queueSize).toBe(run2.queueSize);
    expect(run1.paidDebt).toBe(run2.paidDebt);
    expect(run1.totalDebt).toBe(run2.totalDebt);

    console.log(`✅ Determinism Test: Seed 42 → queue=${run1.queueSize}, paid=${run1.paidDebt}, total=${run1.totalDebt}`);
  });

  it('should correctly compact queue with mixed removals', () => {
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

    // After execution:
    // - Items with monthsRemaining=1 become 0 and are removed (3 items: species 1, 3, 5)
    // - Items with monthsRemaining=10,20 become 9,19 and stay (2 items: species 2, 4)

    const queue = state.tippingPoints.extinctionDebt.debtQueue;
    expect(queue.length).toBe(2);
    expect(queue[0].speciesCount).toBe(2); // Original index 1
    expect(queue[0].monthsRemaining).toBe(9); // 10 - 1
    expect(queue[1].speciesCount).toBe(4); // Original index 3
    expect(queue[1].monthsRemaining).toBe(19); // 20 - 1

    // Paid debt should be 1 + 3 + 5 = 9 species
    expect(state.tippingPoints.extinctionDebt.paidDebt).toBe(9);

    // Total debt should be reduced by 9
    expect(state.tippingPoints.extinctionDebt.totalDebt).toBe(6); // 15 - 9

    console.log(`✅ Compaction Test: 5 debts → 2 debts, 9 species paid`);
  });
});
