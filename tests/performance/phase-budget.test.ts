/**
 * Performance Budget Regression Tests (HIGH-1 Phase 1)
 *
 * Ensures phases remain within performance budgets.
 * Uses PhaseOrchestrator's built-in instrumentation.
 *
 * BUDGET: 10ms per phase (average), 50ms per step (average)
 *
 * Created: Nov 13, 2025
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';

describe('Performance Budget Tests', () => {
  let phaseTimings: Map<string, {
    totalMs: number;
    callCount: number;
    minMs: number;
    maxMs: number;
    samples: number[];
  }>;
  let stepTimings: { month: number; totalMs: number }[];

  beforeAll(() => {
    // Run simulation with profiling enabled (12 months for quick test)
    const seed = 42;

    // Simple RNG function for initialization (DETERMINISM: seeded)
    let rngSeed = seed;
    const rngFunction = () => {
      rngSeed = (rngSeed * 1664525 + 1013904223) % (2**32);
      return rngSeed / (2**32);
    };

    const initialState = createDefaultInitialState(rngFunction);
    const engine = new SimulationEngine({ seed, maxMonths: 12, logLevel: 'summary' });

    // Enable performance timing
    engine.orchestrator.enablePerformanceTiming();
    engine.orchestrator.setSlowPhaseThreshold(10);

    // Run simulation for 12 months
    let currentState = initialState;
    for (let month = 0; month < 12; month++) {
      const result = engine.step(currentState);
      currentState = result.state;
    }

    // Get timing data
    phaseTimings = engine.orchestrator.getPhaseTimings();
    stepTimings = engine.orchestrator.getStepTimings();
  });

  describe('Phase Performance Budget', () => {
    it('should have timing data collected', () => {
      expect(phaseTimings.size).toBeGreaterThan(0);
      expect(stepTimings.length).toBeGreaterThan(0);
    });

    it('should have all phases with average < 10ms (or documented exceptions)', () => {
      // Phases that are ALLOWED to exceed 10ms (with justification)
      const allowedExceptions = new Set<string>([
        // Add phase names here if they have legitimate reasons to exceed 10ms
        // Example: 'ComputeInfrastructurePhase' (complex calculations on large datasets)
      ]);

      const violations: Array<{ name: string; avgMs: number }> = [];

      for (const [name, data] of phaseTimings.entries()) {
        const avgMs = data.totalMs / data.callCount;

        if (avgMs > 10 && !allowedExceptions.has(name)) {
          violations.push({ name, avgMs });
        }
      }

      if (violations.length > 0) {
        const violationList = violations
          .sort((a, b) => b.avgMs - a.avgMs)
          .map(v => `  - ${v.name}: ${v.avgMs.toFixed(2)}ms (${((v.avgMs / 10) * 100).toFixed(0)}% of budget)`)
          .join('\n');

        throw new Error(
          `❌ Performance budget violations detected:\n\n` +
          `${violationList}\n\n` +
          `These phases exceed the 10ms average budget. Either:\n` +
          `1. Optimize the phase implementation (see plan HIGH-1)\n` +
          `2. Add to allowedExceptions with justification (only if legitimately complex)\n`
        );
      }
    });

    it('should have no phases with P95 > 15ms (generous variance allowance)', () => {
      const calculateP95 = (samples: number[]): number => {
        if (samples.length === 0) return 0;
        const sorted = [...samples].sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * 0.95) - 1;
        return sorted[Math.max(0, index)];
      };

      const violations: Array<{ name: string; p95Ms: number }> = [];

      for (const [name, data] of phaseTimings.entries()) {
        const p95Ms = calculateP95(data.samples);

        if (p95Ms > 15) {
          violations.push({ name, p95Ms });
        }
      }

      if (violations.length > 0) {
        const violationList = violations
          .sort((a, b) => b.p95Ms - a.p95Ms)
          .map(v => `  - ${v.name}: P95 ${v.p95Ms.toFixed(2)}ms`)
          .join('\n');

        throw new Error(
          `❌ P95 variance violations detected:\n\n` +
          `${violationList}\n\n` +
          `These phases have high variance (P95 > 15ms). This indicates:\n` +
          `1. O(n²) behavior as entity counts grow\n` +
          `2. Unpredictable performance spikes\n` +
          `Optimize these phases to reduce variance.\n`
        );
      }
    });
  });

  describe('Step Performance Budget', () => {
    it('should have all steps with < 50ms average', () => {
      const stepTotals = stepTimings.map(s => s.totalMs);
      const avgStep = stepTotals.reduce((a, b) => a + b, 0) / stepTotals.length;

      expect(avgStep).toBeLessThan(50);

      if (avgStep >= 50) {
        throw new Error(
          `❌ Step performance budget exceeded:\n` +
          `   Average: ${avgStep.toFixed(2)}ms\n` +
          `   Budget: 50ms\n` +
          `   Violation: ${((avgStep / 50) * 100).toFixed(0)}% of budget\n\n` +
          `This will make Monte Carlo simulations slow. Target: <50ms per step.`
        );
      }
    });

    it('should have no steps > 100ms (max budget)', () => {
      const slowSteps = stepTimings.filter(s => s.totalMs > 100);

      if (slowSteps.length > 0) {
        const stepList = slowSteps
          .sort((a, b) => b.totalMs - a.totalMs)
          .map(s => `  - Month ${s.month}: ${s.totalMs.toFixed(2)}ms`)
          .join('\n');

        throw new Error(
          `❌ Step max budget violations:\n\n` +
          `${stepList}\n\n` +
          `These steps exceed 100ms. This indicates performance spikes that will\n` +
          `cause unacceptable delays during Monte Carlo runs. Investigate these months.`
        );
      }
    });

    it('should have consistent step times (max/avg ratio < 3)', () => {
      const stepTotals = stepTimings.map(s => s.totalMs);
      const avgStep = stepTotals.reduce((a, b) => a + b, 0) / stepTotals.length;
      const maxStep = Math.max(...stepTotals);
      const ratio = maxStep / avgStep;

      expect(ratio).toBeLessThan(3);

      if (ratio >= 3) {
        const slowestMonth = stepTimings.find(s => s.totalMs === maxStep);
        throw new Error(
          `❌ Step performance variance too high:\n` +
          `   Avg: ${avgStep.toFixed(2)}ms\n` +
          `   Max: ${maxStep.toFixed(2)}ms (Month ${slowestMonth?.month})\n` +
          `   Ratio: ${ratio.toFixed(2)}x\n\n` +
          `High variance indicates unpredictable scaling. Investigate Month ${slowestMonth?.month}.`
        );
      }
    });
  });

  describe('Performance Characteristics', () => {
    it('should report timing statistics for debugging', () => {
      const stepTotals = stepTimings.map(s => s.totalMs);
      const avgStep = stepTotals.reduce((a, b) => a + b, 0) / stepTotals.length;
      const maxStep = Math.max(...stepTotals);
      const minStep = Math.min(...stepTotals);

      // Calculate total phase time
      let totalPhaseTime = 0;
      for (const [_, data] of phaseTimings.entries()) {
        totalPhaseTime += data.totalMs;
      }

      // Top 5 slowest phases
      const sortedPhases = Array.from(phaseTimings.entries())
        .map(([name, data]) => ({
          name,
          avgMs: data.totalMs / data.callCount,
          totalMs: data.totalMs
        }))
        .sort((a, b) => b.totalMs - a.totalMs)
        .slice(0, 5);

      console.log('\n📊 Performance Profile:');
      console.log('  Steps:');
      console.log(`    Avg: ${avgStep.toFixed(2)}ms`);
      console.log(`    Max: ${maxStep.toFixed(2)}ms`);
      console.log(`    Min: ${minStep.toFixed(2)}ms`);
      console.log(`  Top 5 slowest phases:`);
      sortedPhases.forEach(p => {
        const pct = (p.totalMs / totalPhaseTime * 100).toFixed(1);
        console.log(`    - ${p.name}: ${p.avgMs.toFixed(2)}ms avg (${pct}% of total)`);
      });

      // Always pass (this is informational)
      expect(true).toBe(true);
    });
  });
});
