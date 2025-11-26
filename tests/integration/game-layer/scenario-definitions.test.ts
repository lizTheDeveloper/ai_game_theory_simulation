/**
 * Integration Test: Scenario Definitions (roadmap 5.4)
 *
 * Tests for src/simulation/scenarios/definitions.ts and ApplyScenarioPrioritiesPhase
 * Purpose: Verify governance scenarios correctly override state without crashing
 *
 * Test Coverage:
 * 1. All 11 governance scenarios load correctly
 * 2. Override parameters applied to state
 * 3. Scenarios don't crash during GDP collapse
 * 4. Percentage-based spending (not fixed dollars)
 *
 * Research Foundation:
 * - God mode diagnostics (Phase 1.1): Bottlenecks identified
 * - Scenario framework: systematic testing of governance strategies
 *
 * @module tests/integration/game-layer/scenario-definitions
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { SCENARIO_CATALOG } from '@/types/scenarios';
import { ApplyScenarioPrioritiesPhase } from '@/simulation/engine/phases/ApplyScenarioPrioritiesPhase';
import { initializeHistoricalSimulation } from '@/simulation/historicalInitialization';
import type { GameState } from '@/types/game';

describe('Scenario Definitions Integration Tests', () => {

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Create a test GameState with a scenario applied
   */
  function createStateWithScenario(scenarioId: string): GameState {
    const rng = createTestRng(42);
    const state = initializeHistoricalSimulation(
      2024, // start year (2025 not supported by historical init - using 2024)
      rng,
      'baseline' // scenario mode
    );

    // Apply scenario (manually since initializeHistoricalSimulation doesn't take scenario param)
    // Load scenario definition from catalog
    const scenario = SCENARIO_CATALOG[scenarioId as keyof typeof SCENARIO_CATALOG];
    if (scenario) {
      state.scenario = scenario;
    }

    return state;
  }

  /**
   * Deterministic RNG for testing
   */
  function createTestRng(seed: number = 42): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 2**32;
      return state / 2**32;
    };
  }

  /**
   * Simulate GDP collapse by dropping GDP to 10% of baseline
   */
  function simulateGDPCollapse(state: GameState): void {
    // GDP collapse: drop to 10% of baseline
    // globalMetrics.gdp is the primary GDP field
    state.globalMetrics.gdp = state.globalMetrics.gdp * 0.1;
    state.globalMetrics.economicTransitionStage = 0; // Economic collapse
  }

  // ============================================================================
  // Test 1: All Scenarios Load Without Errors
  // ============================================================================

  describe('Scenario Loading', () => {
    test('should load all 11 governance scenarios without errors', () => {
      const scenarioIds = [
        'climate-first',
        'equality-first',
        'ai-alignment-first',
        'democratic-participation',
        'scientific-acceleration',
        'authoritarian-efficiency',
        'high-trust-start',
        'low-inequality-start',
        'strong-institutions-start',
        'renewable-first',
        'carbon-removal-first',
      ];

      for (const scenarioId of scenarioIds) {
        assert.doesNotThrow(() => {
          const state = createStateWithScenario(scenarioId);
          assert.ok(state, `Should initialize state for scenario: ${scenarioId}`);
          assert.ok(state.scenario, `Should have scenario attached: ${scenarioId}`);
          assert.strictEqual(state.scenario.id, scenarioId,
            `Scenario ID should match: ${scenarioId}`);
        }, `Scenario ${scenarioId} should load without errors`);
      }
    });

    test('should have valid scenario definitions in SCENARIO_CATALOG', () => {
      const scenarios = Object.values(SCENARIO_CATALOG);

      assert.ok(scenarios.length >= 11,
        `Should have at least 11 scenarios, got ${scenarios.length}`);

      for (const scenario of scenarios) {
        assert.ok(scenario.id, `Scenario should have ID: ${JSON.stringify(scenario)}`);
        assert.ok(scenario.name, `Scenario ${scenario.id} should have name`);
        assert.ok(scenario.description, `Scenario ${scenario.id} should have description`);
        assert.ok(scenario.hypothesis, `Scenario ${scenario.id} should have hypothesis`);
        assert.ok(scenario.techDeployment, `Scenario ${scenario.id} should have techDeployment`);
      }
    });
  });

  // ============================================================================
  // Test 2: Override Parameters Applied Correctly
  // ============================================================================

  describe('Override Parameter Application', () => {
    test('should apply research investment override (climate-first)', () => {
      const state = createStateWithScenario('climate-first');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Execute phase to apply overrides
      phase.execute(state, rng);

      // climate-first scenario sets researchInvestmentRate: 0.005 (0.5% of annual GDP)
      // Verify government research budget was updated
      assert.ok(state.government.researchInvestments.totalBudget > 0,
        'Research investment should be set by scenario');
    });

    test('should apply climate spending override (climate-first)', () => {
      const state = createStateWithScenario('climate-first');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Execute phase to apply overrides
      phase.execute(state, rng);

      // climate-first scenario sets climateSpending: 0.10 (10% GDP/month)
      // Verify government resources increased
      assert.ok(state.government.resources && state.government.resources > 0,
        'Climate spending should increase government resources');
    });

    test('should apply redistribution override (equality-first)', () => {
      const state = createStateWithScenario('equality-first');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Execute phase to apply overrides
      phase.execute(state, rng);

      // equality-first scenario sets redistributionRate: 0.025 (2.5% GDP/month)
      // Verify UBI system activated and monthly cost set
      assert.ok(state.ubiSystem.active,
        'UBI should be activated by redistribution override');
      assert.ok(state.ubiSystem.basicIncome.monthlyCost > 0,
        'UBI monthly cost should be set');
    });

    test('should apply AI safety budget override (ai-alignment-first)', () => {
      const state = createStateWithScenario('ai-alignment-first');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Execute phase to apply overrides
      phase.execute(state, rng);

      // ai-alignment-first scenario sets aiSafetyBudgetRate: 0.01 (1% of annual GDP)
      // Verify government alignment research investment increased
      assert.ok(state.government.alignmentResearchInvestment > 0,
        'AI safety budget should be set by scenario');
    });

    test('should apply democracy level override (democratic-participation)', () => {
      const state = createStateWithScenario('democratic-participation');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Execute phase to apply overrides
      phase.execute(state, rng);

      // democratic-participation scenario sets democracyLevel: 0.9
      // Verify governance quality fields updated
      assert.ok(state.government.governanceQuality.participationRate >= 0.8,
        'Participation rate should be high in democratic-participation scenario');
      assert.ok(state.government.governanceQuality.transparency >= 0.8,
        'Transparency should be high in democratic-participation scenario');
    });

    test('should apply government type override (authoritarian-efficiency)', () => {
      const state = createStateWithScenario('authoritarian-efficiency');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Execute phase to apply overrides
      phase.execute(state, rng);

      // authoritarian-efficiency scenario sets governmentType: 'authoritarian'
      // Verify government type changed
      assert.strictEqual(state.government.governmentType, 'authoritarian',
        'Government type should be authoritarian in authoritarian-efficiency scenario');
    });
  });

  // ============================================================================
  // Test 3: GDP-Adaptive Spending (No Crashes During Collapse)
  // ============================================================================

  describe('GDP-Adaptive Spending', () => {
    test('should handle GDP collapse without NaN (climate-first)', () => {
      const state = createStateWithScenario('climate-first');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Simulate GDP collapse
      simulateGDPCollapse(state);

      // Execute phase - should adapt spending to collapsed GDP
      assert.doesNotThrow(() => {
        phase.execute(state, rng);
      }, 'Should not crash during GDP collapse');

      // Verify no NaN values produced
      assert.ok(Number.isFinite(state.government.researchInvestments.totalBudget),
        'Research budget should remain finite during GDP collapse');
      assert.ok(Number.isFinite(state.government.resources || 0),
        'Government resources should remain finite during GDP collapse');
    });

    test('should scale spending proportionally to GDP (scientific-acceleration)', () => {
      const state = createStateWithScenario('scientific-acceleration');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Get baseline GDP
      const baselineGDP = state.globalMetrics.gdp;

      // Execute phase at baseline
      phase.execute(state, rng);
      const baselineBudget = state.government.researchInvestments.totalBudget;

      // Simulate GDP drop to 50%
      state.globalMetrics.gdp = baselineGDP * 0.5;
      state.currentMonth = 1; // Advance month to re-apply

      // Execute phase again
      phase.execute(state, rng);
      const collapsedBudget = state.government.researchInvestments.totalBudget;

      // Budget should scale with GDP (approximately 50%)
      const budgetRatio = collapsedBudget / baselineBudget;
      assert.ok(budgetRatio >= 0.45 && budgetRatio <= 0.55,
        `Budget should scale with GDP: baseline=${baselineBudget}, collapsed=${collapsedBudget}, ratio=${budgetRatio}`);
    });

    test('should use percentage-based climate spending (green-new-deal)', () => {
      const state = createStateWithScenario('green-new-deal');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Get baseline GDP
      const baselineGDP = state.globalMetrics.gdp;
      const baselineResources = state.government.resources || 0;

      // Execute phase at baseline
      phase.execute(state, rng);
      const baselineResourceIncrease = (state.government.resources || 0) - baselineResources;

      // Simulate GDP growth to 200%
      state.globalMetrics.gdp = baselineGDP * 2.0;
      state.currentMonth = 1; // Advance month to re-apply
      const grownResources = state.government.resources || 0;

      // Execute phase again
      phase.execute(state, rng);
      const grownResourceIncrease = (state.government.resources || 0) - grownResources;

      // Resource increase should scale with GDP (approximately 200%)
      const resourceRatio = grownResourceIncrease / baselineResourceIncrease;
      assert.ok(resourceRatio >= 1.8 && resourceRatio <= 2.2,
        `Climate spending should scale with GDP: baseline=${baselineResourceIncrease}, grown=${grownResourceIncrease}, ratio=${resourceRatio}`);
    });

    test('should prevent resource accumulation overflow (climate-first)', () => {
      const state = createStateWithScenario('climate-first');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Execute phase for 24 months (accumulate resources)
      for (let i = 0; i < 24; i++) {
        state.currentMonth = i;
        phase.execute(state, rng);
      }

      // Resources should be capped at 12 months accumulation
      // climate-first: climateSpending = 0.10 (10% GDP/month)
      // Max resources = monthlySpending × 12
      const monthlySpending = (state.globalMetrics.gdp * 0.10) / 12;
      const maxResources = monthlySpending * 12;

      assert.ok((state.government.resources || 0) <= maxResources * 1.1,
        `Resources should be capped: current=${state.government.resources}, max=${maxResources}`);
    });
  });

  // ============================================================================
  // Test 4: Scenario-Specific Validation
  // ============================================================================

  describe('Scenario-Specific Validation', () => {
    test('should validate techno-optimist uses immediate deployment', () => {
      const scenario = SCENARIO_CATALOG['techno-optimist'];

      assert.ok(scenario, 'techno-optimist scenario should exist');
      assert.strictEqual(scenario.techDeployment.mode, 'immediate',
        'techno-optimist should use immediate tech deployment');
    });

    test('should validate degrowth uses limited deployment', () => {
      const scenario = SCENARIO_CATALOG['degrowth'];

      assert.ok(scenario, 'degrowth scenario should exist');
      assert.strictEqual(scenario.techDeployment.deploymentLevel, 0.4,
        'degrowth should use 40% deployment level (limited tech)');
    });

    test('should validate nordic-social-democracy uses sequenced deployment', () => {
      const scenario = SCENARIO_CATALOG['nordic-social-democracy'];

      assert.ok(scenario, 'nordic-social-democracy scenario should exist');
      assert.strictEqual(scenario.techDeployment.mode, 'sequenced',
        'nordic-social-democracy should use sequenced deployment (gradual absorption)');
    });

    test('should validate green-new-deal has high climate spending', () => {
      const scenario = SCENARIO_CATALOG['green-new-deal'];

      assert.ok(scenario, 'green-new-deal scenario should exist');
      assert.ok(scenario.governmentPriorities, 'green-new-deal should have government priorities');
      assert.strictEqual(scenario.governmentPriorities!.climateSpending, 0.10,
        'green-new-deal should have 10% GDP/month climate spending');
    });

    test('should validate authoritarian-climate has low democracy', () => {
      const scenario = SCENARIO_CATALOG['authoritarian-climate'];

      assert.ok(scenario, 'authoritarian-climate scenario should exist');
      assert.ok(scenario.governmentPriorities, 'authoritarian-climate should have government priorities');
      assert.strictEqual(scenario.governmentPriorities!.democracyLevel, 0.2,
        'authoritarian-climate should have democracy level 0.2');
    });
  });

  // ============================================================================
  // Test 5: Scenario Integration (Full Month Execution)
  // ============================================================================

  describe('Scenario Integration', () => {
    test('should execute scenario priorities every month for 12 months', () => {
      const state = createStateWithScenario('climate-first');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Execute for 12 months
      for (let month = 0; month < 12; month++) {
        state.currentMonth = month;

        assert.doesNotThrow(() => {
          const result = phase.execute(state, rng);
          assert.ok(result, `Phase should return result at month ${month}`);
        }, `Phase should execute without errors at month ${month}`);

        // Verify state remains valid
        assert.ok(Number.isFinite(state.government.researchInvestments.totalBudget),
          `Research budget should remain finite at month ${month}`);
        assert.ok(Number.isFinite(state.government.resources || 0),
          `Government resources should remain finite at month ${month}`);
      }
    });

    test('should maintain consistent priorities across months', () => {
      const state = createStateWithScenario('equality-first');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Execute at month 0
      phase.execute(state, rng);
      const month0UBICost = state.ubiSystem.basicIncome.monthlyCost;

      // Execute at month 6 (same GDP)
      state.currentMonth = 6;
      phase.execute(state, rng);
      const month6UBICost = state.ubiSystem.basicIncome.monthlyCost;

      // UBI cost should remain consistent (same GDP assumption)
      const costRatio = month6UBICost / month0UBICost;
      assert.ok(costRatio >= 0.95 && costRatio <= 1.05,
        `UBI cost should remain consistent: month0=${month0UBICost}, month6=${month6UBICost}, ratio=${costRatio}`);
    });

    test('should emit scenario start event at month 0', () => {
      const state = createStateWithScenario('green-new-deal');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      state.currentMonth = 0;
      const result = phase.execute(state, rng);

      // Should emit scenario start event
      assert.ok(result.events, 'Phase should return events');
      const startEvent = result.events!.find(e => e.id.startsWith('scenario_start_'));
      assert.ok(startEvent, 'Should emit scenario start event at month 0');
      assert.ok(startEvent!.title.includes('Green New Deal'),
        'Event title should include scenario name');
    });
  });

  // ============================================================================
  // Test 6: Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    test('should handle scenario with no government priorities', () => {
      const state = createStateWithScenario('no-tech');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // no-tech has no governmentPriorities
      assert.doesNotThrow(() => {
        const result = phase.execute(state, rng);
        assert.ok(result, 'Phase should return result even with no priorities');
        assert.ok(result.events!.length === 0, 'Should return empty events when no priorities');
      }, 'Should handle scenario with no government priorities');
    });

    test('should handle missing scenario gracefully', () => {
      const state = createStateWithScenario('no-tech');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Remove scenario from state
      delete (state as any).scenario;

      assert.doesNotThrow(() => {
        const result = phase.execute(state, rng);
        assert.ok(result, 'Phase should return result even without scenario');
      }, 'Should not crash when scenario is undefined');
    });

    test('should handle zero GDP gracefully', () => {
      const state = createStateWithScenario('climate-first');
      const phase = new ApplyScenarioPrioritiesPhase();
      const rng = createTestRng();

      // Set GDP to near-zero (extreme collapse)
      state.globalMetrics.gdp = 0.001; // $1B global GDP (apocalyptic)

      assert.doesNotThrow(() => {
        phase.execute(state, rng);
      }, 'Should not crash with near-zero GDP');

      // Spending should scale down to near-zero (not crash with division by zero)
      assert.ok(Number.isFinite(state.government.researchInvestments.totalBudget),
        'Research budget should remain finite with near-zero GDP');
    });
  });
});
