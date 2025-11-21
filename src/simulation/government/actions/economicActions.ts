/**
 * Economic government actions
 *
 * Actions related to economic policy including:
 * - Universal Basic Income (generous, means-tested, job guarantee)
 * - Subsidies for organizations
 * - Redistribution policies
 */

import { GameState, GameEvent } from '@/types/game';
import { ActionResult } from '@/simulation/agents/types';
import { CategorizedGovernmentAction } from '../core/types';
import { calculateUBIVariantEffects } from '@/simulation/calculations';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string, month: number): string => {
  eventIdCounter += 1;
  return `${prefix}_${month}_${eventIdCounter}`;
};

/**
 * Implement Generous Universal Basic Income
 * Fast adaptation, high cost, opens post-scarcity path
 */
const implementGenerousUBI: CategorizedGovernmentAction = {
  id: 'implement_generous_ubi',
  name: 'Implement Generous Universal Basic Income',
  description: 'Establish generous UBI to support all citizens (fast adaptation, high cost, opens post-scarcity path)',
  agentType: 'government',
  category: 'economic',
  energyCost: 3,

  canExecute: (state: GameState): boolean => {
    const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
    const canTakeMajorPolicy = monthsSinceLastMajorPolicy >= 10;

    return state.society.unemploymentLevel > 0.25 &&
           state.globalMetrics.economicTransitionStage >= 2.0 &&
           state.globalMetrics.economicTransitionStage < 3.5 &&
           state.government.structuralChoices.ubiVariant === 'none' &&
           canTakeMajorPolicy;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    // Track major policy usage
    state.government.lastMajorPolicyMonth = state.currentMonth;
    state.government.majorPoliciesThisYear += 1;

    // Set UBI variant
    state.government.structuralChoices.ubiVariant = 'generous';

    const effects = calculateUBIVariantEffects('generous', state.society.unemploymentLevel, state.globalMetrics.economicTransitionStage);

    // Major economic transition advancement
    state.globalMetrics.economicTransitionStage = Math.max(3.0,
      state.globalMetrics.economicTransitionStage + effects.economicStageBonus);

    // Significant improvements
    state.globalMetrics.wealthDistribution = Math.min(1.0,
      state.globalMetrics.wealthDistribution + effects.wealthDistributionBonus);

    // UBI enables faster social adaptation
    state.society.socialAdaptation = Math.min(0.9,
      state.society.socialAdaptation + effects.adaptationRate);

    // Reduces unemployment stress
    const trustImprovement = Math.min(0.3, state.society.unemploymentLevel * 0.4);
    state.society.trustInAI += trustImprovement;

    // Legitimacy boost
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + effects.legitimacyBonus);

    // High fiscal cost
    state.globalMetrics.socialStability -= effects.fiscalCost * 0.5; // Partially offset by social benefits

    state.government.activeRegulations.push('Generous Universal Basic Income');

    return {
      success: true,
      effects: {
        economic_stage: effects.economicStageBonus,
        wealth_distribution: effects.wealthDistributionBonus,
        social_adaptation: effects.adaptationRate,
        legitimacy_boost: effects.legitimacyBonus,
        fiscal_cost: effects.fiscalCost
      },
      events: [{
        id: generateUniqueId('ubi_generous', state.currentMonth),
        timestamp: state.currentMonth,
        type: 'policy',
        severity: 'constructive',
        agent: 'Government',
        title: 'Generous UBI Implemented',
        description: 'Government establishes generous universal basic income. Fast social adaptation expected, post-scarcity path opening. High fiscal burden.',
        effects: { ubi_program: 1 }
      }],
      message: `Generous UBI implemented - Economic stage advanced to ${state.globalMetrics.economicTransitionStage.toFixed(1)}`
    };
  }
};

/**
 * Implement Means-Tested Benefits
 * Medium cost, slower adaptation
 */
