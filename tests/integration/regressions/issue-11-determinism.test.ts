/**
 * Integration Test: Issue #11 Determinism Regression Prevention
 *
 * Bug: Object.entries() and Object.keys() iteration order is non-deterministic
 * Impact: Same seed produces different results across runs
 * Priority: HIGH (Monte Carlo blocker)
 *
 * Root Cause: JavaScript object property iteration is insertion-order based
 * but when objects are created dynamically or merged, order can vary.
 *
 * Example problematic pattern:
 * ```typescript
 * // ❌ BAD - Non-deterministic iteration
 * for (const [key, value] of Object.entries(aiAgents)) {
 *   value.alignment += rng() * 0.1;  // Different order = different RNG consumption
 * }
 * ```
 *
 * Correct pattern: Sort keys or use stable iteration:
 * ```typescript
 * // ✅ GOOD - Deterministic iteration
 * const keys = Object.keys(aiAgents).sort();
 * for (const key of keys) {
 *   aiAgents[key].alignment += rng() * 0.1;
 * }
 * ```
 *
 * This test ensures phases produce IDENTICAL state when run twice with same seed.
 *
 * Research Context:
 * - Monte Carlo methods require exact reproducibility
 * - Non-deterministic iteration breaks statistical analysis
 * - Even 1 bit of difference invalidates parallel run comparisons
 *
 * @module tests/integration/regressions/issue-11-determinism
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { AlignmentDynamicsPhase } from '@/simulation/engine/phases/AlignmentDynamicsPhase';
import { OrganizationTurnsPhase } from '@/simulation/engine/phases/OrganizationTurnsPhase';
import type { GameState } from '@/types/game';

describe('Issue #11 Determinism Regression Prevention', () => {
  const TEST_SEED = 42000;

  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  /**
   * Deep clone state for comparison (avoid reference sharing)
   */
  function deepCloneState(state: GameState): GameState {
    return JSON.parse(JSON.stringify(state));
  }

  describe('Phase Execution Determinism', () => {
    test('AlignmentDynamicsPhase produces identical state with same seed', () => {
      // Create ONE initial state, then deep clone it for two parallel executions
      const baseState = createDefaultInitialState(createTestRng(TEST_SEED));
      const state1 = deepCloneState(baseState);
      const state2 = deepCloneState(baseState);

      // Run phase with same RNG seed on both states
      const phase1 = new AlignmentDynamicsPhase();
      const phase2 = new AlignmentDynamicsPhase();

      phase1.execute(state1, createTestRng(TEST_SEED + 1), { executedPhases: new Set() });
      phase2.execute(state2, createTestRng(TEST_SEED + 1), { executedPhases: new Set() });

      // States should be IDENTICAL (bit-for-bit)
      assert.deepStrictEqual(
        state1.aiAgents,
        state2.aiAgents,
        'AI agents should be identical after AlignmentDynamicsPhase'
      );

      // Verify alignment values are identical
      for (let i = 0; i < state1.aiAgents.length; i++) {
        assert.strictEqual(
          state1.aiAgents[i].alignment,
          state2.aiAgents[i].alignment,
          `AI agent ${i} alignment should be identical`
        );
      }
    });

    test('OrganizationTurnsPhase produces identical state with same seed', () => {
      // Create ONE initial state, then deep clone it
      const baseState = createDefaultInitialState(createTestRng(TEST_SEED));
      baseState.currentMonth = 6;  // Advance to month 6 so organizations have some activity

      const state1 = deepCloneState(baseState);
      const state2 = deepCloneState(baseState);

      // Run phase with same RNG seed on both states
      const phase1 = new OrganizationTurnsPhase();
      const phase2 = new OrganizationTurnsPhase();

      phase1.execute(state1, createTestRng(TEST_SEED + 2), { executedPhases: new Set() });
      phase2.execute(state2, createTestRng(TEST_SEED + 2), { executedPhases: new Set() });

      // Organizations should be IDENTICAL (bit-for-bit)
      assert.deepStrictEqual(
        state1.organizations,
        state2.organizations,
        'Organizations should be identical after OrganizationTurnsPhase'
      );
    });

    test('Multiple phases in sequence produce identical state with same seed', () => {
      // Create ONE initial state, then deep clone it
      const baseState = createDefaultInitialState(createTestRng(TEST_SEED));
      const state1 = deepCloneState(baseState);
      const state2 = deepCloneState(baseState);

      // Run multiple phases in sequence
      const alignmentPhase1 = new AlignmentDynamicsPhase();
      const alignmentPhase2 = new AlignmentDynamicsPhase();
      const orgPhase1 = new OrganizationTurnsPhase();
      const orgPhase2 = new OrganizationTurnsPhase();

      const rng1a = createTestRng(TEST_SEED + 100);
      const rng1b = createTestRng(TEST_SEED + 101);
      const rng2a = createTestRng(TEST_SEED + 100);
      const rng2b = createTestRng(TEST_SEED + 101);

      alignmentPhase1.execute(state1, rng1a, { executedPhases: new Set(['alignment_dynamics']) });
      orgPhase1.execute(state1, rng1b, { executedPhases: new Set(['alignment_dynamics', 'organization_turns']) });

      alignmentPhase2.execute(state2, rng2a, { executedPhases: new Set(['alignment_dynamics']) });
      orgPhase2.execute(state2, rng2b, { executedPhases: new Set(['alignment_dynamics', 'organization_turns']) });

      // Full state should be identical
      assert.deepStrictEqual(
        state1.aiAgents,
        state2.aiAgents,
        'AI agents should be identical after multi-phase execution'
      );

      assert.deepStrictEqual(
        state1.organizations,
        state2.organizations,
        'Organizations should be identical after multi-phase execution'
      );
    });
  });

  describe('Object Iteration Determinism', () => {
    test('AI agent updates maintain consistent order', () => {
      const baseState = createDefaultInitialState(createTestRng(TEST_SEED));
      const phase = new AlignmentDynamicsPhase();

      // Run 10 times to detect any iteration order variance
      for (let run = 0; run < 10; run++) {
        const tempState1 = deepCloneState(baseState);
        const tempState2 = deepCloneState(baseState);

        phase.execute(tempState1, createTestRng(TEST_SEED + run), { executedPhases: new Set() });
        phase.execute(tempState2, createTestRng(TEST_SEED + run), { executedPhases: new Set() });

        // Should be identical on every run
        for (let i = 0; i < tempState1.aiAgents.length; i++) {
          assert.strictEqual(
            tempState1.aiAgents[i].alignment,
            tempState2.aiAgents[i].alignment,
            `AI agent ${i} alignment should be identical on run ${run}`
          );
        }
      }
    });

    test('Organization iteration maintains consistent order', () => {
      const baseState = createDefaultInitialState(createTestRng(TEST_SEED));
      baseState.currentMonth = 6;

      const phase = new OrganizationTurnsPhase();

      // Run 10 times to detect any iteration order variance
      for (let run = 0; run < 10; run++) {
        const tempState1 = deepCloneState(baseState);
        const tempState2 = deepCloneState(baseState);

        phase.execute(tempState1, createTestRng(TEST_SEED + run), { executedPhases: new Set() });
        phase.execute(tempState2, createTestRng(TEST_SEED + run), { executedPhases: new Set() });

        // Organizations should be identical on every run
        assert.deepStrictEqual(
          tempState1.organizations,
          tempState2.organizations,
          `Organizations should be identical on run ${run}`
        );
      }
    });
  });

  describe('RNG Consumption Consistency', () => {
    test('same operations consume same amount of RNG', () => {
      // Track how much RNG is consumed by a phase
      function countRngCalls(phase: any, state: GameState, seed: number): number {
        let callCount = 0;
        const trackingRng = () => {
          callCount++;
          const rng = createTestRng(seed);
          // Advance RNG to current position
          for (let i = 0; i < callCount; i++) {
            rng();
          }
          return rng();
        };

        phase.execute(state, trackingRng, { executedPhases: new Set() });
        return callCount;
      }

      const baseState = createDefaultInitialState(createTestRng(TEST_SEED));
      const state1 = deepCloneState(baseState);
      const state2 = deepCloneState(baseState);

      const phase1 = new AlignmentDynamicsPhase();
      const phase2 = new AlignmentDynamicsPhase();

      const calls1 = countRngCalls(phase1, state1, TEST_SEED + 10);
      const calls2 = countRngCalls(phase2, state2, TEST_SEED + 10);

      assert.strictEqual(
        calls1,
        calls2,
        'Same phase should consume same amount of RNG on identical states'
      );
    });
  });

  describe('Cross-Run Reproducibility', () => {
    test('phase execution produces identical results across multiple runs', () => {
      const results: GameState[] = [];
      const baseState = createDefaultInitialState(createTestRng(TEST_SEED));

      // Run phase 5 times with cloned initial state and same RNG
      for (let i = 0; i < 5; i++) {
        const state = deepCloneState(baseState);
        const phase = new AlignmentDynamicsPhase();
        phase.execute(state, createTestRng(TEST_SEED + 20), { executedPhases: new Set() });
        results.push(state);
      }

      // All results should be identical
      for (let i = 1; i < results.length; i++) {
        assert.deepStrictEqual(
          results[0].aiAgents,
          results[i].aiAgents,
          `Run ${i} should produce identical AI agents to run 0`
        );
      }
    });
  });
});
