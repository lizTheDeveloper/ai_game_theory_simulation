/**
 * ApplyScenarioPrioritiesPhase (1.5)
 *
 * Applies scenario-defined government priority overrides each month.
 * Used for systematic testing of specific governance strategies.
 *
 * **PURPOSE:**
 * God mode diagnostics (Phase 1.1) revealed bottlenecks blocking spirals:
 * - Research investment stuck at $10B (needs $50B+)
 * - Climate spending insufficient
 * - Redistribution rates too low
 *
 * This phase allows testing: "What if government spent $100B/month on research?"
 *
 * **EXECUTION ORDER:** 1.5 (after time advance, before agent actions)
 * - Must run BEFORE government/AI agent phases (2-8)
 * - Must run AFTER time advance (0)
 *
 * **DEPENDENCIES:**
 * - None (reads scenario from state, writes government priorities)
 *
 * **SIDE EFFECTS:**
 * - Overrides government spending decisions (research, climate, redistribution)
 * - Forces specific government type if specified
 * - Logs all overrides with 🎯 emoji
 *
 * **DEFENSIVE CODING:**
 * - All overrides validated with assertion utilities
 * - Fails loudly if invalid values
 * - No silent fallbacks
 *
 * @see src/types/scenario.ts - ScenarioDefinition interface
 * @see scripts/scenarioRunner.ts - Scenario execution system
 */

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { ScenarioGovernmentPriorities } from '@/types/scenario';
import {
  assertFinite,
  assertProbability,
  assertInRange,
  assertDefined
} from '@/simulation/utils/assertions';
import { getGDPProxy } from '@/simulation/utils/recoveryCalculations';

