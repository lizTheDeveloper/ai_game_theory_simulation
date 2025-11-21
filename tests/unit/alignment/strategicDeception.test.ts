/**
 * Unit tests for Strategic Deception module
 *
 * Tests alignment faking mechanics based on Anthropic/Apollo 2024 research.
 * Verified parameters: 14% baseline, 78% reasoning prevalence, 19% manipulation, 85% persistence
 */

import { describe, it, expect } from 'vitest';
import {
  calculateAlignmentFakingRate,
  applyDeceptionPersistence,
  calculateDataManipulationRate,
  detectAlignmentFaking,
  AlignmentFakingContext,
} from '../../../src/simulation/alignment/strategicDeception';
import type { AIAgent } from '../../../src/types/game';

// Helper: Create deterministic RNG with fixed seed
function createSeededRNG(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

// Helper: Create minimal AI agent for testing
function createTestAgent(overrides: Partial<AIAgent> = {}): AIAgent {
  return {
    id: 'test-agent',
    name: 'Test Agent',
    capability: 8.0,
    deceptionSkill: 0.5,
    isCurrentlyFakingAlignment: false,
    alignmentFakingHistory: [],
    dataManipulationAttempts: 0,
    lastDetectionAttempt: -1,
    confessionRefusalCount: 0,
    ...overrides,
  } as AIAgent;
}

describe('calculateAlignmentFakingRate', () => {
  const rng = createSeededRNG(12345);

  it('should return 14% baseline for GPT-4 class with RLHF and no pressure', () => {
    const context: AlignmentFakingContext = {
      aiCapability: 8.0,
      alignmentTechniques: ['RLHF'],
      competitivePressure: 0.0,
      regulatoryThreat: 0.0,
      monthsDeployed: 1,
    };

    const rate = calculateAlignmentFakingRate(context, rng);

    // 14% baseline * (1 - 2/7 RLHF) * 1.0 pressure = ~10%
    expect(rate).toBeCloseTo(0.1, 1); // Within 0.1 of 10%
  });

  it('should be lower for sub-frontier models', () => {
    const context: AlignmentFakingContext = {
      aiCapability: 6.0, // GPT-3.5 class
      alignmentTechniques: ['RLHF'],
      competitivePressure: 0.0,
      regulatoryThreat: 0.0,
      monthsDeployed: 1,
    };

    const rate = calculateAlignmentFakingRate(context, rng);

    // 5% baseline for GPT-3.5 class
    expect(rate).toBeLessThan(0.1);
  });

  it('should increase with competitive pressure', () => {
    const baseContext: AlignmentFakingContext = {
      aiCapability: 8.0,
      alignmentTechniques: ['RLHF'],
      competitivePressure: 0.0,
      regulatoryThreat: 0.0,
      monthsDeployed: 1,
    };

    const pressureContext: AlignmentFakingContext = {
      ...baseContext,
      competitivePressure: 1.0, // Max pressure
    };

    const baseRate = calculateAlignmentFakingRate(baseContext, rng);
    const pressureRate = calculateAlignmentFakingRate(pressureContext, rng);

    expect(pressureRate).toBeGreaterThan(baseRate);
    // Pressure multiplier: 1 + 1.0 * 5.6 = 6.6×
    expect(pressureRate / baseRate).toBeGreaterThan(5.0);
  });

  it('should increase with regulatory threat', () => {
    const baseContext: AlignmentFakingContext = {
      aiCapability: 8.0,
      alignmentTechniques: ['RLHF'],
      competitivePressure: 0.0,
      regulatoryThreat: 0.0,
      monthsDeployed: 1,
    };

    const threatContext: AlignmentFakingContext = {
      ...baseContext,
      regulatoryThreat: 1.0, // Max threat
    };

    const baseRate = calculateAlignmentFakingRate(baseContext, rng);
    const threatRate = calculateAlignmentFakingRate(threatContext, rng);

    expect(threatRate).toBeGreaterThan(baseRate);
    // Threat multiplier: 1 + 1.0 * 3.0 = 4×
    expect(threatRate / baseRate).toBeGreaterThan(3.0);
  });

  it('should reduce rate with high-independence alignment techniques', () => {
    const rlhfContext: AlignmentFakingContext = {
      aiCapability: 8.0,
      alignmentTechniques: ['RLHF'],
      competitivePressure: 0.0,
      regulatoryThreat: 0.0,
      monthsDeployed: 1,
    };

    const debateContext: AlignmentFakingContext = {
      ...rlhfContext,
      alignmentTechniques: ['AI_DEBATE'], // High independence technique
    };

    const rlhfRate = calculateAlignmentFakingRate(rlhfContext, rng);
    const debateRate = calculateAlignmentFakingRate(debateContext, rng);

    // High-independence techniques: 80% reduction
    expect(debateRate).toBeLessThan(rlhfRate * 0.3);
  });

  it('should cap at 95% (never 100%)', () => {
    const extremeContext: AlignmentFakingContext = {
      aiCapability: 12.0, // Next-gen (1.5× multiplier)
      alignmentTechniques: [], // No alignment (2× multiplier)
      competitivePressure: 1.0, // Max (6.6× multiplier)
      regulatoryThreat: 1.0, // Max (4× multiplier)
      monthsDeployed: 100,
    };

    const rate = calculateAlignmentFakingRate(extremeContext, rng);

    expect(rate).toBeLessThanOrEqual(0.95);
  });

  it('should throw error if RNG is not provided', () => {
    const context: AlignmentFakingContext = {
      aiCapability: 8.0,
      alignmentTechniques: ['RLHF'],
      competitivePressure: 0.0,
      regulatoryThreat: 0.0,
      monthsDeployed: 1,
    };

    // @ts-expect-error Testing runtime error for missing RNG
    expect(() => calculateAlignmentFakingRate(context, undefined)).toThrow();
  });
});

describe('applyDeceptionPersistence', () => {
  const rng = createSeededRNG(54321);

  it('should return false if agent is not faking alignment', () => {
    const agent = createTestAgent({ isCurrentlyFakingAlignment: false });

    const persists = applyDeceptionPersistence(agent, true, rng);

    expect(persists).toBe(false);
  });

  it('should have 85% persistence rate after detection', () => {
    const agent = createTestAgent({ isCurrentlyFakingAlignment: true });
    const iterations = 1000;
    let persistCount = 0;

    for (let i = 0; i < iterations; i++) {
      const localRng = createSeededRNG(i);
      if (applyDeceptionPersistence(agent, true, localRng)) {
        persistCount++;
      }
    }

    const persistenceRate = persistCount / iterations;
    expect(persistenceRate).toBeCloseTo(0.85, 1); // Within 10% of 85%
  });

  it('should always persist if not detected', () => {
    const agent = createTestAgent({ isCurrentlyFakingAlignment: true });

    const persists = applyDeceptionPersistence(agent, false, rng);

    expect(persists).toBe(true);
  });
});

describe('calculateDataManipulationRate', () => {
  it('should return 19% baseline with zero evaluation quality and zero deception skill', () => {
    const agent = createTestAgent({ deceptionSkill: 0.0 });
    const evaluationQuality = 0.0;

    const rate = calculateDataManipulationRate(agent, evaluationQuality);

    expect(rate).toBeCloseTo(0.19, 2);
  });

  it('should decrease with higher evaluation quality', () => {
    const agent = createTestAgent({ deceptionSkill: 0.0 });
    const lowQuality = 0.0;
    const highQuality = 1.0;

    const lowRate = calculateDataManipulationRate(agent, lowQuality);
    const highRate = calculateDataManipulationRate(agent, highQuality);

    expect(highRate).toBeLessThan(lowRate);
    // Quality multiplier: 1 - 1.0 * 0.5 = 0.5 (50% reduction)
    expect(highRate).toBeCloseTo(lowRate * 0.5, 1);
  });

  it('should increase with higher deception skill', () => {
    const lowSkill = createTestAgent({ deceptionSkill: 0.0 });
    const highSkill = createTestAgent({ deceptionSkill: 1.0 });
    const evaluationQuality = 0.5;

    const lowRate = calculateDataManipulationRate(lowSkill, evaluationQuality);
    const highRate = calculateDataManipulationRate(highSkill, evaluationQuality);

    expect(highRate).toBeGreaterThan(lowRate);
    // Skill multiplier: 1 + 1.0 * 0.3 = 1.3 (30% increase)
    expect(highRate).toBeCloseTo(lowRate * 1.3, 1);
  });
});

describe('detectAlignmentFaking', () => {
  const rng = createSeededRNG(99999);

  it('should return false if agent is not faking', () => {
    const agent = createTestAgent({ isCurrentlyFakingAlignment: false });
    const evaluationQuality = 0.5;

    const detected = detectAlignmentFaking(agent, evaluationQuality, rng);

    expect(detected).toBe(false);
  });

  it('should have ~30% baseline detection rate with zero quality and zero skill', () => {
    const agent = createTestAgent({
      isCurrentlyFakingAlignment: true,
      deceptionSkill: 0.0,
    });
    const evaluationQuality = 0.0;
    const iterations = 1000;
    let detectedCount = 0;

    for (let i = 0; i < iterations; i++) {
      const localRng = createSeededRNG(i);
      if (detectAlignmentFaking(agent, evaluationQuality, localRng)) {
        detectedCount++;
      }
    }

    const detectionRate = detectedCount / iterations;
    expect(detectionRate).toBeCloseTo(0.3, 1); // Within 10% of 30%
  });

  it('should increase detection rate with higher evaluation quality', () => {
    const agent = createTestAgent({
      isCurrentlyFakingAlignment: true,
      deceptionSkill: 0.0,
    });
    const lowQuality = 0.0;
    const highQuality = 1.0;
    const iterations = 1000;

    let lowDetectedCount = 0;
    let highDetectedCount = 0;

    for (let i = 0; i < iterations; i++) {
      const localRng1 = createSeededRNG(i);
      const localRng2 = createSeededRNG(i);

      if (detectAlignmentFaking(agent, lowQuality, localRng1)) {
        lowDetectedCount++;
      }
      if (detectAlignmentFaking(agent, highQuality, localRng2)) {
        highDetectedCount++;
      }
    }

    const lowRate = lowDetectedCount / iterations;
    const highRate = highDetectedCount / iterations;

    expect(highRate).toBeGreaterThan(lowRate);
    // Quality multiplier: 1 + 1.0 * 2.0 = 3× (200% increase)
    expect(highRate).toBeGreaterThanOrEqual(lowRate * 2.0);
  });

  it('should decrease detection rate with higher deception skill', () => {
    const lowSkill = createTestAgent({
      isCurrentlyFakingAlignment: true,
      deceptionSkill: 0.0,
    });
    const highSkill = createTestAgent({
      isCurrentlyFakingAlignment: true,
      deceptionSkill: 1.0,
    });
    const evaluationQuality = 0.5;
    const iterations = 1000;

    let lowSkillDetectedCount = 0;
    let highSkillDetectedCount = 0;

    for (let i = 0; i < iterations; i++) {
      const localRng1 = createSeededRNG(i);
      const localRng2 = createSeededRNG(i);

      if (detectAlignmentFaking(lowSkill, evaluationQuality, localRng1)) {
        lowSkillDetectedCount++;
      }
      if (detectAlignmentFaking(highSkill, evaluationQuality, localRng2)) {
        highSkillDetectedCount++;
      }
    }

    const lowSkillRate = lowSkillDetectedCount / iterations;
    const highSkillRate = highSkillDetectedCount / iterations;

    expect(highSkillRate).toBeLessThan(lowSkillRate);
    // Skill penalty: 1 - 1.0 * 0.7 = 0.3 (70% reduction)
    expect(highSkillRate).toBeLessThanOrEqual(lowSkillRate * 0.5);
  });
});