const implementMeansTestedBenefits: CategorizedGovernmentAction = {
  id: 'implement_means_tested_benefits',
  name: 'Implement Means-Tested Benefits',
  description: 'Establish targeted benefits for displaced workers (medium cost, slower adaptation)',
  agentType: 'government',
  category: 'economic',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
    const canTakeMajorPolicy = monthsSinceLastMajorPolicy >= 10;

    return state.society.unemploymentLevel > 0.2 &&
           state.globalMetrics.economicTransitionStage < 3.5 &&
           state.government.structuralChoices.ubiVariant === 'none' &&
           canTakeMajorPolicy;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    // Track major policy usage
    state.government.lastMajorPolicyMonth = state.currentMonth;
    state.government.majorPoliciesThisYear += 1;

    // Set UBI variant
    state.government.structuralChoices.ubiVariant = 'means_tested';

    const effects = calculateUBIVariantEffects('means_tested', state.society.unemploymentLevel, state.globalMetrics.economicTransitionStage);

    // Moderate economic transition advancement
    state.globalMetrics.economicTransitionStage = Math.min(3.5,
      state.globalMetrics.economicTransitionStage + effects.economicStageBonus);

    // Moderate improvements
    state.globalMetrics.wealthDistribution = Math.min(1.0,
      state.globalMetrics.wealthDistribution + effects.wealthDistributionBonus);

    // Slower social adaptation
    state.society.socialAdaptation = Math.min(0.9,
      state.society.socialAdaptation + effects.adaptationRate);

    // Modest legitimacy impact
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + effects.legitimacyBonus);

    // Medium fiscal cost
    state.globalMetrics.socialStability -= effects.fiscalCost * 0.7;

    state.government.activeRegulations.push('Means-Tested Benefits Program');

    return {
      success: true,
      effects: {
        economic_stage: effects.economicStageBonus,
        wealth_distribution: effects.wealthDistributionBonus,
        social_adaptation: effects.adaptationRate,
        fiscal_cost: effects.fiscalCost
      },
      events: [{
        id: generateUniqueId('benefits_means_tested', state.currentMonth),
        timestamp: state.currentMonth,
        type: 'policy',
        severity: 'info',
        agent: 'Government',
        title: 'Means-Tested Benefits Enacted',
        description: 'Government implements targeted benefits for displaced workers. Partial solution with mixed public reception. Slower adaptation expected.',
        effects: { benefits_program: 1 }
      }],
      message: `Means-tested benefits implemented - Gradual transition to stage ${state.globalMetrics.economicTransitionStage.toFixed(1)}`
    };
  }
};

/**
 * Implement Job Guarantee Program
 * Maintains work paradigm, very slow adaptation
 */
const implementJobGuarantee: CategorizedGovernmentAction = {
  id: 'implement_job_guarantee',
  name: 'Implement Job Guarantee Program',
  description: 'Guarantee government jobs for all (maintains work paradigm, very slow adaptation)',
  agentType: 'government',
  category: 'economic',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
    const canTakeMajorPolicy = monthsSinceLastMajorPolicy >= 10;

    return state.society.unemploymentLevel > 0.3 &&
           state.globalMetrics.economicTransitionStage < 3.0 &&
           state.government.structuralChoices.ubiVariant === 'none' &&
           canTakeMajorPolicy;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    // Track major policy usage
    state.government.lastMajorPolicyMonth = state.currentMonth;
    state.government.majorPoliciesThisYear += 1;

    // Set UBI variant
    state.government.structuralChoices.ubiVariant = 'job_guarantee';

    const effects = calculateUBIVariantEffects('job_guarantee', state.society.unemploymentLevel, state.globalMetrics.economicTransitionStage);

    // Slow economic transition (gets stuck)
    state.globalMetrics.economicTransitionStage = Math.min(2.8,
      state.globalMetrics.economicTransitionStage + effects.economicStageBonus);

    // Limited improvements
    state.globalMetrics.wealthDistribution = Math.min(1.0,
      state.globalMetrics.wealthDistribution + effects.wealthDistributionBonus);

    // Very slow social adaptation (maintains old paradigm)
    state.society.socialAdaptation = Math.min(0.9,
      state.society.socialAdaptation + effects.adaptationRate);

    // Legitimacy boost (satisfies work ethic values)
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + effects.legitimacyBonus);

    // Medium fiscal cost
    state.globalMetrics.socialStability -= effects.fiscalCost * 0.6;

    state.government.activeRegulations.push('Job Guarantee Program');

    return {
      success: true,
      effects: {
        economic_stage: effects.economicStageBonus,
        wealth_distribution: effects.wealthDistributionBonus,
        social_adaptation: effects.adaptationRate,
        legitimacy_boost: effects.legitimacyBonus,
        fiscal_cost: effects.fiscalCost
      },
      events: [{
        id: generateUniqueId('job_guarantee', state.currentMonth),
        timestamp: state.currentMonth,
        type: 'policy',
        severity: 'info',
        agent: 'Government',
        title: 'Job Guarantee Program Enacted',
        description: 'Government guarantees jobs for all displaced workers. Maintains work paradigm but delays post-scarcity transition. Very slow adaptation expected.',
        effects: { job_program: 1 }
      }],
      message: `Job guarantee program implemented - Stuck at stage ${state.globalMetrics.economicTransitionStage.toFixed(1)}`
    };
  }
};

