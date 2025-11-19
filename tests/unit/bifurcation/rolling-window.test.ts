/**
 * Test: Bifurcation time series rolling window (HIGH-1 fix, Nov 14, 2025)
 *
 * Verifies that amplificationTimeSeries implements bounded memory via rolling window.
 * Prevents memory exhaustion in long simulations (1000+ months, Monte Carlo N=100).
 *
 * @see /reviews/architecture_review_20251113.md - Memory leak identified
 * @see /src/simulation/engine/phases/BifurcationLogicPhase.ts - Rolling window implementation
 */

import { describe, it, expect } from 'vitest';
import { createDefaultInitialState } from '../../../src/simulation/initialization';
import { SimulationEngine } from '../../../src/simulation/engine';
import type { GameState } from '../../../src/types/game';

describe('Bifurcation Rolling Window (HIGH-1)', () => {
  it('should enforce rolling window with default maxLength=200', () => {
    // Create state with default config (rolling window enabled, max 200)
    const state = createDefaultInitialState({ seed: 12345 });

    // Verify default config
    expect(state.config.bifurcationDiagnostics?.enabled ?? true).toBe(true);
    expect(state.config.bifurcationDiagnostics?.maxTimeSeriesLength ?? 200).toBe(200);

    const engine = new SimulationEngine();

    // Run 300 steps (exceeds default window of 200)
    for (let i = 0; i < 300; i++) {
      engine.step(state);
    }

    const timeSeries = state.bifurcationState.metrics?.amplificationTimeSeries || [];

    // Should cap at 200 entries (not 300)
    expect(timeSeries.length).toBeLessThanOrEqual(200);

    // Should contain RECENT data (months 100-299, not 0-199)
    const firstMonth = timeSeries[0]?.month || 0;
    const lastMonth = timeSeries[timeSeries.length - 1]?.month || 0;

    // First entry should be from later in simulation (not month 0)
    expect(firstMonth).toBeGreaterThan(50); // Oldest kept entry should be recent

    // Last entry should be the most recent month
    expect(lastMonth).toBe(299);

    console.log(`✅ Rolling window verified: ${timeSeries.length} entries, months ${firstMonth}-${lastMonth}`);
  });

  it('should respect custom maxTimeSeriesLength', () => {
    // Create state with custom window size
    const state = createDefaultInitialState({ seed: 12345 });
    state.config.bifurcationDiagnostics = {
      enabled: true,
      maxTimeSeriesLength: 50, // Custom small window
    };

    const engine = new SimulationEngine();

    // Run 100 steps (exceeds custom window of 50)
    for (let i = 0; i < 100; i++) {
      engine.step(state);
    }

    const timeSeries = state.bifurcationState.metrics?.amplificationTimeSeries || [];

    // Should cap at 50 entries (not 100)
    expect(timeSeries.length).toBeLessThanOrEqual(50);

    console.log(`✅ Custom window verified: ${timeSeries.length} entries (max 50)`);
  });

  it('should disable time series collection when diagnosticsEnabled=false', () => {
    // Create state with diagnostics disabled
    const state = createDefaultInitialState({ seed: 12345 });
    state.config.bifurcationDiagnostics = {
      enabled: false,
      maxTimeSeriesLength: 200, // Irrelevant when disabled
    };

    const engine = new SimulationEngine();

    // Run 100 steps
    for (let i = 0; i < 100; i++) {
      engine.step(state);
    }

    const timeSeries = state.bifurcationState.metrics?.amplificationTimeSeries || [];

    // Should have ZERO entries (collection disabled)
    expect(timeSeries.length).toBe(0);

    console.log(`✅ Disabled diagnostics verified: ${timeSeries.length} entries (expected 0)`);
  });

  it('should preserve determinism with rolling window', () => {
    // Regression test: Rolling window should not affect determinism
    // Time series is diagnostic-only, shouldn't affect simulation logic

    const seed = 99999;

    const runSimulation = (maxLength: number): GameState => {
      const state = createDefaultInitialState({ seed });
      state.config.bifurcationDiagnostics = {
        enabled: true,
        maxTimeSeriesLength: maxLength,
      };

      const engine = new SimulationEngine();

      // Run 50 steps
      for (let i = 0; i < 50; i++) {
        engine.step(state);
      }

      return state;
    };

    // Run with different window sizes
    const state1 = runSimulation(50);  // Small window
    const state2 = runSimulation(200); // Default window

    // Variance amplification should be IDENTICAL (rolling window is diagnostic-only)
    expect(state1.bifurcationState.varianceAmplification).toBe(state2.bifurcationState.varianceAmplification);
    expect(state1.bifurcationState.distanceToNearestThreshold).toBe(state2.bifurcationState.distanceToNearestThreshold);

    // Current regime should be IDENTICAL
    expect(state1.bifurcationState.currentRegime).toBe(state2.bifurcationState.currentRegime);

    console.log(`✅ Determinism verified: rolling window doesn't affect simulation logic`);
  });

  it('should handle edge case: maxTimeSeriesLength=0 (no collection)', () => {
    // Edge case: maxLength=0 should disable collection (equivalent to enabled=false)
    const state = createDefaultInitialState({ seed: 12345 });
    state.config.bifurcationDiagnostics = {
      enabled: true,
      maxTimeSeriesLength: 0, // Zero-length window
    };

    const engine = new SimulationEngine();

    // Run 10 steps
    for (let i = 0; i < 10; i++) {
      engine.step(state);
    }

    const timeSeries = state.bifurcationState.metrics?.amplificationTimeSeries || [];

    // Should have ZERO entries (window size 0 → no collection)
    expect(timeSeries.length).toBe(0);

    console.log(`✅ Edge case verified: maxTimeSeriesLength=0 disables collection`);
  });
});
