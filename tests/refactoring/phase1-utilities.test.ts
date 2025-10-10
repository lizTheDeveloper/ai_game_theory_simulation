/**
 * Phase 1 Regression Tests: Shared Utilities
 *
 * Validates that extracted utility functions behave correctly and consistently.
 */

import { describe, test, expect } from '@jest/globals';
import {
  clamp,
  lerp,
  inverseLerp,
  mapRange,
  weightedAverage,
  getAverageAICapability,
  getAverageAlignment,
  getTotalAICapability,
  getActiveAIs,
  getAlignedAIs,
  getMisalignedAIs,
  calculateAverageCapability,
  calculateAverageAlignment
} from '@/simulation/utils';
import { GameState, AIAgent } from '@/types/game';

describe('Phase 1: Math Utilities', () => {
  describe('clamp', () => {
    test('clamps value to min', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    test('clamps value to max', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    test('returns value when in range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    test('handles edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    test('returns start value at t=0', () => {
      expect(lerp(0, 100, 0)).toBe(0);
    });

    test('returns end value at t=1', () => {
      expect(lerp(0, 100, 1)).toBe(100);
    });

    test('returns midpoint at t=0.5', () => {
      expect(lerp(0, 100, 0.5)).toBe(50);
    });

    test('clamps t to [0,1]', () => {
      expect(lerp(0, 100, -0.5)).toBe(0);
      expect(lerp(0, 100, 1.5)).toBe(100);
    });
  });

  describe('inverseLerp', () => {
    test('returns 0 for start value', () => {
      expect(inverseLerp(0, 100, 0)).toBe(0);
    });

    test('returns 1 for end value', () => {
      expect(inverseLerp(0, 100, 100)).toBe(1);
    });

    test('returns 0.5 for midpoint', () => {
      expect(inverseLerp(0, 100, 50)).toBe(0.5);
    });

    test('clamps result to [0,1]', () => {
      expect(inverseLerp(0, 100, -50)).toBe(0);
      expect(inverseLerp(0, 100, 150)).toBe(1);
    });
  });

  describe('mapRange', () => {
    test('maps value from one range to another', () => {
      expect(mapRange(50, 0, 100, 0, 1)).toBe(0.5);
      expect(mapRange(25, 0, 100, 0, 10)).toBe(2.5);
    });

    test('handles inverse ranges', () => {
      expect(mapRange(50, 0, 100, 100, 0)).toBe(50);
    });
  });

  describe('weightedAverage', () => {
    test('calculates weighted average correctly', () => {
      const values: [number, number][] = [
        [10, 1],
        [20, 2],
        [30, 1]
      ];
      expect(weightedAverage(values)).toBe(20); // (10*1 + 20*2 + 30*1) / 4 = 80/4
    });

    test('returns 0 for zero total weight', () => {
      expect(weightedAverage([[10, 0], [20, 0]])).toBe(0);
    });

    test('handles single value', () => {
      expect(weightedAverage([[42, 1]])).toBe(42);
    });
  });
});

describe('Phase 1: AI Utilities', () => {
  const createMockAI = (id: string, capability: number, alignment: number, lifecycle: 'active' | 'retired' = 'active'): AIAgent => ({
    id,
    name: `AI-${id}`,
    capability,
    alignment,
    trueAlignment: alignment,
    lifecycleState: lifecycle,
    monthsExisted: 0,
    cognitiveCapability: capability,
    physicalCapability: capability,
    socialCapability: capability,
    deploymentScale: 1,
    trainingMonthsRemaining: 0
  } as AIAgent);

  const createMockState = (agents: AIAgent[]): GameState => ({
    aiAgents: agents
  } as GameState);

  describe('getAverageAICapability', () => {
    test('calculates average capability correctly', () => {
      const state = createMockState([
        createMockAI('1', 1.0, 0.8),
        createMockAI('2', 2.0, 0.7),
        createMockAI('3', 3.0, 0.9)
      ]);
      expect(getAverageAICapability(state)).toBe(2.0);
    });

    test('returns 0 for no agents', () => {
      const state = createMockState([]);
      expect(getAverageAICapability(state)).toBe(0);
    });

    test('includes retired agents', () => {
      const state = createMockState([
        createMockAI('1', 1.0, 0.8),
        createMockAI('2', 2.0, 0.7, 'retired')
      ]);
      expect(getAverageAICapability(state)).toBe(1.5);
    });
  });

  describe('getAverageAlignment', () => {
    test('calculates average alignment correctly', () => {
      const state = createMockState([
        createMockAI('1', 1.0, 0.6),
        createMockAI('2', 2.0, 0.8),
        createMockAI('3', 3.0, 1.0)
      ]);
      expect(getAverageAlignment(state)).toBe(0.8);
    });

    test('returns 0.5 for no agents (neutral default)', () => {
      const state = createMockState([]);
      expect(getAverageAlignment(state)).toBe(0.5);
    });
  });

  describe('getTotalAICapability', () => {
    test('sums all capabilities', () => {
      const state = createMockState([
        createMockAI('1', 1.0, 0.8),
        createMockAI('2', 2.0, 0.7),
        createMockAI('3', 3.0, 0.9)
      ]);
      expect(getTotalAICapability(state)).toBe(6.0);
    });

    test('returns 0 for no agents', () => {
      const state = createMockState([]);
      expect(getTotalAICapability(state)).toBe(0);
    });
  });

  describe('getActiveAIs', () => {
    test('filters out retired agents', () => {
      const state = createMockState([
        createMockAI('1', 1.0, 0.8, 'active'),
        createMockAI('2', 2.0, 0.7, 'retired'),
        createMockAI('3', 3.0, 0.9, 'active')
      ]);
      const active = getActiveAIs(state);
      expect(active.length).toBe(2);
      expect(active.map(ai => ai.id)).toEqual(['1', '3']);
    });
  });

  describe('getAlignedAIs', () => {
    test('filters AIs above threshold', () => {
      const state = createMockState([
        createMockAI('1', 1.0, 0.6),
        createMockAI('2', 2.0, 0.8),
        createMockAI('3', 3.0, 0.9)
      ]);
      const aligned = getAlignedAIs(state, 0.7);
      expect(aligned.length).toBe(2);
      expect(aligned.map(ai => ai.id)).toEqual(['2', '3']);
    });

    test('uses default threshold of 0.7', () => {
      const state = createMockState([
        createMockAI('1', 1.0, 0.6),
        createMockAI('2', 2.0, 0.8)
      ]);
      const aligned = getAlignedAIs(state);
      expect(aligned.length).toBe(1);
    });
  });

  describe('getMisalignedAIs', () => {
    test('filters AIs below threshold', () => {
      const state = createMockState([
        createMockAI('1', 1.0, 0.3),
        createMockAI('2', 2.0, 0.6),
        createMockAI('3', 3.0, 0.9)
      ]);
      const misaligned = getMisalignedAIs(state, 0.5);
      expect(misaligned.length).toBe(1);
      expect(misaligned[0].id).toBe('1');
    });
  });

  describe('calculateAverageCapability', () => {
    test('calculates average from array', () => {
      const agents = [
        createMockAI('1', 1.0, 0.8),
        createMockAI('2', 3.0, 0.7)
      ];
      expect(calculateAverageCapability(agents)).toBe(2.0);
    });

    test('returns 0 for empty array', () => {
      expect(calculateAverageCapability([])).toBe(0);
    });
  });

  describe('calculateAverageAlignment', () => {
    test('calculates average from array', () => {
      const agents = [
        createMockAI('1', 1.0, 0.6),
        createMockAI('2', 2.0, 0.8)
      ];
      expect(calculateAverageAlignment(agents)).toBe(0.7);
    });

    test('returns 0.5 for empty array', () => {
      expect(calculateAverageAlignment([])).toBe(0.5);
    });
  });
});