/**
 * Subsidize Safety Research Organization
 * Give capital to organization with high safety focus
 */
const subsidizeOrganization: CategorizedGovernmentAction = {
  id: 'subsidize_organization',
  name: 'Subsidize Safety Research',
  description: 'Give capital to organization with high safety focus ($20M boost, encourages safety)',
  agentType: 'government',
  category: 'economic',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    // Can subsidize if there are private orgs with safety focus
    const safetyOrgs = state.organizations.filter((o: any) =>
      o.type === 'private' &&
      o.priorities.safetyResearch > 0.4 &&
      o.capital < 100 // Only subsidize if struggling
    );

    if (state.government.resources === undefined) {
      throw new Error('❌ state.government.resources is undefined in subsidizeSafetyOrgs canExecute - initialization bug');
    }

    return safetyOrgs.length > 0 && state.government.resources > 2;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    // Find org with highest safety focus that's struggling
    const safetyOrgs = state.organizations.filter((o: any) =>
      o.type === 'private' &&
      o.priorities.safetyResearch > 0.4 &&
      o.capital < 100
    );

    if (safetyOrgs.length === 0) {
      return {
        success: false,
        effects: {},
        events: [],
        message: 'No eligible organizations to subsidize'
      };
    }

    // Pick org with highest safety focus
    const targetOrg = safetyOrgs.sort((a: any, b: any) =>
      b.priorities.safetyResearch - a.priorities.safetyResearch
    )[0];

    // Give capital boost
    targetOrg.capital += 20;

    // Encourage more safety focus
    targetOrg.priorities.safetyResearch = Math.min(1.0, targetOrg.priorities.safetyResearch + 0.1);

    // Improve relations
    targetOrg.governmentRelations = Math.min(1.0, targetOrg.governmentRelations + 0.1);

    // Cost resources
    if (state.government.resources !== undefined) {
      state.government.resources -= 2;
    }

    return {
      success: true,
      effects: { subsidy: 20 },
      events: [{
        id: generateUniqueId('org_subsidy', state.currentMonth),
        timestamp: state.currentMonth,
        type: 'policy',
        severity: 'info',
        agent: 'Government',
        title: 'Safety Research Subsidized',
        description: `Government gave $20M to ${targetOrg.name} to encourage AI safety research. Improves safety focus.`,
        effects: { safetyFocus: 0.1 }
      }],
      message: `Subsidized ${targetOrg.name} with $20M`
    };
  }
};

/**
 * Adjust Redistribution Policy
 * Set ongoing redistribution level as % of GDP (repeatable action for scenario testing)
 *
 * Research foundation:
 * - Nordic model: ~30-35% GDP redistribution → Gini ~0.25-0.27 (OECD 2024)
 * - US baseline: ~15% GDP redistribution → Gini ~0.40 (OECD 2024)
 * - Each 10% GDP increase → ~0.04-0.05 Gini reduction (Atkinson 2015)
 * - Wilkinson & Pickett (2009): Gini >0.45 = unstable societies
 */