export class ApplyScenarioPrioritiesPhase implements SimulationPhase {
  readonly id = 'apply-scenario-priorities';
  readonly name = 'Apply Scenario Priorities';
  readonly order = 1.5;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];

    // Check if scenario is active
    if (!state.scenario || !state.scenario.governmentPriorities) {
      // No scenario or no priorities - skip this phase
      return { events };
    }

    const priorities = state.scenario.governmentPriorities;
    const overridesApplied: string[] = [];

    // === FIELD MAPPINGS (Phase 1.3 complete) ===
    // researchInvestment → government.researchInvestments.totalBudget
    // climateSpending → government.resources (monthly addition)
    // redistributionRate → ubiSystem.basicIncome.monthlyCost (activates UBI if needed)
    // aiSafetyBudget → government.alignmentResearchInvestment
    // democracyLevel → government.governanceQuality.* (all fields)
    // governmentType → government.governmentType

    if (priorities.researchInvestment !== undefined) {
      const value = assertFinite(priorities.researchInvestment, {
        location: 'ApplyScenarioPrioritiesPhase',
        valueName: 'researchInvestment',
        month: state.currentMonth
      });
      if (value < 0) {
        throw new Error(`❌ researchInvestment must be non-negative: ${value}`);
      }

      // Map to government research budget (billions/month)
      // This field is used by government agent to allocate research across domains
      const oldBudget = state.government.researchInvestments.totalBudget;
      state.government.researchInvestments.totalBudget = value;
      state.government.researchInvestments.budgetLimit = value; // Also update limit to allow spending

      overridesApplied.push(`Research: $${oldBudget.toFixed(1)}B → $${value.toFixed(1)}B/month`);
    }

    if (priorities.climateSpending !== undefined) {
      const value = assertProbability(priorities.climateSpending, {
        location: 'ApplyScenarioPrioritiesPhase',
        valueName: 'climateSpending',
        month: state.currentMonth
      });

      // Convert % of GDP to absolute value (billions/month)
      // GDP is annual, so divide by 12 to get monthly
      const gdp = assertFinite(getGDPProxy(state), {
        location: 'ApplyScenarioPrioritiesPhase',
        valueName: 'gdp',
        month: state.currentMonth
      });
      const monthlyClimateSpending = (value * gdp) / 12;

      // Map to government resources pool (used for environmental interventions)
      // Government.resources field is used for Amazon protection, reforestation, etc.
      // We add the climate spending to resources each month
      if (state.government.resources === undefined) {
        state.government.resources = 0;
      }
      state.government.resources += monthlyClimateSpending;

      overridesApplied.push(
        `Climate: ${(value * 100).toFixed(1)}% GDP (+$${monthlyClimateSpending.toFixed(1)}B to resources)`
      );
    }

    if (priorities.redistributionRate !== undefined) {
      const value = assertProbability(priorities.redistributionRate, {
        location: 'ApplyScenarioPrioritiesPhase',
        valueName: 'redistributionRate',
        month: state.currentMonth
      });

      // Convert % of GDP to absolute value (billions/month)
      const gdp = assertFinite(getGDPProxy(state), {
        location: 'ApplyScenarioPrioritiesPhase',
        valueName: 'gdp',
        month: state.currentMonth
      });
      const monthlyRedistribution = (value * gdp) / 12;

      // Map to UBI system monthly cost
      // If UBI not active, activate it with full coverage
      if (!state.ubiSystem.active) {
        state.ubiSystem.active = true;
        state.ubiSystem.startMonth = state.currentMonth;
        state.ubiSystem.basicIncome.coverage = 1.0; // Full coverage
        state.ubiSystem.basicIncome.adequacy = 0.8; // Adequate but not lavish
      }

      // Set UBI monthly cost to match redistribution target
      const oldCost = state.ubiSystem.basicIncome.monthlyCost;
      state.ubiSystem.basicIncome.monthlyCost = monthlyRedistribution;

      // Calculate per-person amount (billions / billion people = thousands per person)
      const population = state.humanPopulationSystem.population;
      const perPersonAmount = (monthlyRedistribution * 1e9) / (population * 1e9); // Convert billions to dollars
      state.ubiSystem.basicIncome.amount = perPersonAmount;

      overridesApplied.push(
        `Redistribution: ${(value * 100).toFixed(1)}% GDP ($${oldCost.toFixed(1)}B → $${monthlyRedistribution.toFixed(1)}B/month, $${perPersonAmount.toFixed(0)}/person)`
      );
    }

    if (priorities.aiSafetyBudget !== undefined) {
      const value = assertFinite(priorities.aiSafetyBudget, {
        location: 'ApplyScenarioPrioritiesPhase',
        valueName: 'aiSafetyBudget',
        month: state.currentMonth
      });
      if (value < 0) {
        throw new Error(`❌ aiSafetyBudget must be non-negative: ${value}`);
      }

      // Map to government alignment research investment
      // This field is [0,10] investment level, not absolute dollars
      // Convert billions/month to investment level: $1B = level 1
      const oldLevel = state.government.alignmentResearchInvestment;
      state.government.alignmentResearchInvestment = value; // Direct mapping (billions ≈ investment level)

      overridesApplied.push(`AI Safety: level ${oldLevel.toFixed(1)} → ${value.toFixed(1)} ($${value.toFixed(1)}B/month equiv)`);
    }

    if (priorities.democracyLevel !== undefined) {
      const value = assertProbability(priorities.democracyLevel, {
        location: 'ApplyScenarioPrioritiesPhase',
        valueName: 'democracyLevel',
        month: state.currentMonth
      });

      // Map to government governance quality metrics
      // Set all democracy-related fields to match target level
      const gov = state.government.governanceQuality;
      const oldParticipation = gov.participationRate;
      const oldTransparency = gov.transparency;

      gov.participationRate = value;
      gov.transparency = value;
      gov.decisionQuality = Math.max(gov.decisionQuality, value); // Don't decrease if already high
      gov.consensusBuildingEfficiency = value;
      gov.minorityProtectionStrength = value;

      // Also set backward compatibility fields
      state.government.democracy = value;
      state.government.democracyQuality = value;

      overridesApplied.push(
        `Democracy: ${(oldParticipation * 100).toFixed(0)}% → ${(value * 100).toFixed(0)}% (participation, transparency, consensus)`
      );
    }

    if (priorities.governmentType !== undefined) {
      const validTypes = ['democratic', 'authoritarian', 'mixed'] as const;
      if (!validTypes.includes(priorities.governmentType)) {
        throw new Error(`❌ Invalid governmentType: ${priorities.governmentType}`);
      }

      // Map scenario governmentType to GameState governmentType
      // 'mixed' in scenario → 'technocratic' in GameState (closest match)
      const mappedType: 'democratic' | 'authoritarian' | 'technocratic' =
        priorities.governmentType === 'mixed' ? 'technocratic' : priorities.governmentType;

      // Apply government type override (this field DOES exist)
      const oldType = state.government.governmentType;
      state.government.governmentType = mappedType;
      overridesApplied.push(`Gov: ${oldType} → ${mappedType}`);
    }

    // Log overrides (only if any were applied)
    if (overridesApplied.length > 0 && state.currentMonth % 6 === 0) {
      console.log(`\n🎯 SCENARIO PRIORITIES (Month ${state.currentMonth})`);
      console.log(`   Scenario: ${state.scenario.name}`);
      console.log(`   Overrides applied:`);
      for (const override of overridesApplied) {
        console.log(`     - ${override}`);
      }
    }

    // Create event for first override application
    if (overridesApplied.length > 0 && state.currentMonth === 0) {
      events.push({
        id: `scenario_start_${state.scenario.id}`,
        timestamp: state.currentMonth,
        type: 'policy',
        severity: 'info',
        agent: 'Scenario System',
        title: `🎬 Scenario Started: ${state.scenario.name}`,
        description: `${state.scenario.description}\n\nPriority overrides: ${overridesApplied.join(', ')}`,
        effects: {}
      });
    }

    return { events };
  }
}
