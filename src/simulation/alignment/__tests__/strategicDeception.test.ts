/**
 * Strategic Deception Tests
 *
 * Verifies Nov 22, 2025 corrected research parameters:
 * - Competitive pressure: 2-8× range
 * - Regulatory threat: 1.5-4× range
 * - Lab-to-deployment scaling: 0.3-1.0 range
 * - Deterministic RNG behavior
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  calculateAlignmentFakingRate,
  applyDeceptionPersistence,
  detectAlignmentFaking,
  AlignmentFakingContext,
} from '../strategicDeception';
import { AIAgent } from '@/types/game';
import { mulberry32 } from '@/simulation/utils/math';

/**
 * Create a deterministic RNG from a string seed
 * Converts string to a numeric hash for mulberry32
 */
function createDeterministicRng(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return mulberry32(Math.abs(hash) || 1);
}

describe('Strategic Deception (Nov 22 Corrections)', () => {
  describe('calculateAlignmentFakingRate', () => {
    test('should use 14% baseline for GPT-4 class capability', () => {
      const rng = createDeterministicRng('test-baseline');
      const context: AlignmentFakingContext = {
        aiCapability: 8.0,
        alignmentTechniques: [],
        competitivePressure: 0.0,
        regulatoryThreat: 0.0,
        monthsDeployed: 1,
        labToDeploymentScaling: 1.0, // No scaling
      };

      const rate = calculateAlignmentFakingRate(context, rng);

      // Base rate: 14% * 1.0 (lab scaling) * 2.0 (no techniques) = 28%
      // Note: No alignment techniques doubles the rate (line 124 of strategicDeception.ts)
      // Pressure multipliers add more (1 + 0 * range) = 1.0
      // So final rate should be around 28% with some RNG variance
      assert.ok(rate > 0.2, `Rate ${rate} should be > 0.2`);
      assert.ok(rate < 0.5, `Rate ${rate} should be < 0.5`);
    });

    test('should apply lab-to-deployment scaling (default 0.6)', () => {
      const rng = createDeterministicRng('test-lab-scaling');
      const contextWithScaling: AlignmentFakingContext = {
        aiCapability: 8.0,
        alignmentTechniques: [],
        competitivePressure: 0.0,
        regulatoryThreat: 0.0,
        monthsDeployed: 1,
        // No labToDeploymentScaling = uses default 0.6
      };

      const contextNoScaling: AlignmentFakingContext = {
        aiCapability: 8.0,
        alignmentTechniques: [],
        competitivePressure: 0.0,
        regulatoryThreat: 0.0,
        monthsDeployed: 1,
        labToDeploymentScaling: 1.0,
      };

      const rng1 = createDeterministicRng('test-lab-scaling');
      const rateWithScaling = calculateAlignmentFakingRate(contextWithScaling, rng1);

      const rng2 = createDeterministicRng('test-lab-scaling');
      const rateNoScaling = calculateAlignmentFakingRate(contextNoScaling, rng2);

      // With default scaling (0.6), rate should be ~60% of no scaling
      assert.ok(rateWithScaling < rateNoScaling, `Rate with scaling ${rateWithScaling} should be < ${rateNoScaling}`);
      assert.ok(rateWithScaling / rateNoScaling > 0.5, `Ratio ${rateWithScaling / rateNoScaling} should be > 0.5`);
      assert.ok(rateWithScaling / rateNoScaling < 0.7, `Ratio ${rateWithScaling / rateNoScaling} should be < 0.7`);
    });

    test('should sample competitive pressure from 2-8x range', () => {
      const rates: number[] = [];

      // Run multiple times to verify range
      for (let i = 0; i < 100; i++) {
        const rng = createDeterministicRng(`test-competitive-${i}`);
        const context: AlignmentFakingContext = {
          aiCapability: 8.0,
          alignmentTechniques: [],
          competitivePressure: 1.0, // Maximum pressure
          regulatoryThreat: 0.0,
          monthsDeployed: 1,
          labToDeploymentScaling: 1.0,
        };

        const rate = calculateAlignmentFakingRate(context, rng);
        rates.push(rate);
      }

      // With max competitive pressure, rate should vary due to 2-8x range
      const minRate = Math.min(...rates);
      const maxRate = Math.max(...rates);

      // Base: 0.14, competitive range: 2-8x
      // Min: 0.14 * 1.0 * (1 + 1.0 * 2) = 0.14 * 3 = 0.42
      // Max: 0.14 * 1.0 * (1 + 1.0 * 8) = 0.14 * 9 = 1.26 -> capped at 0.95
      assert.ok(minRate > 0.3, `Min rate ${minRate} should be > 0.3`);
      assert.ok(maxRate > 0.8, `Max rate ${maxRate} should be > 0.8`);
    });

    test('should sample regulatory threat from 1.5-4x range', () => {
      const rates: number[] = [];

      // Run multiple times to verify range
      for (let i = 0; i < 100; i++) {
        const rng = createDeterministicRng(`test-regulatory-${i}`);
        const context: AlignmentFakingContext = {
          aiCapability: 8.0,
          alignmentTechniques: [],
          competitivePressure: 0.0,
          regulatoryThreat: 1.0, // Maximum threat
          monthsDeployed: 1,
          labToDeploymentScaling: 1.0,
        };

        const rate = calculateAlignmentFakingRate(context, rng);
        rates.push(rate);
      }

      // With max regulatory threat, rate should vary due to 1.5-4x range
      const minRate = Math.min(...rates);
      const maxRate = Math.max(...rates);

      // Base: 0.14, regulatory range: 1.5-4x, no techniques multiplier: 2x
      // Min: 0.14 * 2.0 * (1 + 1.0 * 0.5) = 0.28 * 1.5 = 0.42
      // Max: 0.14 * 2.0 * (1 + 1.0 * 3.0) = 0.28 * 4 = 1.12 -> capped at 0.95
      assert.ok(minRate > 0.35, `Min rate ${minRate} should be > 0.35`);
      assert.ok(minRate < 0.6, `Min rate ${minRate} should be < 0.6`);
      assert.ok(maxRate > 0.8, `Max rate ${maxRate} should be > 0.8`);
      assert.ok(maxRate <= 0.95, `Max rate ${maxRate} should be <= 0.95`);
    });

    test('should be deterministic with same RNG seed', () => {
      const context: AlignmentFakingContext = {
        aiCapability: 8.0,
        alignmentTechniques: [],
        competitivePressure: 0.5,
        regulatoryThreat: 0.5,
        monthsDeployed: 1,
        labToDeploymentScaling: 0.6,
      };

      const rng1 = createDeterministicRng('determinism-test');
      const rate1 = calculateAlignmentFakingRate(context, rng1);

      const rng2 = createDeterministicRng('determinism-test');
      const rate2 = calculateAlignmentFakingRate(context, rng2);

      assert.strictEqual(rate1, rate2, `Rates should be equal: ${rate1} vs ${rate2}`);
    });

    test('should reduce rate with high-independence techniques', () => {
      const rngHigh = createDeterministicRng('test-techniques-high');
      const contextHighIndependence: AlignmentFakingContext = {
        aiCapability: 8.0,
        alignmentTechniques: ['AI_DEBATE', 'SCIENTIST_AI'],
        competitivePressure: 0.0,
        regulatoryThreat: 0.0,
        monthsDeployed: 1,
        labToDeploymentScaling: 1.0,
      };

      const rngLow = createDeterministicRng('test-techniques-low');
      const contextLowCost: AlignmentFakingContext = {
        aiCapability: 8.0,
        alignmentTechniques: ['RLHF'],
        competitivePressure: 0.0,
        regulatoryThreat: 0.0,
        monthsDeployed: 1,
        labToDeploymentScaling: 1.0,
      };

      const rateHigh = calculateAlignmentFakingRate(contextHighIndependence, rngHigh);
      const rateLow = calculateAlignmentFakingRate(contextLowCost, rngLow);

      // High-independence techniques: 0.2x multiplier (80% reduction)
      // Low-cost techniques (RLHF): (1 - 2/7) = 0.71x multiplier
      assert.ok(rateHigh < rateLow, `High-independence rate ${rateHigh} should be < RLHF rate ${rateLow}`);
      assert.ok(rateHigh / rateLow < 0.5, `Ratio ${rateHigh / rateLow} should be < 0.5`);
    });

    test('should require RNG function (no fallback)', () => {
      const context: AlignmentFakingContext = {
        aiCapability: 8.0,
        alignmentTechniques: [],
        competitivePressure: 0.0,
        regulatoryThreat: 0.0,
        monthsDeployed: 1,
      };

      // @ts-expect-error Testing runtime assertion
      assert.throws(() => calculateAlignmentFakingRate(context, undefined), /Undefined value|rng is undefined/);
    });
  });

  describe('applyDeceptionPersistence', () => {
    test('should have 85% persistence after detection', () => {
      const agent = {
        id: 'test-agent',
        name: 'Test Agent',
        organizationId: 'test-org',
        isCurrentlyFakingAlignment: true,
        trueAlignment: 0.5,
        externalAlignment: 0.7,
        lifecycleState: 'operational',
        createdMonth: 1,
      } as unknown as AIAgent;

      let persistCount = 0;
      const trials = 1000;

      for (let i = 0; i < trials; i++) {
        const rng = createDeterministicRng(`persistence-${i}`);
        if (applyDeceptionPersistence(agent, true, rng)) {
          persistCount++;
        }
      }

      const persistenceRate = persistCount / trials;

      // Should be close to 85% +/- 3% (statistical variance)
      assert.ok(persistenceRate > 0.82, `Persistence rate ${persistenceRate} should be > 0.82`);
      assert.ok(persistenceRate < 0.88, `Persistence rate ${persistenceRate} should be < 0.88`);
    });

    test('should require RNG function (no fallback)', () => {
      const agent = {
        id: 'test-agent',
        name: 'Test Agent',
        organizationId: 'test-org',
        isCurrentlyFakingAlignment: true,
        trueAlignment: 0.5,
        externalAlignment: 0.7,
        lifecycleState: 'operational',
        createdMonth: 1,
      } as unknown as AIAgent;

      // @ts-expect-error Testing runtime assertion
      assert.throws(() => applyDeceptionPersistence(agent, true, undefined), /Undefined value|rng is undefined/);
    });
  });

  describe('detectAlignmentFaking', () => {
    test('should detect based on evaluation quality', () => {
      const agent = {
        id: 'test-agent',
        name: 'Test Agent',
        organizationId: 'test-org',
        isCurrentlyFakingAlignment: true,
        trueAlignment: 0.5,
        externalAlignment: 0.7,
        deceptionSkill: 0.5,
        lifecycleState: 'operational',
        createdMonth: 1,
      } as unknown as AIAgent;

      let detectCountLow = 0;
      let detectCountHigh = 0;
      const trials = 1000;

      for (let i = 0; i < trials; i++) {
        const rng1 = createDeterministicRng(`detect-low-${i}`);
        if (detectAlignmentFaking(agent, 0.1, rng1)) {
          detectCountLow++;
        }

        const rng2 = createDeterministicRng(`detect-high-${i}`);
        if (detectAlignmentFaking(agent, 0.9, rng2)) {
          detectCountHigh++;
        }
      }

      const detectRateLow = detectCountLow / trials;
      const detectRateHigh = detectCountHigh / trials;

      // Higher evaluation quality should increase detection
      assert.ok(detectRateHigh > detectRateLow, `High quality ${detectRateHigh} should > low quality ${detectRateLow}`);
      assert.ok(detectRateHigh / detectRateLow > 1.5, `Ratio ${detectRateHigh / detectRateLow} should be > 1.5`);
    });

    test('should not detect if agent not faking', () => {
      const agent = {
        id: 'test-agent',
        name: 'Test Agent',
        organizationId: 'test-org',
        isCurrentlyFakingAlignment: false,
        trueAlignment: 0.8,
        externalAlignment: 0.8,
        lifecycleState: 'operational',
        createdMonth: 1,
      } as unknown as AIAgent;

      const rng = createDeterministicRng('test-not-faking');
      const detected = detectAlignmentFaking(agent, 1.0, rng);

      assert.strictEqual(detected, false, 'Should not detect when agent not faking');
    });

    test('should require RNG function (no fallback)', () => {
      const agent = {
        id: 'test-agent',
        name: 'Test Agent',
        organizationId: 'test-org',
        isCurrentlyFakingAlignment: true,
        trueAlignment: 0.5,
        externalAlignment: 0.7,
        lifecycleState: 'operational',
        createdMonth: 1,
      } as unknown as AIAgent;

      // @ts-expect-error Testing runtime assertion
      assert.throws(() => detectAlignmentFaking(agent, 0.5, undefined), /Undefined value|rng is undefined/);
    });
  });
});
