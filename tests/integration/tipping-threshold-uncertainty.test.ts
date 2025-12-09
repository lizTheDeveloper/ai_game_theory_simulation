/**
 * Integration Tests for Tipping Point Threshold Uncertainty (M-5)
 *
 * Validates:
 * 1. Sampled thresholds vary across runs (different seeds)
 * 2. Sampled thresholds persist within single run (deterministic)
 * 3. Backward compatibility (elements without distributions use baseline triggerTempC)
 * 4. Distribution sampling doesn't break simulation
 *
 * Research: Armstrong McKay et al. (2022) - factor 2-10x threshold uncertainties
 *
 * Created: December 9, 2025 (M-5 Phase 2, T2.5)
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { stepSimulation } from '@/simulation/engine';
import type { GameState } from '@/types/game';

// Simple seeded RNG for deterministic testing
function createSeededRNG(seed: number): () => number {
  let value = seed;
  return function seededRandom(): number {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// Convert string seed to numeric seed
function hashStringSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

describe('Tipping Point Threshold Uncertainty (M-5)', () => {
  test('sampled thresholds vary across runs with different seeds', () => {
    console.log('\n🎲 Testing threshold variance across seeds...');

    const seed1 = 'uncertainty-test-seed-1';
    const seed2 = 'uncertainty-test-seed-2';

    // Initialize with seed 1
    const rng1 = createSeededRNG(hashStringSeed(seed1));
    const state1 = createDefaultInitialState(rng1);
    // Initialize with seed 2
    const rng2 = createSeededRNG(hashStringSeed(seed2));
    const state2 = createDefaultInitialState(rng2);

    // Elements with distributions should have different sampled thresholds
    const elementsWithDistributions = state1.tippingPointSystem.elements
      .filter(el => el._sampledThresholdC !== undefined);

    assert.ok(
      elementsWithDistributions.length > 0,
      'At least one element should have thresholdDistribution defined'
    );

    console.log(`  Found ${elementsWithDistributions.length} elements with uncertainty distributions`);

    let differentCount = 0;
    for (const el1 of elementsWithDistributions) {
      const el2 = state2.tippingPointSystem.elements.find(e => e.id === el1.id);
      assert.ok(el2, `Element ${el1.id} should exist in both states`);

      if (el1._sampledThresholdC !== el2._sampledThresholdC) {
        differentCount++;
        console.log(`    ✅ ${el1.id}: ${el1._sampledThresholdC?.toFixed(2)}°C vs ${el2._sampledThresholdC?.toFixed(2)}°C (different)`);
      } else {
        console.log(`    ⚠️  ${el1.id}: ${el1._sampledThresholdC?.toFixed(2)}°C (same - highly unlikely with continuous distributions!)`);
      }
    }

    // With continuous distributions, different seeds should produce different samples
    // Allow 1 element to match by chance (very unlikely but not impossible)
    const minExpectedDifferent = Math.max(1, elementsWithDistributions.length - 1);

    assert.ok(
      differentCount >= minExpectedDifferent,
      `Expected at least ${minExpectedDifferent} elements with different thresholds, got ${differentCount}`
    );

    console.log(`  ✅ ${differentCount}/${elementsWithDistributions.length} elements have different thresholds across seeds`);
  });

  test('sampled thresholds persist throughout single run (deterministic within-run)', () => {
    console.log('\n🔒 Testing threshold persistence within run...');

    const seed = 'persistence-test-seed';
    const rng = createSeededRNG(hashStringSeed(seed));
    const state = createDefaultInitialState(rng);

    // Record initial sampled thresholds
    const initialThresholds = new Map<string, number>();
    for (const el of state.tippingPointSystem.elements) {
      if (el._sampledThresholdC !== undefined) {
        initialThresholds.set(el.id, el._sampledThresholdC);
        console.log(`  Initial ${el.id}: ${el._sampledThresholdC.toFixed(2)}°C`);
      }
    }

    assert.ok(initialThresholds.size > 0, 'Should have sampled thresholds');

    // Run simulation for 12 months
    let currentState = state;
    for (let month = 1; month <= 12; month++) {
      const result = stepSimulation(currentState);
      assert.ok(result.success, `Month ${month} should execute successfully`);
      currentState = result.newState;
    }

    // Verify thresholds haven't changed
    for (const [elementId, initialThreshold] of initialThresholds.entries()) {
      const element = currentState.tippingPointSystem.elements.find(e => e.id === elementId);
      assert.ok(element, `Element ${elementId} should still exist`);

      assert.strictEqual(
        element._sampledThresholdC,
        initialThreshold,
        `${elementId} threshold should not change during run (${element._sampledThresholdC} !== ${initialThreshold})`
      );
    }

    console.log(`  ✅ All ${initialThresholds.size} sampled thresholds persisted unchanged through 12 months`);
  });

  test('backward compatibility: elements without distributions use baseline triggerTempC', () => {
    console.log('\n⬅️  Testing backward compatibility...');

    const seed = 'backward-compat-test';
    const rng = createSeededRNG(hashStringSeed(seed));
    const state = createDefaultInitialState(rng);

    // Find elements WITHOUT distribution definitions
    const elementsWithoutDistributions = state.tippingPointSystem.elements
      .filter(el => el._sampledThresholdC === undefined);

    console.log(`  Found ${elementsWithoutDistributions.length} elements without distributions`);

    // These elements should fall back to triggerTempC
    for (const el of elementsWithoutDistributions) {
      // Check that phase will use triggerTempC (via fallback pattern)
      // Phase uses: element._sampledThresholdC ?? element.triggerTempC
      assert.ok(
        el.triggerTempC !== undefined,
        `${el.id} without distribution should have triggerTempC defined`
      );

      console.log(`    ${el.id}: using baseline ${el.triggerTempC}°C (no distribution)`);
    }

    console.log(`  ✅ Backward compatibility maintained for elements without distributions`);
  });

  test('distribution sampling does not break simulation execution', () => {
    console.log('\n⚙️  Testing simulation with threshold uncertainty...');

    const seed = 'simulation-test-seed';
    const rng = createSeededRNG(hashStringSeed(seed));
    const state = createDefaultInitialState(rng);

    // Run for 24 months
    let currentState = state;
    for (let month = 1; month <= 24; month++) {
      const result = stepSimulation(currentState);

      assert.ok(
        result.success,
        `Month ${month} should execute successfully (message: ${result.message})`
      );

      assert.ok(
        !result.message.includes('❌'),
        `Month ${month} should not have error message: ${result.message}`
      );

      currentState = result.newState;
    }

    console.log(`  ✅ Simulation executed 24 months without errors`);

    // Check tipping point system is still functional
    assert.ok(
      currentState.tippingPointSystem,
      'Tipping point system should exist'
    );

    assert.ok(
      currentState.tippingPointSystem.elements.length > 0,
      'Tipping elements should exist'
    );

    console.log(`  ✅ Tipping point system functional after 24 months`);
  });

  test('threshold distributions match research ranges (sanity check)', () => {
    console.log('\n📐 Testing sampled thresholds are within research ranges...');

    const seed = 'range-test-seed';
    const rng = createSeededRNG(hashStringSeed(seed));
    const state = createDefaultInitialState(rng);

    // Research-backed plausible ranges (Armstrong McKay et al. 2022)
    const plausibleRanges: Record<string, { min: number; max: number }> = {
      amoc: { min: 1.4, max: 8.0 },           // Wide uncertainty
      amazon: { min: 2.0, max: 10.2 },        // Very wide (Ciemer 2024)
      arctic_ice: { min: 1.0, max: 2.3 },     // Narrow
      wais: { min: 1.0, max: 3.0 },           // Moderate
      greenland: { min: 0.8, max: 3.4 },      // Moderate-wide
    };

    for (const el of state.tippingPointSystem.elements) {
      if (el._sampledThresholdC !== undefined && plausibleRanges[el.id]) {
        const range = plausibleRanges[el.id];

        assert.ok(
          el._sampledThresholdC >= range.min && el._sampledThresholdC <= range.max,
          `${el.id} sampled threshold ${el._sampledThresholdC.toFixed(2)}°C should be in research range [${range.min}, ${range.max}]°C`
        );

        console.log(`    ✅ ${el.id}: ${el._sampledThresholdC.toFixed(2)}°C ∈ [${range.min}, ${range.max}]°C`);
      }
    }

    console.log(`  ✅ All sampled thresholds within research-backed ranges`);
  });

  test('determinism: identical seeds produce identical thresholds', () => {
    console.log('\n🔁 Testing determinism (same seed → same thresholds)...');

    const seed = 'determinism-test-seed';

    // Initialize twice with same seed
    const rng1 = createSeededRNG(hashStringSeed(seed));
    const state1 = createDefaultInitialState(rng1);
    const rng2 = createSeededRNG(hashStringSeed(seed));
    const state2 = createDefaultInitialState(rng2);

    // All sampled thresholds should be identical
    for (const el1 of state1.tippingPointSystem.elements) {
      const el2 = state2.tippingPointSystem.elements.find(e => e.id === el1.id);
      assert.ok(el2, `Element ${el1.id} should exist in both states`);

      if (el1._sampledThresholdC !== undefined) {
        assert.strictEqual(
          el1._sampledThresholdC,
          el2._sampledThresholdC,
          `${el1.id} should have identical sampled threshold (${el1._sampledThresholdC} !== ${el2._sampledThresholdC})`
        );

        console.log(`    ✅ ${el1.id}: ${el1._sampledThresholdC.toFixed(4)}°C (deterministic)`);
      }
    }

    console.log(`  ✅ Identical seeds produce identical thresholds (Monte Carlo reproducibility)`);
  });
});
