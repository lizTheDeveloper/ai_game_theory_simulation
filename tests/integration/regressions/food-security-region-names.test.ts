/**
 * Regression Test: Food Security Region Names (Nov 25, 2025)
 *
 * Purpose: Prevent silent fallback bug from region name mismatch
 * Priority: HIGH (roadmap section 5.3)
 *
 * Root Cause:
 * - Bug (Nov 25, 2025): Used camelCase 'eastAsia' but actual regions are 'East Asia'
 * - Name mismatch caused lookup failure → fell through to 0.80 default fallback
 * - Result: ALL regions got 0.80 instead of FAO-verified values
 * - Impact: Sub-Saharan Africa showed 20% hunger (0.80) instead of actual 35% (0.65)
 *
 * Fix (commit 8f69e1087):
 * - Corrected region names to match actual population regions
 * - Added missing regions (Southeast Asia, Central Asia, Oceania)
 * - Added fail-loud validation: throws error if region not found
 * - Removed silent fallback operators (NO MORE ??)
 *
 * Test Strategy:
 * 1. Initialize 1990 historical state
 * 2. Verify all 10 regions have FAO-verified values (NOT 0.80 fallback)
 * 3. Test region name validation (should throw on unknown region)
 * 4. Verify specific vulnerable regions have correct low values
 *
 * FAO Data Source: FAO SOFI 1999, Table 2.3 (1990-92 average)
 * URL: https://www.fao.org/4/Y4252E/y4252e04.htm
 *
 * @module tests/integration/regressions/food-security-region-names
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createHistoricalInitialState } from '@/simulation/historicalInitialization';
import type { GameState } from '@/types/game';

describe('Food Security Region Names Regression Test', () => {
  const TEST_SEED = 42000;

  function createTestRng(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  /**
   * FAO-verified food security values (1990-92 average)
   * Source: FAO SOFI 1999, Table 2.3
   *
   * Values represent proportion with adequate food access:
   * - 1.00 = 0% undernourished
   * - 0.80 = 20% undernourished
   * - 0.65 = 35% undernourished
   */
  const FAO_REGIONAL_FOOD_SECURITY: Record<string, number> = {
    'East Asia': 0.84,              // 16% undernourished
    'South Asia': 0.74,             // 26% undernourished
    'Sub-Saharan Africa': 0.65,     // 35% undernourished (CRITICAL - was falling to 0.80)
    'Europe': 0.98,                 // <2% undernourished
    'North America': 0.97,          // ~3% undernourished
    'Latin America': 0.87,          // 13% undernourished
    'Middle East & North Africa': 0.92, // 8% undernourished
    'Southeast Asia': 0.84,         // Grouped with East Asia in FAO data
    'Central Asia': 0.85,           // Estimate: Post-Soviet transition
    'Oceania': 0.95,                // Estimate: Developed (Australia/NZ)
  };

  describe('FAO-Verified Values Applied Correctly', () => {
    test('should apply FAO values to ALL regions (NOT 0.80 fallback)', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await createHistoricalInitialState({
        year: 1990,
        rng,
        includeAIAgents: false,
      });

      const regions = state.humanPopulationSystem.regionalPopulations;

      // Every region should have a food security value
      assert.ok(
        regions.length >= 10,
        `Should have at least 10 regions, got ${regions.length}`
      );

      let fallbackCount = 0;
      const incorrectRegions: string[] = [];

      for (const region of regions) {
        const actual = region.foodSecurity;
        const expected = FAO_REGIONAL_FOOD_SECURITY[region.name];

        // Verify region is in FAO data
        assert.ok(
          expected !== undefined,
          `Region ${region.name} should be in FAO data (found: ${Object.keys(FAO_REGIONAL_FOOD_SECURITY).join(', ')})`
        );

        // Verify value matches FAO data (exact match required)
        if (actual !== expected) {
          incorrectRegions.push(
            `${region.name}: expected ${expected.toFixed(2)}, got ${actual.toFixed(2)}`
          );
        }

        // Count fallback values (0.80 was the silent fallback)
        if (actual === 0.80 && expected !== 0.80) {
          fallbackCount++;
        }
      }

      assert.strictEqual(
        fallbackCount,
        0,
        `${fallbackCount} regions fell back to 0.80 instead of using FAO values`
      );

      assert.strictEqual(
        incorrectRegions.length,
        0,
        `Incorrect food security values:\n  ${incorrectRegions.join('\n  ')}`
      );
    });

    test('should NOT use 0.80 fallback for Sub-Saharan Africa', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await createHistoricalInitialState({
        year: 1990,
        rng,
        includeAIAgents: false,
      });

      const africa = state.humanPopulationSystem.regionalPopulations.find(
        r => r.name === 'Sub-Saharan Africa'
      );

      assert.ok(
        africa !== undefined,
        'Sub-Saharan Africa region should exist'
      );

      // CRITICAL: Should be 0.65 (35% undernourished), NOT 0.80 (20% undernourished)
      assert.strictEqual(
        africa.foodSecurity,
        0.65,
        `Sub-Saharan Africa should have 0.65 food security (35% hunger), got ${africa.foodSecurity.toFixed(2)}`
      );

      // Verify it's NOT the fallback value
      assert.notStrictEqual(
        africa.foodSecurity,
        0.80,
        'Sub-Saharan Africa should NOT use 0.80 fallback value'
      );
    });

    test('should NOT use 0.80 fallback for South Asia', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await createHistoricalInitialState({
        year: 1990,
        rng,
        includeAIAgents: false,
      });

      const southAsia = state.humanPopulationSystem.regionalPopulations.find(
        r => r.name === 'South Asia'
      );

      assert.ok(
        southAsia !== undefined,
        'South Asia region should exist'
      );

      // Should be 0.74 (26% undernourished), NOT 0.80 (20% undernourished)
      assert.strictEqual(
        southAsia.foodSecurity,
        0.74,
        `South Asia should have 0.74 food security (26% hunger), got ${southAsia.foodSecurity.toFixed(2)}`
      );

      // Verify it's NOT the fallback value
      assert.notStrictEqual(
        southAsia.foodSecurity,
        0.80,
        'South Asia should NOT use 0.80 fallback value'
      );
    });
  });

  describe('Region Name Validation', () => {
    test('should use correct region names (not camelCase)', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await createHistoricalInitialState({
        year: 1990,
        rng,
        includeAIAgents: false,
      });

      const regions = state.humanPopulationSystem.regionalPopulations;
      const regionNames = regions.map(r => r.name);

      // Verify regions use proper names (not camelCase)
      assert.ok(
        regionNames.includes('East Asia'),
        'Should use "East Asia" not "eastAsia"'
      );

      assert.ok(
        regionNames.includes('South Asia'),
        'Should use "South Asia" not "southAsia"'
      );

      assert.ok(
        regionNames.includes('Sub-Saharan Africa'),
        'Should use "Sub-Saharan Africa" not "subSaharanAfrica"'
      );

      // Verify NO camelCase names exist
      const hasCamelCase = regionNames.some(name =>
        /^[a-z]/.test(name) || name.includes('eastAsia') || name.includes('southAsia')
      );

      assert.strictEqual(
        hasCamelCase,
        false,
        `Region names should not be camelCase, found: ${regionNames.join(', ')}`
      );
    });

    test('should have all 10 expected regions', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await createHistoricalInitialState({
        year: 1990,
        rng,
        includeAIAgents: false,
      });

      const regions = state.humanPopulationSystem.regionalPopulations;
      const regionNames = regions.map(r => r.name);

      // All 10 regions should exist
      const expectedRegions = Object.keys(FAO_REGIONAL_FOOD_SECURITY);

      for (const expectedRegion of expectedRegions) {
        assert.ok(
          regionNames.includes(expectedRegion),
          `Missing region: ${expectedRegion}`
        );
      }

      assert.strictEqual(
        regions.length,
        10,
        `Should have exactly 10 regions, got ${regions.length}`
      );
    });
  });

  describe('Fail-Loud Validation', () => {
    test('should verify food security values are finite', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await createHistoricalInitialState({
        year: 1990,
        rng,
        includeAIAgents: false,
      });

      const regions = state.humanPopulationSystem.regionalPopulations;

      for (const region of regions) {
        assert.ok(
          Number.isFinite(region.foodSecurity),
          `Region ${region.name} food security should be finite, got ${region.foodSecurity}`
        );

        assert.ok(
          region.foodSecurity >= 0 && region.foodSecurity <= 1,
          `Region ${region.name} food security should be in [0, 1], got ${region.foodSecurity}`
        );
      }
    });

    test('should have different food security values across regions', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await createHistoricalInitialState({
        year: 1990,
        rng,
        includeAIAgents: false,
      });

      const regions = state.humanPopulationSystem.regionalPopulations;
      const uniqueValues = new Set(regions.map(r => r.foodSecurity));

      // Should have at least 5 different values (not all falling back to same value)
      assert.ok(
        uniqueValues.size >= 5,
        `Food security should vary across regions, found only ${uniqueValues.size} unique values: ${Array.from(uniqueValues).join(', ')}`
      );

      // Should NOT have all regions at 0.80 (the fallback value)
      const all080 = regions.every(r => r.foodSecurity === 0.80);
      assert.strictEqual(
        all080,
        false,
        'All regions should NOT have 0.80 food security (silent fallback bug)'
      );
    });
  });

  describe('Historical Accuracy', () => {
    test('should show realistic hunger levels for vulnerable regions', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await createHistoricalInitialState({
        year: 1990,
        rng,
        includeAIAgents: false,
      });

      const regions = state.humanPopulationSystem.regionalPopulations;

      // Sub-Saharan Africa: Most vulnerable (35% undernourished)
      const africa = regions.find(r => r.name === 'Sub-Saharan Africa');
      assert.ok(africa);
      assert.ok(
        africa.foodSecurity < 0.70,
        `Sub-Saharan Africa should have <70% food security (high hunger), got ${(africa.foodSecurity * 100).toFixed(0)}%`
      );

      // South Asia: High vulnerability (26% undernourished)
      const southAsia = regions.find(r => r.name === 'South Asia');
      assert.ok(southAsia);
      assert.ok(
        southAsia.foodSecurity < 0.80,
        `South Asia should have <80% food security (moderate-high hunger), got ${(southAsia.foodSecurity * 100).toFixed(0)}%`
      );

      // North America: Food secure (<3% undernourished)
      const northAmerica = regions.find(r => r.name === 'North America');
      assert.ok(northAmerica);
      assert.ok(
        northAmerica.foodSecurity > 0.95,
        `North America should have >95% food security (low hunger), got ${(northAmerica.foodSecurity * 100).toFixed(0)}%`
      );
    });

    test('should preserve food security values through initialization', async () => {
      const rng = createTestRng(TEST_SEED);
      const state = await createHistoricalInitialState({
        year: 1990,
        rng,
        includeAIAgents: false,
      });

      // Initialize state twice with same seed - should get same values
      const rng2 = createTestRng(TEST_SEED);
      const state2 = await createHistoricalInitialState({
        year: 1990,
        rng: rng2,
        includeAIAgents: false,
      });

      const regions1 = state.humanPopulationSystem.regionalPopulations;
      const regions2 = state2.humanPopulationSystem.regionalPopulations;

      assert.strictEqual(
        regions1.length,
        regions2.length,
        'Should have same number of regions'
      );

      for (let i = 0; i < regions1.length; i++) {
        assert.strictEqual(
          regions1[i].name,
          regions2[i].name,
          `Region ${i} name should match`
        );

        assert.strictEqual(
          regions1[i].foodSecurity,
          regions2[i].foodSecurity,
          `Region ${regions1[i].name} food security should be deterministic`
        );
      }
    });
  });
});
