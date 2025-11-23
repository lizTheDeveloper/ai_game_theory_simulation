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
import { createDeterministicRng } from '@/simulation/utils/deterministicRng';

describe('Strategic Deception (Nov 22 Corrections)', () => {
  describe('calculateAlignmentFakingRate', () => {
    it('should use 14% baseline for GPT-4 class capability', () => {
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

      // Base rate: 14% * 1.0 (lab scaling) * 1.0 (no techniques) * 1.0 (no pressure) = 14%
      // Actual rate will vary slightly due to RNG in pressure multipliers
      expect(rate).toBeGreaterThan(0.1);
      expect(rate).toBeLessThan(0.2);
    });

    it('should apply lab-to-deployment scaling (default 0.6)', () => {
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
      expect(rateWithScaling).toBeLessThan(rateNoScaling);
      expect(rateWithScaling / rateNoScaling).toBeGreaterThan(0.5);
      expect(rateWithScaling / rateNoScaling).toBeLessThan(0.7);
    });

    it('should sample competitive pressure from 2-8× range', () => {
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

      // With max competitive pressure, rate should vary due to 2-8× range
      const minRate = Math.min(...rates);
      const maxRate = Math.max(...rates);

      // Base: 0.14, competitive range: 2-8×
      // Min: 0.14 * 1.0 * (1 + 1.0 * 2) = 0.14 * 3 = 0.42
      // Max: 0.14 * 1.0 * (1 + 1.0 * 8) = 0.14 * 9 = 1.26 → capped at 0.95
      expect(minRate).toBeGreaterThan(0.3);
      expect(maxRate).toBeGreaterThan(0.8);
    });

    it('should sample regulatory threat from 1.5-4× range', () => {
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

      // With max regulatory threat, rate should vary due to 1.5-4× range
      const minRate = Math.min(...rates);
      const maxRate = Math.max(...rates);

      // Base: 0.14, regulatory range: 1.5-4×
      // Min: 0.14 * 1.0 * (1 + 1.0 * 0.5) = 0.14 * 1.5 = 0.21
      // Max: 0.14 * 1.0 * (1 + 1.0 * 3.0) = 0.14 * 4 = 0.56
      expect(minRate).toBeGreaterThan(0.15);
      expect(minRate).toBeLessThan(0.3);
      expect(maxRate).toBeGreaterThan(0.4);
      expect(maxRate).toBeLessThan(0.7);
    });

    it('should be deterministic with same RNG seed', () => {
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

      expect(rate1).toBe(rate2);
    });

    it('should reduce rate with high-independence techniques', () => {
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

      // High-independence techniques: 0.2× multiplier (80% reduction)
      // Low-cost techniques (RLHF): (1 - 2/7) ≈ 0.71× multiplier
      expect(rateHigh).toBeLessThan(rateLow);
      expect(rateHigh / rateLow).toBeLessThan(0.5);
    });

    it('should require RNG function (no fallback)', () => {
      const context: AlignmentFakingContext = {
        aiCapability: 8.0,
        alignmentTechniques: [],
        competitivePressure: 0.0,
        regulatoryThreat: 0.0,
        monthsDeployed: 1,
      };

      // @ts-expect-error Testing runtime assertion
      expect(() => calculateAlignmentFakingRate(context, undefined)).toThrow();
    });
  });

  describe('applyDeceptionPersistence', () => {
    it('should have 85% persistence after detection', () => {
      const agent: AIAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        organizationId: 'test-org',
        isCurrentlyFakingAlignment: true,
        trueAlignment: 0.5,
        externalAlignment: 0.7,
        lifecycleState: 'operational',
        createdMonth: 1,
      };

      let persistCount = 0;
      const trials = 1000;

      for (let i = 0; i < trials; i++) {
        const rng = createDeterministicRng(`persistence-${i}`);
        if (applyDeceptionPersistence(agent, true, rng)) {
          persistCount++;
        }
      }

      const persistenceRate = persistCount / trials;

      // Should be close to 85% ± 3% (statistical variance)
      expect(persistenceRate).toBeGreaterThan(0.82);
      expect(persistenceRate).toBeLessThan(0.88);
    });

    it('should require RNG function (no fallback)', () => {
      const agent: AIAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        organizationId: 'test-org',
        isCurrentlyFakingAlignment: true,
        trueAlignment: 0.5,
        externalAlignment: 0.7,
        lifecycleState: 'operational',
        createdMonth: 1,
      };

      // @ts-expect-error Testing runtime assertion
      expect(() => applyDeceptionPersistence(agent, true, undefined)).toThrow();
    });
  });

  describe('detectAlignmentFaking', () => {
    it('should detect based on evaluation quality', () => {
      const agent: AIAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        organizationId: 'test-org',
        isCurrentlyFakingAlignment: true,
        trueAlignment: 0.5,
        externalAlignment: 0.7,
        deceptionSkill: 0.5,
        lifecycleState: 'operational',
        createdMonth: 1,
      };

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
      expect(detectRateHigh).toBeGreaterThan(detectRateLow);
      expect(detectRateHigh / detectRateLow).toBeGreaterThan(1.5);
    });

    it('should not detect if agent not faking', () => {
      const agent: AIAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        organizationId: 'test-org',
        isCurrentlyFakingAlignment: false,
        trueAlignment: 0.8,
        externalAlignment: 0.8,
        lifecycleState: 'operational',
        createdMonth: 1,
      };

      const rng = createDeterministicRng('test-not-faking');
      const detected = detectAlignmentFaking(agent, 1.0, rng);

      expect(detected).toBe(false);
    });

    it('should require RNG function (no fallback)', () => {
      const agent: AIAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        organizationId: 'test-org',
        isCurrentlyFakingAlignment: true,
        trueAlignment: 0.5,
        externalAlignment: 0.7,
        lifecycleState: 'operational',
        createdMonth: 1,
      };

      // @ts-expect-error Testing runtime assertion
      expect(() => detectAlignmentFaking(agent, 0.5, undefined)).toThrow();
    });
  });
});
