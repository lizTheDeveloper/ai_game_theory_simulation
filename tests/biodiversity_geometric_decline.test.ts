/**
 * Integration Test: Biodiversity Geometric Decline (HIGH-11)
 *
 * Regression prevention for geometric vs linear decline formula.
 * Ensures hindcast 1990-2024 produces 48.99% ± 5% (target: 49.00%).
 *
 * Context: HIGH-11 fix (Nov 28, 2025) changed from linear to geometric decline.
 * The linear formula was offset by unguarded recovery, coincidentally producing
 * correct results. This test ensures the geometric formula remains correct.
 */

import { describe, it, expect } from 'vitest';
import { createHistoricalInitialState } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';

describe('HIGH-11: Biodiversity Geometric Decline', () => {
  it('should produce 49% biodiversity after 408 months (1990-2024)', async () => {
    // Setup: Create 1990 historical state
    const engine = new SimulationEngine({ seed: 19900102 });
    const rng = engine.getRNG().next.bind(engine.getRNG());

    const state = await createHistoricalInitialState({
      year: 1990,
      rng,
      includeAIAgents: false,
      scenarioMode: 'historical'
    });

    // Verify initialization
    expect(state.currentYear).toBe(1990);
    expect(state.config.scenarioMode).toBe('historical');

    const initialBio = state.environmentalAccumulation.biodiversityIndex;
    expect(initialBio).toBeGreaterThan(0.75); // Should be ~76.79% (1990 from 1970 baseline)
    expect(initialBio).toBeLessThan(0.78);

    // Run simulation for 34 years (408 months)
    const TARGET_MONTH = 408;
    for (let i = 0; i < TARGET_MONTH; i++) {
      engine.step(state);
    }

    // Verify final biodiversity matches WWF LPI target
    const finalBio = state.environmentalAccumulation.biodiversityIndex;
    const TARGET_BIO = 0.49; // 49% (WWF LPI 2024)
    const error = Math.abs(finalBio - TARGET_BIO) / TARGET_BIO;

    expect(finalBio).toBeGreaterThan(0.46); // 49% - 5% threshold
    expect(finalBio).toBeLessThan(0.52); // 49% + 5% threshold
    expect(error).toBeLessThan(0.05); // Error < 5%
  }, 300000); // 5 minute timeout

  it('should use geometric decline (constant relative rate)', async () => {
    // This test verifies the decline is GEOMETRIC (percentage of current value)
    // not LINEAR (constant absolute amount)

    const engine = new SimulationEngine({ seed: 19900103 });
    const rng = engine.getRNG().next.bind(engine.getRNG());

    const state = await createHistoricalInitialState({
      year: 1990,
      rng,
      includeAIAgents: false,
      scenarioMode: 'historical'
    });

    const initialBio = state.environmentalAccumulation.biodiversityIndex;

    // Run for 12 months (1 year)
    const monthlyChanges: number[] = [];
    for (let i = 0; i < 12; i++) {
      const before = state.environmentalAccumulation.biodiversityIndex;
      engine.step(state);
      const after = state.environmentalAccumulation.biodiversityIndex;

      const relativeChange = (after - before) / before;
      monthlyChanges.push(relativeChange);
    }

    // Geometric decline: Relative change should be CONSTANT
    // Linear decline: Relative change would INCREASE over time (as base shrinks)
    const avgRelativeChange = monthlyChanges.reduce((a, b) => a + b, 0) / monthlyChanges.length;

    // All monthly changes should be close to average (±10% tolerance for stochastic effects)
    for (const change of monthlyChanges) {
      const deviation = Math.abs(change - avgRelativeChange) / Math.abs(avgRelativeChange);
      expect(deviation).toBeLessThan(0.10); // 10% tolerance
    }

    // Expected relative change: -0.1022% per month
    expect(Math.abs(avgRelativeChange)).toBeGreaterThan(0.0008); // At least 0.08%
    expect(Math.abs(avgRelativeChange)).toBeLessThan(0.0015); // At most 0.15%
  }, 60000); // 1 minute timeout
});