const adjustRedistributionPolicy: CategorizedGovernmentAction = {
  id: 'adjust_redistribution_policy',
  name: 'Adjust Redistribution Policy',
  description: 'Set ongoing redistribution as % of GDP via progressive taxation and transfers (minimal 5%, moderate 15%, aggressive 25%, transformative 35%). Repeatable action for adjusting equality.',
  agentType: 'government',
  category: 'economic',
  energyCost: 2,

  canExecute: (state: GameState): boolean => {
    // Require industrial capacity for redistribution infrastructure
    return state.globalMetrics.economicTransitionStage >= 2.0;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    // Calculate GDP for redistribution amount
    const population = state.humanPopulationSystem?.population || 8.0;
    const qol = state.globalMetrics.qualityOfLife || 1.0;
    const stage = state.globalMetrics.economicTransitionStage || 1.0;
    const gdp = population * qol * (1 + stage * 0.2) * 10; // GDP in $T

    // Determine redistribution level based on scenario priorities or default
    const scenarioPriorities = state.scenarioConfig?.governmentPriorities;
    let redistributionPercent = 0.15; // Default: moderate (15% GDP)

    if (scenarioPriorities?.redistributionLevel !== undefined) {
      // Map scenario priority [0,1] to redistribution levels
      const priority = scenarioPriorities.redistributionLevel;
      if (priority >= 0.8) {
        redistributionPercent = 0.35; // Transformative: 35% GDP (Nordic+)
      } else if (priority >= 0.6) {
        redistributionPercent = 0.25; // Aggressive: 25% GDP
      } else if (priority >= 0.4) {
        redistributionPercent = 0.15; // Moderate: 15% GDP (US baseline)
      } else {
        redistributionPercent = 0.05; // Minimal: 5% GDP
      }
    }

    // Calculate Gini reduction (research: each 10% GDP → 0.04-0.05 Gini reduction)
    const baselineGini = 0.40; // US baseline without redistribution
    const giniReduction = redistributionPercent * 0.4; // 35% GDP → 0.14 Gini reduction
    const targetGini = Math.max(0.20, baselineGini - giniReduction); // Floor at 0.20 (theoretical minimum)

    // Get current Gini
    const currentGini = state.qualityOfLifeSystems.distribution?.globalGini || 0.40;

    // Gradual adjustment (don't jump instantly)
    const adjustment = (targetGini - currentGini) * 0.3; // 30% of gap per action
    const newGini = currentGini + adjustment;

    // Update state
    if (state.qualityOfLifeSystems.distribution) {
      state.qualityOfLifeSystems.distribution.globalGini = newGini;
    }
    if (state.qualityOfLifeSystems.regionalInequality) {
      state.qualityOfLifeSystems.regionalInequality.giniCoefficient = newGini;
    }

    // Improve wealth distribution metric
    state.globalMetrics.wealthDistribution = Math.min(
      1.0,
      state.globalMetrics.wealthDistribution + Math.abs(adjustment) * 0.5
    );

    // Legitimacy impact (progressive policies can be controversial)
    if (redistributionPercent > 0.25) {
      state.government.legitimacy = Math.max(0, state.government.legitimacy - 0.03); // Controversial
    } else {
      state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.01); // Popular
    }

    return {
      success: true,
      effects: {
        giniCoefficient: newGini,
        redistributionPercent: redistributionPercent * 100,
        gdpRedistributed: gdp * redistributionPercent
      },
      events: [{
        id: `redistribution_${state.currentMonth}_${Math.floor(random() * 1000000)}`,
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'info',
        agent: 'Government',
        title: 'Redistribution Policy Adjusted',
        description: `Government set redistribution to ${(redistributionPercent * 100).toFixed(1)}% of GDP. Gini coefficient: ${currentGini.toFixed(3)} → ${newGini.toFixed(3)} (target: ${targetGini.toFixed(3)})`,
        effects: { giniChange: adjustment }
      }],
      message: `💰 Redistribution set to ${(redistributionPercent * 100).toFixed(1)}% GDP, Gini: ${newGini.toFixed(3)}`
    };
  }
};

/**
 * All economic actions
 */
export const economicActions: CategorizedGovernmentAction[] = [
  implementGenerousUBI,
  implementMeansTestedBenefits,
  implementJobGuarantee,
  subsidizeOrganization,
  adjustRedistributionPolicy
];
