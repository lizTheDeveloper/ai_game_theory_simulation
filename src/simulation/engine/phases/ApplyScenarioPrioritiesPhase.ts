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
 * **EXECUTION ORDER:** 1.5 (early in step, before agent actions)
 * - Must run BEFORE government/AI agent phases (2-8)
 * - Runs early to set priorities for the current month
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
import { ScenarioGovernmentPriorities } from '@/types/scenarios';
import {
  assertFinite,
  assertProbability,
  assertInRange,
  assertDefined,
  assertEconomicMetric
} from '@/simulation/utils/assertions';
import { getGDPProxy } from '@/simulation/utils/recoveryCalculations';

/**
 * Validation Boundaries for Scenario Overrides (Nov 14, 2025)
 *
 * Scenarios test "what if" governance strategies, but must respect physical/economic constraints.
 * These bounds prevent impossible states while preserving scenario flexibility.
 *
 * **PHILOSOPHY:**
 * - Physically impossible values → FAIL LOUDLY (❌)
 * - Unrealistic but possible values → WARN (⚠️)
 * - Realistic values → Silent success
 *
 * **RESEARCH BOUNDS:**
 * - Research investment: Max 50% of GDP/year (extremely generous)
 *   - Historical: US ~3% GDP on R&D (NSF 2024)
 *   - Wartime: Manhattan Project ~0.4% GDP
 * - Climate spending: Max 10% GDP/month (crisis-level mobilization)
 *   - Historical: US WWII spending ~40% GDP/year (~3.3%/month)
 *   - Green New Deal proposals: 2-5% GDP/year
 * - Redistribution: Max 50% GDP/year (revolutionary)
 *   - Nordic countries: ~30% GDP on social spending
 *   - UBI proposals: ~10-20% GDP
 * - AI safety: Max $100B/month (no economic precedent, but physically possible)
 * - Government resources: Max 1 year of accumulation (prevents infinite pools)
 *
 * @see docs/wiki/README.md - Scenario testing system
 */
const SCENARIO_VALIDATION = {
  // Research investment (billions/month)
  researchInvestment: {
    // Maximum: 50% of annual GDP, converted to monthly
    // Example: Global GDP ~114T (2025) = $114,000B → max 114,000 * 0.5 / 12 = ~4,750B/month
    maxFractionOfAnnualGDP: 0.5,
    warnThreshold: 0.1, // Warn if >10% GDP/year (~950B/month at $114T GDP)
  },
  // Climate spending (% of GDP)
  climateSpending: {
    maxFraction: 0.10, // 10% GDP/month (crisis mobilization)
    warnThreshold: 0.05, // Warn if >5% GDP/month
  },
  // Redistribution (% of GDP)
  redistributionRate: {
    maxFraction: 0.50 / 12, // 50% GDP/year → monthly
    warnThreshold: 0.30 / 12, // 30% GDP/year → monthly
  },
  // AI safety budget (billions/month)
  aiSafetyBudget: {
    maxAbsolute: 100, // $100B/month (no precedent, but physically possible)
    warnThreshold: 10, // Warn if >$10B/month
  },
  // Government resources accumulation (months)
  resourcesMaxAccumulation: 12, // Max 1 year of climate spending accumulation
};

/**
 * Validate Scenario Override Values (Nov 14, 2025)
 *
 * Ensures scenario overrides respect physical/economic constraints.
 * Returns validated value or throws if physically impossible.
 *
 * **THREE VALIDATION LEVELS:**
 * 1. **Finite check:** All values must be finite (not NaN/Infinity)
 * 2. **Physical impossibility:** Fail loudly (❌) - values that violate hard constraints
 * 3. **Unrealistic warning:** Log warning (⚠️) - values that are possible but extreme
 *
 * @param priorities - Scenario government priorities to validate
 * @param state - Current game state (for GDP-based bounds)
 * @returns Warnings array (for logging)
 * @throws Error if values are physically impossible
 */
