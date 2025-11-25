/**
 * GDP-Adaptive Spending Tests (Nov 25, 2025)
 *
 * Verifies that scenario government priorities scale correctly with GDP changes.
 *
 * Context: Phase 3 governance scenarios crashed when fixed spending amounts
 * exceeded 50% GDP limit as GDP collapsed. GDP-adaptive rates fix this.
 */

import { describe, it, expect } from 'vitest';
import { ApplyScenarioPrioritiesPhase } from '@/simulation/engine/phases/ApplyScenarioPrioritiesPhase';
import { SCENARIO_CATALOG } from '@/types/scenarios';
import { createInitialGameState } from '@/simulation/initialization';
import { getGDPProxy } from '@/simulation/utils/recoveryCalculations';

describe('GDP-Adaptive Spending', () => {
  it('should scale research spending with GDP changes', () => {
    const scenario = SCENARIO_CATALOG['climate-first'];
    const state = createInitialGameState({ scenario });
    const phase = new ApplyScenarioPrioritiesPhase();
    const rng = () => 0.5;

    // Initial GDP should be ~$114T
    const initialGDP = getGDPProxy(state);
    expect(initialGDP).toBeGreaterThan(100);
    expect(initialGDP).toBeLessThan(120);

    // Apply scenario priorities at initial GDP
    phase.execute(state, rng);
    const initialResearchBudget = state.government.researchInvestments.totalBudget;

    // Research rate is 0.005 (0.5% GDP/year)
    // At $114T GDP: 114,000B × 0.005 / 12 = ~47.5B/month
    expect(initialResearchBudget).toBeGreaterThan(40);
    expect(initialResearchBudget).toBeLessThan(55);

    // Simulate GDP collapse to $20T (82.5% decline)
    state.humanPopulationSystem.population = 1.5; // 1.5B people
    state.globalMetrics.gdpPerCapita = 13.33; // $20T / 1.5B = $13,333/person

    // Verify GDP actually dropped
    const collapsedGDP = getGDPProxy(state);
    expect(collapsedGDP).toBeGreaterThan(15);
    expect(collapsedGDP).toBeLessThan(25);

    // Apply scenario priorities at collapsed GDP
    phase.execute(state, rng);
    const collapsedResearchBudget = state.government.researchInvestments.totalBudget;

    // Research rate is still 0.005 (0.5% GDP/year)
    // At $20T GDP: 20,000B × 0.005 / 12 = ~8.3B/month
    expect(collapsedResearchBudget).toBeGreaterThan(7);
    expect(collapsedResearchBudget).toBeLessThan(10);

    // Budget should scale proportionally with GDP
    const gdpRatio = collapsedGDP / initialGDP;
    const budgetRatio = collapsedResearchBudget / initialResearchBudget;
    expect(Math.abs(budgetRatio - gdpRatio)).toBeLessThan(0.01); // Within 1%

    console.log(`
      GDP-Adaptive Scaling Test:
        Initial GDP: $${initialGDP.toFixed(1)}T
        Collapsed GDP: $${collapsedGDP.toFixed(1)}T
        GDP ratio: ${(gdpRatio * 100).toFixed(1)}%

        Initial research: $${initialResearchBudget.toFixed(1)}B/month
        Collapsed research: $${collapsedResearchBudget.toFixed(1)}B/month
        Budget ratio: ${(budgetRatio * 100).toFixed(1)}%

        ✅ Research spending scaled correctly with GDP
    `);
  });

  it('should prevent crash from GDP-collapse with adaptive rates', () => {
    const scenario = SCENARIO_CATALOG['scientific-acceleration'];
    const state = createInitialGameState({ scenario });
    const phase = new ApplyScenarioPrioritiesPhase();
    const rng = () => 0.5;

    // Simulate GDP collapse to $1.2T (similar to actual crash conditions)
    state.humanPopulationSystem.population = 0.1; // 100M people
    state.globalMetrics.gdpPerCapita = 12.0; // $1.2T / 0.1B = $12,000/person

    const collapsedGDP = getGDPProxy(state);
    expect(collapsedGDP).toBeGreaterThan(1.0);
    expect(collapsedGDP).toBeLessThan(1.5);

    // Apply scenario priorities - should NOT throw
    expect(() => {
      phase.execute(state, rng);
    }).not.toThrow();

    // Research spending should be ~2% of $1.2T annual GDP
    // 1,200B × 0.02 / 12 = ~2B/month
    const researchBudget = state.government.researchInvestments.totalBudget;
    expect(researchBudget).toBeGreaterThan(1.5);
    expect(researchBudget).toBeLessThan(2.5);

    // Verify spending doesn't exceed 50% GDP limit
    const gdpInBillions = collapsedGDP * 1000;
    const maxSpending = (gdpInBillions * 0.5) / 12; // 50% annual GDP, monthly
    expect(researchBudget).toBeLessThan(maxSpending);

    console.log(`
      GDP-Collapse Safety Test:
        Collapsed GDP: $${collapsedGDP.toFixed(1)}T
        Research rate: 2.0% of annual GDP
        Research spending: $${researchBudget.toFixed(1)}B/month
        Max allowed: $${maxSpending.toFixed(1)}B/month (50% GDP/year)

        ✅ No crash, spending within physical limits
    `);
  });

  it('should reject scenarios specifying BOTH absolute and rate', () => {
    const state = createInitialGameState();
    state.scenario = {
      id: 'invalid-test',
      name: 'Invalid Test',
      description: 'Test validation',
      hypothesis: 'Test',
      techDeployment: { mode: 'immediate' },
      governmentPriorities: {
        researchInvestment: 50, // Absolute
        researchInvestmentRate: 0.005, // ALSO rate - should fail
      },
    };

    const phase = new ApplyScenarioPrioritiesPhase();
    const rng = () => 0.5;

    // Should throw error about conflicting specifications
    expect(() => {
      phase.execute(state, rng);
    }).toThrow(/Cannot specify BOTH researchInvestment.*AND researchInvestmentRate/);
  });

  it('should handle AI safety budget rates correctly', () => {
    const state = createInitialGameState();
    state.scenario = {
      id: 'test-ai-safety',
      name: 'Test AI Safety',
      description: 'Test',
      hypothesis: 'Test',
      techDeployment: { mode: 'immediate' },
      governmentPriorities: {
        aiSafetyBudgetRate: 0.01, // 1% of annual GDP
      },
    };

    const phase = new ApplyScenarioPrioritiesPhase();
    const rng = () => 0.5;

    const initialGDP = getGDPProxy(state);
    phase.execute(state, rng);

    // AI safety should be 1% of annual GDP, monthly
    // At $114T: 114,000B × 0.01 / 12 = ~95B/month
    const aiSafetyLevel = state.government.alignmentResearchInvestment;
    expect(aiSafetyLevel).toBeGreaterThan(90);
    expect(aiSafetyLevel).toBeLessThan(100);

    console.log(`
      AI Safety Budget Rate Test:
        GDP: $${initialGDP.toFixed(1)}T
        AI safety rate: 1.0% of annual GDP
        AI safety level: ${aiSafetyLevel.toFixed(1)} ($${aiSafetyLevel.toFixed(1)}B/month equiv)

        ✅ AI safety budget scaled correctly
    `);
  });
});
