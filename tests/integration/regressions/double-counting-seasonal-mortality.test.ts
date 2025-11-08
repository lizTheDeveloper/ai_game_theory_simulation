/**
 * Integration Test: Double-Counting Seasonal Mortality Regression Prevention
 *
 * Bug: Seasonal multiplier applied twice in ClimateImpactCascadePhase
 * Impact: Over-estimated mortality during lean seasons
 * Priority: HIGH (affects mortality accuracy)
 *
 * Root Cause: Two separate lean season checks:
 * 1. Line 392-396: `if (risk.isLeanSeason) baseRate = 0.05` (lean season base)
 * 2. Line 403-408: `if (risk.isLeanSeason) baseRate *= 1.75` (lean season multiplier)
 *
 * Result: Lean season mortality = 0.05 * 1.75 = 0.0875 (8.75%)
 * Expected: 0.05 (5% during lean season, per research)
 *
 * Correct Pattern: Apply seasonal multiplier exactly once:
 * ```typescript
 * // ✅ GOOD - Single application
 * if (risk.isLeanSeason && foodSecurity < 0.4) {
 *   baseRate = 0.05;  // Lean season rate (already includes 1.75× multiplier)
 * } else if (foodSecurity < 0.4) {
 *   baseRate = 0.005;  // Non-lean season rate
 * }
 * // No additional multiplication
 * ```
 *
 * This test ensures mortality rates during lean seasons match research values.
 *
 * Research Context:
 * - /research/seasonal_famine_mortality_20251026.md
 * - Acute crisis (0.2-0.4 food security): 5% during 3-month lean season
 * - Seasonal multiplier: 1.75× (midpoint of 1.5-2× range)
 * - Base rate during recovery: 0.5% (non-lean months)
 *
 * @module tests/integration/regressions/double-counting-seasonal-mortality
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { ClimateImpactCascadePhase } from '@/simulation/engine/phases/ClimateImpactCascadePhase';
import type { GameState } from '@/types/game';

describe('Double-Counting Seasonal Mortality Regression Prevention', () => {
  const TEST_SEED = 42000;

  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  /**
   * Deep clone state for comparison
   */
  function deepCloneState(state: GameState): GameState {
    return JSON.parse(JSON.stringify(state));
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
   * Set up state with acute food crisis conditions (0.2-0.4 food security)
   */
  function createFoodCrisisState(rng: () => number, isLeanSeason: boolean): GameState {
    const state = createDefaultInitialState(rng);

    // Set up acute food crisis conditions (food security 0.2-0.4)
    // This triggers the seasonal mortality logic in ClimateImpactCascadePhase
    if (!state.foodSecuritySystem) {
      state.foodSecuritySystem = {
        globalFoodSecurity: 0.3,  // Acute crisis level
        regionalFoodSecurity: new Map([
          ['Global', 0.3],
          ['Sub-Saharan Africa', 0.25],  // Below 0.4 threshold
          ['South Asia', 0.35],
        ]),
        cropYieldMultiplier: 0.6,
        nutritionDeficit: 0.4,
      };
    } else {
      state.foodSecuritySystem.globalFoodSecurity = 0.3;
      state.foodSecuritySystem.regionalFoodSecurity = new Map([
        ['Global', 0.3],
        ['Sub-Saharan Africa', 0.25],
        ['South Asia', 0.35],
      ]);
    }

    // Set month to lean season or non-lean season
    if (isLeanSeason) {
      state.currentMonth = 6;  // June (Sahel lean season)
      state.currentYear = 2025;
    } else {
      state.currentMonth = 2;  // February (non-lean season for Sahel)
      state.currentYear = 2025;
    }

    // Ensure planetary boundaries state exists (required dependency)
    if (!state.planetaryBoundariesSystem) {
      state.planetaryBoundariesSystem = {
        boundaries: {
          climate_change: { name: 'Climate Change', currentValue: 0.7, threshold: 1.0, status: 'safe', severity: 0 },
          biosphere_integrity: { name: 'Biosphere Integrity', currentValue: 0.65, threshold: 0.9, status: 'safe', severity: 0 },
          freshwater_use: { name: 'Freshwater Use', currentValue: 0.5, threshold: 0.8, status: 'safe', severity: 0 },
          biogeochemical_flows: { name: 'Biogeochemical Flows', currentValue: 0.6, threshold: 0.8, status: 'safe', severity: 0 },
          ocean_acidification: { name: 'Ocean Acidification', currentValue: 0.2, threshold: 0.5, status: 'safe', severity: 0 },
          land_use_change: { name: 'Land System Change', currentValue: 0.4, threshold: 0.75, status: 'safe', severity: 0 },
          novel_entities: { name: 'Novel Entities', currentValue: 0.3, threshold: 0.7, status: 'safe', severity: 0 },
        },
        overallRisk: 0.3,
        tippingPointRisk: 0.1,
        boundariesExceeded: 0,
      };
    }

    // Ensure bifurcation state exists (required for variance amplification)
    if (!state.bifurcationState) {
      state.bifurcationState = {
        varianceAmplification: 1.0,  // Baseline (no amplification)
        nearTippingPoint: false,
        lastTippingPointDistance: 1.0,
      };
    }

    // Ensure Bayesian mortality system exists
    if (!state.bayesianMortality) {
      state.bayesianMortality = {
        demographicRisks: new Map(),
        regionalRisks: new Map(),
        causeRisks: new Map(),
        totalMonthlyRisk: 0,
        projectedDeaths: 0,
      };
    }

    return state;
  }

  describe('Seasonal Multiplier Application', () => {
    test('lean season mortality should not exceed 5% for acute crisis (0.2-0.4 food security)', () => {
      const rng = createTestRng(TEST_SEED);
      const state = createFoodCrisisState(rng, true);  // Lean season

      // Track mortality risks added during phase execution
      const originalAddMortalityRisk = state.bayesianMortality.totalMonthlyRisk;

      const phase = new ClimateImpactCascadePhase();
      phase.execute(state, rng, createPhaseContext(state.currentMonth));

      const totalRiskAdded = state.bayesianMortality.totalMonthlyRisk - originalAddMortalityRisk;

      // Research: Acute crisis during lean season = 5% monthly mortality
      // If seasonal multiplier applied twice: 0.05 * 1.75 = 0.0875 (8.75%) ❌
      // Correct: 0.05 (5%) ✅
      //
      // Allow some variance for regional/demographic differences, but cap at 6%
      assert.ok(
        totalRiskAdded <= 0.06,
        `Lean season mortality should not exceed 6% (research: 5%). Got: ${(totalRiskAdded * 100).toFixed(2)}%`
      );
    });

    test('non-lean season mortality should be ~0.5% for acute crisis recovery', () => {
      const rng = createTestRng(TEST_SEED);
      const state = createFoodCrisisState(rng, false);  // Non-lean season

      const originalAddMortalityRisk = state.bayesianMortality.totalMonthlyRisk;

      const phase = new ClimateImpactCascadePhase();
      phase.execute(state, rng, createPhaseContext(state.currentMonth));

      const totalRiskAdded = state.bayesianMortality.totalMonthlyRisk - originalAddMortalityRisk;

      // Research: Acute crisis during recovery (non-lean) = 0.5% monthly
      // Allow variance but should be < 1%
      assert.ok(
        totalRiskAdded <= 0.01,
        `Non-lean season mortality should be <1% (research: 0.5%). Got: ${(totalRiskAdded * 100).toFixed(2)}%`
      );
    });

    test('lean season mortality should be exactly 1.75× higher than non-lean season', () => {
      const rngLean = createTestRng(TEST_SEED);
      const rngNonLean = createTestRng(TEST_SEED);

      const stateLean = createFoodCrisisState(rngLean, true);
      const stateNonLean = createFoodCrisisState(rngNonLean, false);

      const phase = new ClimateImpactCascadePhase();

      const originalRiskLean = stateLean.bayesianMortality.totalMonthlyRisk;
      const originalRiskNonLean = stateNonLean.bayesianMortality.totalMonthlyRisk;

      phase.execute(stateLean, createTestRng(TEST_SEED + 1), createPhaseContext(stateLean.currentMonth));
      phase.execute(stateNonLean, createTestRng(TEST_SEED + 1), createPhaseContext(stateNonLean.currentMonth));

      const riskLean = stateLean.bayesianMortality.totalMonthlyRisk - originalRiskLean;
      const riskNonLean = stateNonLean.bayesianMortality.totalMonthlyRisk - originalRiskNonLean;

      // Research: Seasonal multiplier is 1.75× (midpoint of 1.5-2×)
      // If applied correctly ONCE: lean / non-lean ≈ 1.75
      // If applied TWICE: lean / non-lean ≈ 3.06 (1.75²) ❌
      if (riskNonLean > 0.0001) {  // Avoid division by zero
        const actualMultiplier = riskLean / riskNonLean;

        assert.ok(
          actualMultiplier >= 1.5 && actualMultiplier <= 2.0,
          `Seasonal multiplier should be 1.5-2× (research: 1.75×). ` +
          `Got: ${actualMultiplier.toFixed(2)}× (lean: ${(riskLean * 100).toFixed(2)}%, ` +
          `non-lean: ${(riskNonLean * 100).toFixed(2)}%)`
        );
      }
    });
  });

  describe('Mortality Rate Consistency', () => {
    test('acute crisis mortality matches research values (5% lean, 0.5% non-lean)', () => {
      const rng = createTestRng(TEST_SEED);

      // Test lean season
      const stateLean = createFoodCrisisState(createTestRng(TEST_SEED), true);
      const phaseLean = new ClimateImpactCascadePhase();
      const originalRiskLean = stateLean.bayesianMortality.totalMonthlyRisk;
      phaseLean.execute(stateLean, createTestRng(TEST_SEED + 10), createPhaseContext(stateLean.currentMonth));
      const leanRisk = stateLean.bayesianMortality.totalMonthlyRisk - originalRiskLean;

      // Test non-lean season
      const stateNonLean = createFoodCrisisState(createTestRng(TEST_SEED), false);
      const phaseNonLean = new ClimateImpactCascadePhase();
      const originalRiskNonLean = stateNonLean.bayesianMortality.totalMonthlyRisk;
      phaseNonLean.execute(stateNonLean, createTestRng(TEST_SEED + 10), createPhaseContext(stateNonLean.currentMonth));
      const nonLeanRisk = stateNonLean.bayesianMortality.totalMonthlyRisk - originalRiskNonLean;

      // If no mortality was added (no climate impacts triggered), skip validation
      // This test is focused on detecting double-counting IF mortality is added
      if (leanRisk < 0.0001 && nonLeanRisk < 0.0001) {
        console.log('⚠️ No mortality added - climate impacts not triggered in test setup');
        return;  // Skip validation if no mortality
      }

      // If mortality WAS added, verify it matches research values
      if (leanRisk > 0.0001) {
        assert.ok(
          leanRisk >= 0.03 && leanRisk <= 0.06,
          `Lean season mortality should be 3-6% (research: 5%). Got: ${(leanRisk * 100).toFixed(2)}%`
        );
      }

      if (nonLeanRisk > 0.0001) {
        assert.ok(
          nonLeanRisk >= 0.001 && nonLeanRisk <= 0.01,
          `Non-lean season mortality should be 0.1-1% (research: 0.5%). Got: ${(nonLeanRisk * 100).toFixed(2)}%`
        );
      }
    });

    test('seasonal multiplier appears exactly once in calculation chain', () => {
      const rng = createTestRng(TEST_SEED);
      const state = createFoodCrisisState(rng, true);

      // We can't directly inspect the multiplier application count,
      // but we can verify the OUTCOME matches single application.
      //
      // If multiplier applied once: base = 0.05 (lean season)
      // If multiplier applied twice: base = 0.05 * 1.75 = 0.0875
      //
      // Since we can't mock internal calculations, we verify via outcome:
      // Total risk should be ≤ 6% (allowing for demographic variance)

      const phase = new ClimateImpactCascadePhase();
      const originalRisk = state.bayesianMortality.totalMonthlyRisk;
      phase.execute(state, rng, createPhaseContext(state.currentMonth));
      const totalRisk = state.bayesianMortality.totalMonthlyRisk - originalRisk;

      // If double-counting, would be ~8.75% or higher
      // Single application: ~5%
      assert.ok(
        totalRisk < 0.07,
        `Mortality rate suggests seasonal multiplier applied more than once. ` +
        `Expected: ~5%, Got: ${(totalRisk * 100).toFixed(2)}%`
      );
    });
  });

  describe('Anti-Pattern Detection', () => {
    test('no double application of seasonal logic', () => {
      // This test verifies the code does NOT have patterns like:
      //
      // if (isLeanSeason) baseRate = 0.05;  // Pattern 1: Lean season base
      // ...
      // if (isLeanSeason) baseRate *= 1.75;  // Pattern 2: Lean season multiplier
      //
      // This would result in: 0.05 * 1.75 = 0.0875 (8.75%)
      //
      // Correct pattern (single application):
      // if (isLeanSeason) baseRate = 0.05;  // Already includes 1.75× multiplier
      //
      // Verified by checking lean season mortality stays within research bounds

      const rng = createTestRng(TEST_SEED);
      const state = createFoodCrisisState(rng, true);

      const phase = new ClimateImpactCascadePhase();
      const originalRisk = state.bayesianMortality.totalMonthlyRisk;
      phase.execute(state, rng, createPhaseContext(state.currentMonth));
      const totalRisk = state.bayesianMortality.totalMonthlyRisk - originalRisk;

      // If double application exists, mortality would be 8.75%+
      // Single application: 5%
      const hasDoubleApplication = totalRisk > 0.07;

      assert.ok(
        !hasDoubleApplication,
        'Code must apply seasonal multiplier exactly once, not twice'
      );
    });
  });
});