function validateScenarioOverrides(
  priorities: ScenarioGovernmentPriorities,
  state: GameState
): string[] {
  const warnings: string[] = [];
  const gdp = assertFinite(getGDPProxy(state), {
    location: 'validateScenarioOverrides',
    valueName: 'gdp',
    month: state.currentMonth
  });

  // === RESEARCH INVESTMENT VALIDATION ===
  // Support both fixed amount and GDP rate
  if (priorities.researchInvestmentRate !== undefined) {
    const rate = priorities.researchInvestmentRate;

    // Probability check (fail if outside [0, 1])
    assertProbability(rate, {
      location: 'validateScenarioOverrides',
      valueName: 'researchInvestmentRate',
      month: state.currentMonth
    });

    // Physical impossibility: Max 50% of annual GDP
    if (rate > SCENARIO_VALIDATION.researchInvestment.maxFractionOfAnnualGDP) {
      const gdpInBillions = gdp * 1000;
      const monthlyValue = (gdpInBillions * rate) / 12;
      throw new Error(
        `❌ SCENARIO OVERRIDE PHYSICALLY IMPOSSIBLE: researchInvestmentRate\n` +
        `   Rate: ${(rate * 100).toFixed(1)}% of annual GDP\n` +
        `   Maximum: ${(SCENARIO_VALIDATION.researchInvestment.maxFractionOfAnnualGDP * 100).toFixed(1)}% of annual GDP\n` +
        `   Equivalent monthly spending: $${monthlyValue.toFixed(1)}B\n` +
        `   GDP: $${gdp.toFixed(1)}T/year\n` +
        `   Month: ${state.currentMonth}\n` +
        `\n` +
        `   This exceeds physically plausible research spending.\n` +
        `   Historical context:\n` +
        `   - US R&D: ~3% GDP\n` +
        `   - Manhattan Project: ~0.4% GDP\n` +
        `\n` +
        `   Reduce scenario researchInvestmentRate to ≤${(SCENARIO_VALIDATION.researchInvestment.maxFractionOfAnnualGDP * 100).toFixed(1)}%.`
      );
    }

    // Unrealistic warning: >10% GDP/year
    if (rate > SCENARIO_VALIDATION.researchInvestment.warnThreshold) {
      warnings.push(
        `⚠️  Research investment: ${(rate * 100).toFixed(1)}% GDP/year - EXTREMELY HIGH (historical: 1-3% GDP)`
      );
    }
  } else if (priorities.researchInvestment !== undefined) {
    const value = priorities.researchInvestment;

    // Finite check (fail if NaN/Infinity)
    assertFinite(value, {
      location: 'validateScenarioOverrides',
      valueName: 'researchInvestment',
      month: state.currentMonth
    });

    // Non-negative check (fail if negative)
    if (value < 0) {
      throw new Error(`❌ researchInvestment must be non-negative: ${value}`);
    }

    // Physical impossibility: Max 50% of annual GDP (monthly)
    // GDP is in trillions, value is in billions, so multiply GDP by 1000
    const gdpInBillions = gdp * 1000;
    const maxResearchBudget = (gdpInBillions * SCENARIO_VALIDATION.researchInvestment.maxFractionOfAnnualGDP) / 12;
    if (value > maxResearchBudget) {
      throw new Error(
        `❌ SCENARIO OVERRIDE PHYSICALLY IMPOSSIBLE: researchInvestment\n` +
        `   Value: $${value.toFixed(1)}B/month\n` +
        `   Maximum: $${maxResearchBudget.toFixed(1)}B/month (50% of annual GDP)\n` +
        `   GDP: $${gdp.toFixed(1)}T/year\n` +
        `   Month: ${state.currentMonth}\n` +
        `\n` +
        `   This exceeds physically plausible research spending.\n` +
        `   Historical context:\n` +
        `   - US R&D: ~3% GDP (~$750B/year = $62.5B/month)\n` +
        `   - Manhattan Project: ~0.4% GDP (~$2B in 1945 = ~$30B today)\n` +
        `\n` +
        `   Reduce scenario researchInvestment to ≤${maxResearchBudget.toFixed(1)}B/month\n` +
        `   OR use researchInvestmentRate for GDP-adaptive spending (RECOMMENDED).`
      );
    }

    // Unrealistic warning: >10% GDP/year
    // GDP is in trillions, value is in billions, so use gdpInBillions
    const warnThreshold = (gdpInBillions * SCENARIO_VALIDATION.researchInvestment.warnThreshold) / 12;
    if (value > warnThreshold) {
      warnings.push(
        `⚠️  Research investment: $${value.toFixed(1)}B/month (${((value * 12 / gdpInBillions) * 100).toFixed(1)}% GDP/year) - EXTREMELY HIGH (historical: 1-3% GDP)`
      );
    }
  }

  // === CLIMATE SPENDING VALIDATION ===
  if (priorities.climateSpending !== undefined) {
    const value = priorities.climateSpending;

    // Probability check (fail if outside [0, 1])
    assertProbability(value, {
      location: 'validateScenarioOverrides',
      valueName: 'climateSpending',
      month: state.currentMonth
    });

    // Physical impossibility: Max 10% GDP/month
    if (value > SCENARIO_VALIDATION.climateSpending.maxFraction) {
      throw new Error(
        `❌ SCENARIO OVERRIDE PHYSICALLY IMPOSSIBLE: climateSpending\n` +
        `   Value: ${(value * 100).toFixed(1)}% GDP/month\n` +
        `   Maximum: ${(SCENARIO_VALIDATION.climateSpending.maxFraction * 100).toFixed(1)}% GDP/month\n` +
        `   Month: ${state.currentMonth}\n` +
        `\n` +
        `   This exceeds crisis-level mobilization spending.\n` +
        `   Historical context:\n` +
        `   - US WWII: ~40% GDP/year (~3.3% GDP/month)\n` +
        `   - Green New Deal: 2-5% GDP/year\n` +
        `\n` +
        `   Reduce scenario climateSpending to ≤${(SCENARIO_VALIDATION.climateSpending.maxFraction * 100).toFixed(1)}%.`
      );
    }

    // Unrealistic warning: >5% GDP/month
    if (value > SCENARIO_VALIDATION.climateSpending.warnThreshold) {
      warnings.push(
        `⚠️  Climate spending: ${(value * 100).toFixed(1)}% GDP/month - CRISIS MOBILIZATION LEVEL (WWII: ~3.3% GDP/month)`
      );
    }
  }

  // === REDISTRIBUTION RATE VALIDATION ===
  if (priorities.redistributionRate !== undefined) {
    const value = priorities.redistributionRate;

    // Probability check (fail if outside [0, 1])
    assertProbability(value, {
      location: 'validateScenarioOverrides',
      valueName: 'redistributionRate',
      month: state.currentMonth
    });

    // Physical impossibility: Max 50% GDP/year (monthly)
    if (value > SCENARIO_VALIDATION.redistributionRate.maxFraction) {
      throw new Error(
        `❌ SCENARIO OVERRIDE PHYSICALLY IMPOSSIBLE: redistributionRate\n` +
        `   Value: ${(value * 100).toFixed(1)}% GDP/month (${(value * 12 * 100).toFixed(1)}% GDP/year)\n` +
        `   Maximum: ${(SCENARIO_VALIDATION.redistributionRate.maxFraction * 12 * 100).toFixed(1)}% GDP/year\n` +
        `   Month: ${state.currentMonth}\n` +
        `\n` +
        `   This exceeds revolutionary redistribution levels.\n` +
        `   Historical context:\n` +
        `   - Nordic countries: ~30% GDP on social spending\n` +
        `   - UBI proposals: 10-20% GDP\n` +
        `\n` +
        `   Reduce scenario redistributionRate to ≤${(SCENARIO_VALIDATION.redistributionRate.maxFraction * 100).toFixed(2)}% (monthly).`
      );
    }

    // Unrealistic warning: >30% GDP/year
    if (value > SCENARIO_VALIDATION.redistributionRate.warnThreshold) {
      warnings.push(
        `⚠️  Redistribution: ${(value * 12 * 100).toFixed(1)}% GDP/year - REVOLUTIONARY LEVEL (Nordic: ~30% GDP)`
      );
    }
  }

  // === AI SAFETY BUDGET VALIDATION ===
  // Support both fixed amount and GDP rate
  if (priorities.aiSafetyBudgetRate !== undefined) {
    const rate = priorities.aiSafetyBudgetRate;

    // Probability check (fail if outside [0, 1])
    assertProbability(rate, {
      location: 'validateScenarioOverrides',
      valueName: 'aiSafetyBudgetRate',
      month: state.currentMonth
    });

    // Physical impossibility: Max 10% of annual GDP (generous upper bound)
    const maxRate = 0.10;
    if (rate > maxRate) {
      const gdpInBillions = gdp * 1000;
      const monthlyValue = (gdpInBillions * rate) / 12;
      throw new Error(
        `❌ SCENARIO OVERRIDE PHYSICALLY IMPOSSIBLE: aiSafetyBudgetRate\n` +
        `   Rate: ${(rate * 100).toFixed(1)}% of annual GDP\n` +
        `   Maximum: ${(maxRate * 100).toFixed(1)}% of annual GDP\n` +
        `   Equivalent monthly spending: $${monthlyValue.toFixed(1)}B\n` +
        `   GDP: $${gdp.toFixed(1)}T/year\n` +
        `   Month: ${state.currentMonth}\n` +
        `\n` +
        `   This exceeds any plausible AI safety investment.\n` +
        `   For context:\n` +
        `   - Total AI industry revenue 2024: ~$200B/year (~0.2% global GDP)\n` +
        `   - Manhattan Project: ~0.4% GDP\n` +
        `\n` +
        `   Reduce scenario aiSafetyBudgetRate to ≤${(maxRate * 100).toFixed(1)}%.`
      );
    }

    // Unrealistic warning: >1% GDP/year
    const warnRate = 0.01;
    if (rate > warnRate) {
      warnings.push(
        `⚠️  AI safety budget: ${(rate * 100).toFixed(1)}% GDP/year - UNPRECEDENTED (no historical precedent)`
      );
    }
  } else if (priorities.aiSafetyBudget !== undefined) {
    const value = priorities.aiSafetyBudget;

    // Finite check (fail if NaN/Infinity)
    assertFinite(value, {
      location: 'validateScenarioOverrides',
      valueName: 'aiSafetyBudget',
      month: state.currentMonth
    });

    // Non-negative check (fail if negative)
    if (value < 0) {
      throw new Error(`❌ aiSafetyBudget must be non-negative: ${value}`);
    }

    // Physical impossibility: Max $100B/month
    if (value > SCENARIO_VALIDATION.aiSafetyBudget.maxAbsolute) {
      throw new Error(
        `❌ SCENARIO OVERRIDE PHYSICALLY IMPOSSIBLE: aiSafetyBudget\n` +
        `   Value: $${value.toFixed(1)}B/month\n` +
        `   Maximum: $${SCENARIO_VALIDATION.aiSafetyBudget.maxAbsolute}B/month\n` +
        `   Month: ${state.currentMonth}\n` +
        `\n` +
        `   This exceeds any plausible AI safety investment.\n` +
        `   For context:\n` +
        `   - Total AI industry revenue 2024: ~$200B/year\n` +
        `   - Manhattan Project (inflation-adjusted): ~$30B total\n` +
        `\n` +
        `   Reduce scenario aiSafetyBudget to ≤${SCENARIO_VALIDATION.aiSafetyBudget.maxAbsolute}B/month\n` +
        `   OR use aiSafetyBudgetRate for GDP-adaptive spending (RECOMMENDED).`
      );
    }

    // Unrealistic warning: >$10B/month
    if (value > SCENARIO_VALIDATION.aiSafetyBudget.warnThreshold) {
      warnings.push(
        `⚠️  AI safety budget: $${value.toFixed(1)}B/month - UNPRECEDENTED (no historical precedent)`
      );
    }
  }

  // === DEMOCRACY LEVEL VALIDATION ===
  if (priorities.democracyLevel !== undefined) {
    // Probability check (fail if outside [0, 1])
    assertProbability(priorities.democracyLevel, {
      location: 'validateScenarioOverrides',
      valueName: 'democracyLevel',
      month: state.currentMonth
    });
    // No additional bounds needed - [0, 1] is the physical constraint
  }

  // === GOVERNMENT TYPE VALIDATION ===
  if (priorities.governmentType !== undefined) {
    const validTypes = ['democratic', 'authoritarian', 'mixed', 'technocratic'] as const;
    if (!validTypes.includes(priorities.governmentType)) {
      throw new Error(`❌ Invalid governmentType: ${priorities.governmentType}`);
    }
  }

  return warnings;
}

