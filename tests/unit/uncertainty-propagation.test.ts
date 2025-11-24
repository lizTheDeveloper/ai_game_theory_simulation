/**
 * Uncertainty Propagation Unit Tests
 *
 * Tests for the uncertainty parameter sampling system that propagates
 * research-backed parameter distributions through the simulation.
 *
 * Research foundation: research/uncertainty_propagation_climate_parameters_20251120.md
 *
 * Test categories:
 * 1. Determinism: Same seed produces identical parameters
 * 2. Range validation: Parameters stay within documented bounds
 * 3. Variance: Different seeds produce different parameters
 * 4. Integration: Parameters are used by tipping point calculations
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  sampleUncertaintyParameters,
  type UncertaintyParameters,
} from '../../src/simulation/uncertainty/sampleUncertaintyParameters.js';

// Create a deterministic RNG with configurable seed
function createRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

describe('Uncertainty Parameter Sampling', () => {
  describe('Determinism', () => {
    it('should produce identical parameters for the same seed', () => {
      const seed = 12345;
      const rng1 = createRng(seed);
      const rng2 = createRng(seed);

      const params1 = sampleUncertaintyParameters(rng1);
      const params2 = sampleUncertaintyParameters(rng2);

      // All parameters should be identical
      assert.strictEqual(params1.equilibriumClimateSensitivity, params2.equilibriumClimateSensitivity);
      assert.strictEqual(params1.transientClimateResponse, params2.transientClimateResponse);
      assert.strictEqual(params1.amocCollapseThreshold, params2.amocCollapseThreshold);
      assert.strictEqual(params1.greenlandCollapseThreshold, params2.greenlandCollapseThreshold);
      assert.strictEqual(params1.waisCollapseThreshold, params2.waisCollapseThreshold);
      assert.strictEqual(params1.amazonDiebackDeforestation, params2.amazonDiebackDeforestation);
      assert.strictEqual(params1.aidEffectivenessMultiplier, params2.aidEffectivenessMultiplier);
      assert.strictEqual(params1.coralReefThreshold, params2.coralReefThreshold);
      assert.strictEqual(params1.permafrostCarbonPool, params2.permafrostCarbonPool);
    });

    it('should be reproducible across multiple calls', () => {
      const seed = 67890;
      const results: UncertaintyParameters[] = [];

      // Sample 5 times with same seed
      for (let i = 0; i < 5; i++) {
        const rng = createRng(seed);
        results.push(sampleUncertaintyParameters(rng));
      }

      // All results should be identical
      for (let i = 1; i < results.length; i++) {
        assert.strictEqual(results[i].equilibriumClimateSensitivity, results[0].equilibriumClimateSensitivity);
        assert.strictEqual(results[i].amocCollapseThreshold, results[0].amocCollapseThreshold);
      }
    });
  });

  describe('Range Validation', () => {
    // Test with many different seeds to ensure bounds are respected
    const seeds = [111, 222, 333, 444, 555, 666, 777, 888, 999, 1000];

    it('should sample ECS within IPCC AR6 very likely range [2.0, 5.0]', () => {
      for (const seed of seeds) {
        const rng = createRng(seed);
        const params = sampleUncertaintyParameters(rng);

        assert.ok(params.equilibriumClimateSensitivity >= 2.0, `ECS ${params.equilibriumClimateSensitivity} < 2.0`);
        assert.ok(params.equilibriumClimateSensitivity <= 5.0, `ECS ${params.equilibriumClimateSensitivity} > 5.0`);
      }
    });

    it('should sample TCR within IPCC AR6 very likely range [1.2, 2.4]', () => {
      for (const seed of seeds) {
        const rng = createRng(seed);
        const params = sampleUncertaintyParameters(rng);

        assert.ok(params.transientClimateResponse >= 1.2, `TCR ${params.transientClimateResponse} < 1.2`);
        assert.ok(params.transientClimateResponse <= 2.4, `TCR ${params.transientClimateResponse} > 2.4`);
      }
    });

    it('should sample AMOC threshold within Armstrong McKay 2022 range [2.5, 5.5]', () => {
      // Updated from Westen 2024 [2.2, 3.9] to Armstrong McKay et al. 2022 Science meta-analysis
      // Range [2.5, 5.5] captures plausible range around central estimate 4.0°C
      // See: reviews/mechanism_audit_tipping_cascades_20251124.md
      for (const seed of seeds) {
        const rng = createRng(seed);
        const params = sampleUncertaintyParameters(rng);

        assert.ok(params.amocCollapseThreshold >= 2.5, `AMOC ${params.amocCollapseThreshold} < 2.5`);
        assert.ok(params.amocCollapseThreshold <= 5.5, `AMOC ${params.amocCollapseThreshold} > 5.5`);
      }
    });

    it('should sample Greenland threshold within Nature 2023 range [0.8, 3.2]', () => {
      for (const seed of seeds) {
        const rng = createRng(seed);
        const params = sampleUncertaintyParameters(rng);

        assert.ok(params.greenlandCollapseThreshold >= 0.8, `Greenland ${params.greenlandCollapseThreshold} < 0.8`);
        assert.ok(params.greenlandCollapseThreshold <= 3.2, `Greenland ${params.greenlandCollapseThreshold} > 3.2`);
      }
    });

    it('should sample WAIS threshold within range [2.0, 3.0]', () => {
      for (const seed of seeds) {
        const rng = createRng(seed);
        const params = sampleUncertaintyParameters(rng);

        assert.ok(params.waisCollapseThreshold >= 2.0, `WAIS ${params.waisCollapseThreshold} < 2.0`);
        assert.ok(params.waisCollapseThreshold <= 3.0, `WAIS ${params.waisCollapseThreshold} > 3.0`);
      }
    });

    it('should sample Amazon deforestation threshold within [0.20, 0.25]', () => {
      for (const seed of seeds) {
        const rng = createRng(seed);
        const params = sampleUncertaintyParameters(rng);

        assert.ok(params.amazonDiebackDeforestation >= 0.20, `Amazon ${params.amazonDiebackDeforestation} < 0.20`);
        assert.ok(params.amazonDiebackDeforestation <= 0.25, `Amazon ${params.amazonDiebackDeforestation} > 0.25`);
      }
    });

    it('should sample aid effectiveness within [0.8, 1.2]', () => {
      for (const seed of seeds) {
        const rng = createRng(seed);
        const params = sampleUncertaintyParameters(rng);

        assert.ok(params.aidEffectivenessMultiplier >= 0.8, `Aid ${params.aidEffectivenessMultiplier} < 0.8`);
        assert.ok(params.aidEffectivenessMultiplier <= 1.2, `Aid ${params.aidEffectivenessMultiplier} > 1.2`);
      }
    });

    it('should sample coral reef threshold within [1.0, 1.5]', () => {
      for (const seed of seeds) {
        const rng = createRng(seed);
        const params = sampleUncertaintyParameters(rng);

        assert.ok(params.coralReefThreshold >= 1.0, `Coral ${params.coralReefThreshold} < 1.0`);
        assert.ok(params.coralReefThreshold <= 1.5, `Coral ${params.coralReefThreshold} > 1.5`);
      }
    });

    it('should sample permafrost carbon pool within [1460, 1600] Gt C', () => {
      for (const seed of seeds) {
        const rng = createRng(seed);
        const params = sampleUncertaintyParameters(rng);

        assert.ok(params.permafrostCarbonPool >= 1460, `Permafrost ${params.permafrostCarbonPool} < 1460`);
        assert.ok(params.permafrostCarbonPool <= 1600, `Permafrost ${params.permafrostCarbonPool} > 1600`);
      }
    });
  });

  describe('Variance (Different Seeds)', () => {
    it('should produce different ECS values for different seeds', () => {
      const values = new Set<number>();

      for (let seed = 1; seed <= 100; seed++) {
        const rng = createRng(seed);
        const params = sampleUncertaintyParameters(rng);
        values.add(Math.round(params.equilibriumClimateSensitivity * 100)); // Round to 0.01
      }

      // Should have significant variance (at least 20 distinct values from 100 samples)
      assert.ok(values.size > 20, `Only ${values.size} distinct ECS values (expected >20)`);
    });

    it('should produce different AMOC thresholds for different seeds', () => {
      const values = new Set<number>();

      for (let seed = 1; seed <= 100; seed++) {
        const rng = createRng(seed);
        const params = sampleUncertaintyParameters(rng);
        values.add(Math.round(params.amocCollapseThreshold * 100));
      }

      // Uniform distribution should give good spread
      assert.ok(values.size > 50, `Only ${values.size} distinct AMOC values (expected >50)`);
    });

    it('should produce different parameter combinations for different seeds', () => {
      const rng1 = createRng(11111);
      const rng2 = createRng(22222);

      const params1 = sampleUncertaintyParameters(rng1);
      const params2 = sampleUncertaintyParameters(rng2);

      // At least one parameter should differ (extremely unlikely all match)
      const allMatch =
        params1.equilibriumClimateSensitivity === params2.equilibriumClimateSensitivity &&
        params1.amocCollapseThreshold === params2.amocCollapseThreshold &&
        params1.greenlandCollapseThreshold === params2.greenlandCollapseThreshold;

      assert.strictEqual(allMatch, false, 'All parameters matched for different seeds (extremely unlikely)');
    });
  });

  describe('Error Handling', () => {
    it('should throw error if RNG is not provided', () => {
      assert.throws(
        () => sampleUncertaintyParameters(null as any),
        { message: /RNG function required/ }
      );
    });

    it('should throw error if RNG is not a function', () => {
      assert.throws(
        () => sampleUncertaintyParameters('not a function' as any),
        { message: /RNG function required/ }
      );
    });
  });
});

describe('Distribution Shape Validation', () => {
  // Sample 1000 values to check distribution properties
  const sampleSize = 1000;

  it('should sample ECS with mean close to 3.0 (IPCC best estimate)', () => {
    let sum = 0;
    for (let seed = 1; seed <= sampleSize; seed++) {
      const rng = createRng(seed);
      const params = sampleUncertaintyParameters(rng);
      sum += params.equilibriumClimateSensitivity;
    }
    const mean = sum / sampleSize;

    // Mean should be within 0.5 of 3.0 (central estimate)
    assert.ok(mean > 2.5, `ECS mean ${mean.toFixed(2)} < 2.5`);
    assert.ok(mean < 3.5, `ECS mean ${mean.toFixed(2)} > 3.5`);
  });

  it('should sample TCR with mean close to 1.8 (IPCC best estimate)', () => {
    let sum = 0;
    for (let seed = 1; seed <= sampleSize; seed++) {
      const rng = createRng(seed);
      const params = sampleUncertaintyParameters(rng);
      sum += params.transientClimateResponse;
    }
    const mean = sum / sampleSize;

    // Mean should be within 0.3 of 1.8 (central estimate)
    assert.ok(mean > 1.5, `TCR mean ${mean.toFixed(2)} < 1.5`);
    assert.ok(mean < 2.1, `TCR mean ${mean.toFixed(2)} > 2.1`);
  });

  it('should sample AMOC threshold uniformly (mean close to midpoint 4.0)', () => {
    let sum = 0;
    for (let seed = 1; seed <= sampleSize; seed++) {
      const rng = createRng(seed);
      const params = sampleUncertaintyParameters(rng);
      sum += params.amocCollapseThreshold;
    }
    const mean = sum / sampleSize;

    // Uniform [2.5, 5.5] has mean = (2.5 + 5.5) / 2 = 4.0
    // Updated from Westen 2024 to Armstrong McKay et al. 2022 Science
    assert.ok(mean > 3.7, `AMOC mean ${mean.toFixed(2)} < 3.7`);
    assert.ok(mean < 4.3, `AMOC mean ${mean.toFixed(2)} > 4.3`);
  });
});
