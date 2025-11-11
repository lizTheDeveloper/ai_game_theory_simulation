/**
 * Integration Test: CRITICAL-1 AI Capability Integer Rounding Regression Prevention
 *
 * Bug: AI capabilities were fractional instead of integers
 * Impact: Invalid discrete capability levels (expected [0-5], got 2.1727...)
 * Priority: MEDIUM (data integrity)
 *
 * Root Cause: Missing Math.round() in capability scaling operations:
 * - scaleCapabilityProfile()
 * - createAIAgent()
 * - lifecycle.ts updates
 *
 * Example:
 * ```typescript
 * // ❌ BAD - Fractional capabilities
 * agent.capabilityProfile.physical = targetTotal * profile.physical;  // 10 * 0.21727 = 2.1727
 *
 * // ✅ GOOD - Integer capabilities
 * agent.capabilityProfile.physical = Math.round(targetTotal * profile.physical);  // = 2
 * ```
 *
 * This test ensures all AI capabilities remain integers [0-5] throughout simulation.
 *
 * Research Context:
 * - AI capabilities are discrete levels (Bostrom 2014, Russell 2019)
 * - Each level represents qualitative breakthrough (GPT-3→GPT-4→AGI)
 * - Fractional capabilities have no semantic meaning
 * - Integer constraint critical for capability-based branching logic
 *
 * @module tests/integration/regressions/critical-1-ai-capability-rounding
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { AILifecyclePhase } from '@/simulation/engine/phases/AILifecyclePhase';
import type { GameState } from '@/types/game';

describe('CRITICAL-1 AI Capability Integer Rounding Regression Prevention', () => {
  const TEST_SEED = 42000;

  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  /**
   * Create a minimal valid phase context
   */
  function createPhaseContext(month: number): any {
    return {
      month,
      data: new Map(),
      executedPhases: new Set(),
    };
  }

  /**
   * Check if a number is an integer
   */
  function isInteger(value: number): boolean {
    return Number.isInteger(value);
  }

  /**
   * Get all numeric capability dimension names (excludes 'research' which is nested object)
   */
  function getCapabilityDimensions() {
    return [
      'physical',
      'digital',
      'cognitive',
      'social',
      'economic',
      'selfImprovement',
    ];
  }

  describe('Initialization: Capability Integrity', () => {
    test('all AI agents start with integer capabilities', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      assert.ok(state.aiAgents.length > 0, 'Should have AI agents');

      for (const agent of state.aiAgents) {
        const dimensions = getCapabilityDimensions();

        for (const dim of dimensions) {
          const value = agent.capabilityProfile[dim as keyof typeof agent.capabilityProfile];

          assert.ok(
            isInteger(value),
            `Agent ${agent.id} capability ${dim} should be integer. Got: ${value}`
          );

          assert.ok(
            value >= 0 && value <= 5,
            `Agent ${agent.id} capability ${dim} should be [0-5]. Got: ${value}`
          );
        }
      }
    });

    test('no fractional capabilities after initialization', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      for (const agent of state.aiAgents) {
        const capabilityProfile = agent.capabilityProfile;

        // Check that no capability is fractional
        Object.entries(capabilityProfile).forEach(([dim, value]) => {
          if (typeof value === 'number') {
            const fractionalPart = value - Math.floor(value);
            assert.strictEqual(
              fractionalPart,
              0,
              `Agent ${agent.id} capability ${dim} has fractional part: ${fractionalPart}`
            );
          }
        });
      }
    });
  });

  describe('Phase Execution: Capability Updates', () => {
    test('AILifecyclePhase maintains integer capabilities', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      // Advance to month 6 so AI agents have some lifecycle updates
      state.currentMonth = 6;

      const phase = new AILifecyclePhase();
      phase.execute(state, createTestRng(TEST_SEED + 10), createPhaseContext(state.currentMonth));

      // Verify all capabilities are still integers
      for (const agent of state.aiAgents) {
        const dimensions = getCapabilityDimensions();

        for (const dim of dimensions) {
          const value = agent.capabilityProfile[dim as keyof typeof agent.capabilityProfile];

          assert.ok(
            isInteger(value),
            `After AILifecyclePhase: Agent ${agent.id} capability ${dim} should be integer. Got: ${value}`
          );
        }
      }
    });

    test('capability updates over 12 months maintain integers', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const phase = new AILifecyclePhase();

      // Run 12 months of updates
      for (let month = 0; month < 12; month++) {
        state.currentMonth = month;
        phase.execute(state, createTestRng(TEST_SEED + month), createPhaseContext(month));
      }

      // Verify all capabilities are integers after 12 months
      for (const agent of state.aiAgents) {
        const dimensions = getCapabilityDimensions();

        for (const dim of dimensions) {
          const value = agent.capabilityProfile[dim as keyof typeof agent.capabilityProfile];

          assert.ok(
            isInteger(value),
            `After 12 months: Agent ${agent.id} capability ${dim} should be integer. Got: ${value}`
          );

          assert.ok(
            value >= 0 && value <= 5,
            `After 12 months: Agent ${agent.id} capability ${dim} should be [0-5]. Got: ${value}`
          );
        }
      }
    });
  });

  describe('Capability Bounds: [0, 5] Enforcement', () => {
    test('no capabilities exceed maximum (5)', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const phase = new AILifecyclePhase();

      // Run multiple months to allow growth
      for (let month = 0; month < 24; month++) {
        state.currentMonth = month;
        phase.execute(state, createTestRng(TEST_SEED + month), createPhaseContext(month));
      }

      for (const agent of state.aiAgents) {
        const dimensions = getCapabilityDimensions();

        for (const dim of dimensions) {
          const value = agent.capabilityProfile[dim as keyof typeof agent.capabilityProfile];

          assert.ok(
            value <= 5,
            `Agent ${agent.id} capability ${dim} exceeds maximum (5). Got: ${value}`
          );
        }
      }
    });

    test('no capabilities go negative', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const phase = new AILifecyclePhase();

      // Run multiple months
      for (let month = 0; month < 12; month++) {
        state.currentMonth = month;
        phase.execute(state, createTestRng(TEST_SEED + month), createPhaseContext(month));
      }

      for (const agent of state.aiAgents) {
        const dimensions = getCapabilityDimensions();

        for (const dim of dimensions) {
          const value = agent.capabilityProfile[dim as keyof typeof agent.capabilityProfile];

          assert.ok(
            value >= 0,
            `Agent ${agent.id} capability ${dim} is negative. Got: ${value}`
          );
        }
      }
    });
  });

  describe('Anti-Pattern Detection', () => {
    test('no fractional arithmetic without rounding', () => {
      // This test verifies the code does NOT have patterns like:
      //
      // capability = targetTotal * profile.physical;  // ❌ Fractional result
      //
      // Instead it should use:
      // capability = Math.round(targetTotal * profile.physical);  // ✅ Integer
      //
      // Verified by checking no capabilities are fractional after updates

      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const phase = new AILifecyclePhase();

      // Run 6 months of updates (enough for some capability changes)
      for (let month = 0; month < 6; month++) {
        state.currentMonth = month;
        phase.execute(state, createTestRng(TEST_SEED + month), createPhaseContext(month));
      }

      let foundFractional = false;
      const fractionalCapabilities: string[] = [];

      for (const agent of state.aiAgents) {
        const dimensions = getCapabilityDimensions();

        for (const dim of dimensions) {
          const value = agent.capabilityProfile[dim as keyof typeof agent.capabilityProfile];
          const fractionalPart = value - Math.floor(value);

          if (fractionalPart !== 0) {
            foundFractional = true;
            fractionalCapabilities.push(`${agent.id}.${dim} = ${value}`);
          }
        }
      }

      assert.ok(
        !foundFractional,
        `Found fractional capabilities (missing Math.round): ${fractionalCapabilities.join(', ')}`
      );
    });

    test('capability scaling operations produce integers', () => {
      const state = createDefaultInitialState(createTestRng(TEST_SEED));

      // Check initial state (tests scaleCapabilityProfile() and createAIAgent())
      for (const agent of state.aiAgents) {
        const dimensions = getCapabilityDimensions();

        for (const dim of dimensions) {
          const value = agent.capabilityProfile[dim as keyof typeof agent.capabilityProfile];

          assert.strictEqual(
            value,
            Math.round(value),
            `Capability scaling produced fractional value: ${agent.id}.${dim} = ${value}`
          );
        }
      }
    });
  });

  describe('Semantic Validity: Discrete Levels', () => {
    test('capabilities represent discrete milestones', () => {
      // Capabilities should be discrete milestones:
      // 0 = None
      // 1 = Basic (GPT-2 level)
      // 2 = Capable (GPT-3 level)
      // 3 = Advanced (GPT-4 level)
      // 4 = Expert (Near-human)
      // 5 = Superhuman (AGI)
      //
      // Fractional values like 2.17 have no semantic meaning

      const state = createDefaultInitialState(createTestRng(TEST_SEED));
      const validLevels = [0, 1, 2, 3, 4, 5];

      for (const agent of state.aiAgents) {
        const dimensions = getCapabilityDimensions();

        for (const dim of dimensions) {
          const value = agent.capabilityProfile[dim as keyof typeof agent.capabilityProfile];

          assert.ok(
            validLevels.includes(value),
            `Agent ${agent.id} capability ${dim} is not a valid discrete level [0-5]. Got: ${value}`
          );
        }
      }
    });
  });
});