export class ApplyScenarioPrioritiesPhase implements SimulationPhase {
  readonly id = 'apply-scenario-priorities';
  readonly name = 'Apply Scenario Priorities';
  readonly order = 1.5;
  // DEPENDENCIES (Nov 15, 2025): None - reads scenario from state (set during initialization)
  // REMOVED time-advancement dependency (wrong order: phase 1.5 can't depend on phase 99.0)
  readonly dependencies = [] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];

    // Check if scenario is active
    if (!state.scenarioConfig || !state.scenarioConfig.governmentPriorities) {
      // No scenario or no priorities - skip this phase
      return { events };
    }

    const priorities = state.scenarioConfig.governmentPriorities;

    // === VALIDATION (Nov 14, 2025) ===
    // Validate all overrides BEFORE applying any mutations
    // This prevents partial application if validation fails mid-way
    const warnings = validateScenarioOverrides(priorities, state);

    const overridesApplied: string[] = [];

    // === FIELD MAPPINGS (Phase 1.3 complete) ===
    // researchInvestment → government.researchInvestments.totalBudget
    // climateSpending → government.resources (monthly addition)
    // redistributionRate → ubiSystem.basicIncome.monthlyCost (activates UBI if needed)
    // aiSafetyBudget → government.alignmentResearchInvestment
    // democracyLevel → government.governanceQuality.* (all fields)
    // governmentType → government.governmentType

    // === RESEARCH INVESTMENT ===
    // Support both fixed ($B/month) and GDP-proportional (% of annual GDP) spending
    // GDP-proportional prevents crashes during economic collapse
    if (priorities.researchInvestmentRate !== undefined || priorities.researchInvestment !== undefined) {
      const gdp = assertFinite(getGDPProxy(state), {
        location: 'ApplyScenarioPrioritiesPhase',
        valueName: 'gdp',
        month: state.currentMonth
      });
      const gdpInBillions = gdp * 1000; // Convert trillions to billions

      let value: number;
      let isAdaptive = false;

      // Prefer rate-based (adaptive) over fixed amount
      if (priorities.researchInvestmentRate !== undefined) {
        // NOTE: Validation already performed by validateScenarioOverrides()
        const rate = priorities.researchInvestmentRate;
        value = (gdpInBillions * rate) / 12; // Annual GDP × rate → monthly spending
        isAdaptive = true;
      } else {
        // NOTE: Validation already performed by validateScenarioOverrides()
        value = priorities.researchInvestment!;
      }

      // Map to government research budget (billions/month)
      // This field is used by government agent to allocate research across domains
      const oldBudget = state.government.researchInvestments.totalBudget;
      state.government.researchInvestments.totalBudget = value;
      state.government.researchInvestments.budgetLimit = value; // Also update limit to allow spending

      if (isAdaptive) {
        overridesApplied.push(
          `Research: $${oldBudget.toFixed(1)}B → $${value.toFixed(1)}B/month (${(priorities.researchInvestmentRate! * 100).toFixed(2)}% GDP, adaptive)`
        );
      } else {
        overridesApplied.push(`Research: $${oldBudget.toFixed(1)}B → $${value.toFixed(1)}B/month (fixed)`);
      }
    }

    if (priorities.climateSpending !== undefined) {
      // NOTE: Validation already performed by validateScenarioOverrides()
      const value = priorities.climateSpending;

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

      // === RESOURCE ACCUMULATION CAP (Nov 14, 2025) ===
      // Prevent infinite resource accumulation (resources represent spendable pools, not GDP)
      // Cap at 1 year of climate spending accumulation (prevents unrealistic stockpiling)
      const maxResources = monthlyClimateSpending * SCENARIO_VALIDATION.resourcesMaxAccumulation;
      const newResources = state.government.resources + monthlyClimateSpending;

      if (newResources > maxResources) {
        // Cap reached - log warning and cap value
        if (state.currentMonth % 12 === 0) {
          // Log annually to avoid spam
          console.log(
            `\n⚠️  RESOURCE ACCUMULATION CAP REACHED (Month ${state.currentMonth})\n` +
            `   Current: $${state.government.resources.toFixed(1)}B\n` +
            `   Monthly spending: $${monthlyClimateSpending.toFixed(1)}B\n` +
            `   Cap: $${maxResources.toFixed(1)}B (${SCENARIO_VALIDATION.resourcesMaxAccumulation} months accumulation)\n` +
            `   Capping resources to prevent infinite accumulation.`
          );
        }
        state.government.resources = maxResources;
      } else {
        state.government.resources = newResources;
      }

      // FIX (Nov 11, 2025): ALSO update state.config.climatePriority.weights
      // This is what selectGovernmentAction actually reads when choosing actions
      // Map climate spending to priority weight:
      // - 0.01-0.02 (1-2% GDP) → 0.10-0.20 weight (baseline/moderate)
      // - 0.05-0.07 (5-7% GDP) → 0.30-0.35 weight (ambitious)
      // - 0.10+ (10%+ GDP) → 0.45 weight (crisis mode)
      let climateWeight: number;
      if (value >= 0.10) {
        climateWeight = 0.45; // Crisis mode (opt-crisis level)
      } else if (value >= 0.07) {
        climateWeight = 0.35; // Ambitious (opt-ambitious/pes-maximum)
      } else if (value >= 0.05) {
        climateWeight = 0.30; // Moderate-ambitious
      } else if (value >= 0.02) {
        climateWeight = 0.20; // Moderate (opt-moderate)
      } else {
        climateWeight = 0.10 + (value / 0.02) * 0.10; // Scale from baseline (0.10) to moderate (0.20)
      }

      // Rebalance other weights proportionally (keep total ~1.0)
      // Guard: only update weights if climatePriority is configured
      if (state.config.climatePriority) {
        const oldClimateWeight = state.config.climatePriority.weights.climate;
        const otherWeightsTotal = 1.0 - oldClimateWeight;
        const otherWeightsNew = 1.0 - climateWeight;
        const rebalanceFactor = otherWeightsNew / otherWeightsTotal;

        state.config.climatePriority.weights.climate = climateWeight;
        state.config.climatePriority.weights.economic *= rebalanceFactor;
        state.config.climatePriority.weights.geopolitical *= rebalanceFactor;
        state.config.climatePriority.weights.social *= rebalanceFactor;
        state.config.climatePriority.weights.technological *= rebalanceFactor;

        overridesApplied.push(
          `Climate: ${(value * 100).toFixed(1)}% GDP (+$${monthlyClimateSpending.toFixed(1)}B to resources, weight ${(oldClimateWeight * 100).toFixed(0)}% → ${(climateWeight * 100).toFixed(0)}%)`
        );
      } else {
        // climatePriority not configured - just log resource change
        overridesApplied.push(
          `Climate: ${(value * 100).toFixed(1)}% GDP (+$${monthlyClimateSpending.toFixed(1)}B to resources)`
        );
      }
    }

    if (priorities.redistributionRate !== undefined) {
      // NOTE: Validation already performed by validateScenarioOverrides()
      const value = priorities.redistributionRate;

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

    // === AI SAFETY BUDGET ===
    // Support both fixed ($B/month) and GDP-proportional (% of annual GDP) spending
    // GDP-proportional prevents crashes during economic collapse
    if (priorities.aiSafetyBudgetRate !== undefined || priorities.aiSafetyBudget !== undefined) {
      const gdp = assertFinite(getGDPProxy(state), {
        location: 'ApplyScenarioPrioritiesPhase',
        valueName: 'gdp',
        month: state.currentMonth
      });
      const gdpInBillions = gdp * 1000; // Convert trillions to billions

      let value: number;
      let isAdaptive = false;

      // Prefer rate-based (adaptive) over fixed amount
      if (priorities.aiSafetyBudgetRate !== undefined) {
        // NOTE: Validation already performed by validateScenarioOverrides()
        const rate = priorities.aiSafetyBudgetRate;
        value = (gdpInBillions * rate) / 12; // Annual GDP × rate → monthly spending
        isAdaptive = true;
      } else {
        // NOTE: Validation already performed by validateScenarioOverrides()
        value = priorities.aiSafetyBudget!;
      }

      // Map to government alignment research investment
      // This field is [0,10] investment level, not absolute dollars
      // Convert billions/month to investment level: $1B = level 1
      const oldLevel = state.government.alignmentResearchInvestment;
      state.government.alignmentResearchInvestment = value; // Direct mapping (billions ≈ investment level)

      if (isAdaptive) {
        overridesApplied.push(
          `AI Safety: level ${oldLevel.toFixed(1)} → ${value.toFixed(1)} ($${value.toFixed(1)}B/month equiv, ${(priorities.aiSafetyBudgetRate! * 100).toFixed(2)}% GDP, adaptive)`
        );
      } else {
        overridesApplied.push(`AI Safety: level ${oldLevel.toFixed(1)} → ${value.toFixed(1)} ($${value.toFixed(1)}B/month equiv, fixed)`);
      }
    }

    if (priorities.democracyLevel !== undefined) {
      // NOTE: Validation already performed by validateScenarioOverrides()
      const value = priorities.democracyLevel;

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

      // FIX (Nov 10, 2025): Removed readonly property assignments
      // state.government.democracy and democracyQuality are computed getters (initialization.ts:682-690)
      // They automatically calculate from governanceQuality fields, so we don't need to set them

      overridesApplied.push(
        `Democracy: ${(oldParticipation * 100).toFixed(0)}% → ${(value * 100).toFixed(0)}% (participation, transparency, consensus)`
      );
    }

    if (priorities.governmentType !== undefined) {
      // NOTE: Validation already performed by validateScenarioOverrides()

      // Map scenario governmentType to GameState governmentType
      // 'mixed' in scenario → 'technocratic' in GameState (closest match)
      let mappedType: 'democratic' | 'authoritarian' | 'technocratic';
      if (priorities.governmentType === 'mixed' || priorities.governmentType === 'technocratic') {
        mappedType = 'technocratic';
      } else if (priorities.governmentType === 'democratic') {
        mappedType = 'democratic';
      } else {
        mappedType = 'authoritarian';
      }

      // Apply government type override (this field DOES exist)
      const oldType = state.government.governmentType;
      state.government.governmentType = mappedType;
      overridesApplied.push(`Gov: ${oldType} → ${mappedType}`);
    }

    // Log overrides (only if any were applied)
    if (overridesApplied.length > 0 && state.currentMonth % 6 === 0) {
      console.log(`\n🎯 SCENARIO PRIORITIES (Month ${state.currentMonth})`);
      console.log(`   Scenario: ${state.scenarioConfig.name}`);
      console.log(`   Overrides applied:`);
      for (const override of overridesApplied) {
        console.log(`     - ${override}`);
      }

      // Log validation warnings (if any)
      if (warnings.length > 0) {
        console.log(`\n   Validation warnings:`);
        for (const warning of warnings) {
          console.log(`     ${warning}`);
        }
      }
    }

    // Create event for first override application
    if (overridesApplied.length > 0 && state.currentMonth === 0) {
      events.push({
        id: `scenario_start_${state.scenarioConfig.name.replace(/\s+/g, '_').toLowerCase()}`,
        timestamp: state.currentMonth,
        type: 'policy',
        severity: 'info',
        agent: 'Scenario System',
        title: `🎬 Scenario Started: ${state.scenarioConfig.name}`,
        description: `${state.scenarioConfig.description}\n\nPriority overrides: ${overridesApplied.join(', ')}`,
        effects: {}
      });
    }

    return { events };
  }
}
