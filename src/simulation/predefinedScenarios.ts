/**
 * Predefined Scenario Definitions (Phase 2, Nov 10, 2025)
 *
 * **PURPOSE:**
 * Systematic testing of governance interventions to identify conditions
 * that enable upward spirals.
 *
 * **RESEARCH CONTEXT:**
 * Phase 1 diagnostics (god mode) showed:
 * - 77% collective action potential BUT spirals failed
 * - Research budget stuck at $10B (need $50B+)
 * - Workflow adaptation 0% (need 25%)
 * - Biodiversity collapsed to 1% (irreversible)
 * - Decision quality 62% (need 70%)
 *
 * Technology alone insufficient. Need governance + tech combinations.
 *
 * **SCENARIO CATEGORIES:**
 * 1. Government Priorities (6 scenarios) - Test different spending allocations
 * 2. Starting Conditions (3 scenarios) - Test different initial states
 * 3. Tech Deployment (4 scenarios) - Test deployment strategies
 *
 * @see logs/phase_1_spiral_diagnostics_implementation_summary.txt
 * @see src/types/scenario.ts
 * @see src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts
 */

import { ScenarioDefinition } from '@/types/scenario';

// ============================================================================
// GOVERNMENT PRIORITY SCENARIOS
// ============================================================================

/**
 * SCENARIO 1: Climate First
 *
 * Test: Does climate-first spending enable ecological spiral?
 * Hypothesis: 5% GDP climate spending + immediate renewable deployment → ecological spiral by month 24
 */
export const CLIMATE_FIRST: ScenarioDefinition = {
  id: 'climate-first',
  name: 'Climate First',
  description:
    'Government prioritizes climate tech spending (5% GDP) with immediate renewable energy deployment. Tests if aggressive climate investment enables ecological spiral despite biodiversity collapse.',
  governmentPriorities: {
    climateSpending: 0.05, // 5% GDP (10x default)
    researchInvestment: 20, // $20B/month (2x default, focused on climate tech)
  },
  technologyDeployment: {
    strategy: 'sequenced',
    priorityTechs: [
      'renewable-energy',
      'carbon-removal',
      'sustainable-agriculture',
      'ocean-restoration',
      'biodiversity-protection',
    ],
    deploymentMonth: 0,
  },
  hypothesis:
    'If climate spending = 5% GDP and renewable energy deployed immediately, ecological spiral should activate by month 24 (assumes biodiversity recovery possible)',
  targetSpirals: ['ecological', 'scientific'],
};

/**
 * SCENARIO 2: Equality First
 *
 * Test: Does UBI + redistribution enable abundance spiral?
 * Hypothesis: 3% GDP UBI + low inequality → abundance spiral by month 12
 */
export const EQUALITY_FIRST: ScenarioDefinition = {
  id: 'equality-first',
  name: 'Equality First',
  description:
    'Government implements universal basic income (3% GDP) targeting Gini <0.30. Tests if economic redistribution enables abundance spiral.',
  governmentPriorities: {
    redistributionRate: 0.03, // 3% GDP UBI (adequate coverage)
  },
  startingConditions: {
    giniCoefficient: 0.25, // Nordic-level equality
    socialCohesion: 0.8, // High cohesion baseline
  },
  technologyDeployment: {
    strategy: 'immediate', // God mode tech deployment
    deploymentMonth: 0,
  },
  hypothesis:
    'If UBI = 3% GDP and Gini <0.30, abundance spiral should activate by month 12 (unemployment >60%, economic stage 3)',
  targetSpirals: ['abundance', 'meaning'],
};

/**
 * SCENARIO 3: AI Alignment First
 *
 * Test: Does alignment research prioritization enable trust cascade?
 * Hypothesis: $10B/month alignment + strict controls → cooperative spirals by month 18
 */
export const ALIGNMENT_FIRST: ScenarioDefinition = {
  id: 'alignment-first',
  name: 'AI Alignment First',
  description:
    'Government prioritizes AI alignment research ($10B/month) with strict controls. Tests if alignment success enables cooperative spirals and trust cascade.',
  governmentPriorities: {
    aiSafetyBudget: 10, // $10B/month (10x default)
    researchInvestment: 30, // $30B/month total (alignment-focused)
  },
  startingConditions: {
    trustInAI: 0.7, // High initial trust
    institutionalCapacity: 0.8, // Strong institutions
  },
  technologyDeployment: {
    strategy: 'adaptive', // Deploy based on safety assessment
  },
  hypothesis:
    'If alignment budget = $10B/month and institutions strong, cooperative spirals (trust cascade, alignment milestones) should activate by month 18',
  targetSpirals: ['democratic', 'scientific'],
};

/**
 * SCENARIO 4: Democratic Participation
 *
 * Test: Does high democracy quality enable democratic spiral?
 * Hypothesis: Democracy level 0.8 + transparency → democratic spiral by month 12
 */
export const DEMOCRATIC_PARTICIPATION: ScenarioDefinition = {
  id: 'democratic-participation',
  name: 'Democratic Participation',
  description:
    'Government maximizes democratic quality (participation, transparency, decision quality). Tests if strong democracy enables democratic spiral.',
  governmentPriorities: {
    democracyLevel: 0.8, // High quality democracy (all governance metrics)
    researchInvestment: 25, // $25B/month (enables better informed decisions)
  },
  startingConditions: {
    institutionalCapacity: 0.8, // Strong institutions baseline
    socialCohesion: 0.75, // Good cohesion
  },
  technologyDeployment: {
    strategy: 'adaptive', // Democratic deliberation on tech deployment
  },
  hypothesis:
    'If democracy level = 0.8 (decision quality, participation, transparency), democratic spiral should activate by month 12',
  targetSpirals: ['democratic', 'cognitive', 'meaning'],
};

/**
 * SCENARIO 5: Scientific Acceleration
 *
 * Test: Does massive research investment enable scientific spiral?
 * Hypothesis: $100B/month research + workflow adaptation → scientific spiral by month 6
 */
export const SCIENTIFIC_ACCELERATION: ScenarioDefinition = {
  id: 'scientific-acceleration',
  name: 'Scientific Acceleration',
  description:
    'Government invests massively in research ($100B/month, 10x default) across all domains. Tests if research budget alone enables scientific spiral.',
  governmentPriorities: {
    researchInvestment: 100, // $100B/month (10x god mode)
    climateSpending: 0.02, // 2% GDP climate (balanced)
    redistributionRate: 0.02, // 2% GDP UBI (enable focus on research)
  },
  technologyDeployment: {
    strategy: 'immediate', // All tech available for deployment
    deploymentMonth: 0,
  },
  hypothesis:
    'If research budget = $100B/month (2x threshold), scientific spiral should activate by month 6 (assumes workflow adaptation follows)',
  targetSpirals: ['scientific', 'cognitive', 'cascade'],
};

/**
 * SCENARIO 6: Authoritarian Efficiency
 *
 * Test: Can authoritarian government enable spirals via rapid deployment?
 * Hypothesis: Low democracy + rapid deployment → spirals but at what cost?
 */
export const AUTHORITARIAN_EFFICIENCY: ScenarioDefinition = {
  id: 'authoritarian-efficiency',
  name: 'Authoritarian Efficiency',
  description:
    'Authoritarian government rapidly deploys all technologies with minimal democratic deliberation. Tests tradeoff between efficiency and spiral activation.',
  governmentPriorities: {
    governmentType: 'authoritarian',
    democracyLevel: 0.3, // Low democracy
    researchInvestment: 50, // $50B/month (high efficiency)
    climateSpending: 0.03, // 3% GDP climate
    redistributionRate: 0.01, // 1% GDP UBI (minimal)
  },
  technologyDeployment: {
    strategy: 'immediate', // Rapid deployment, no deliberation
    deploymentMonth: 0,
  },
  hypothesis:
    'Authoritarian rapid deployment may enable some spirals (scientific, ecological) but fail democratic/meaning spirals. Trade efficiency for quality.',
  targetSpirals: ['scientific', 'ecological'], // NOT democratic/meaning
};

// ============================================================================
// STARTING CONDITION SCENARIOS
// ============================================================================

/**
 * SCENARIO 7: High Trust Start
 *
 * Test: Does high initial trust + strong institutions enable faster spiral activation?
 * Hypothesis: Trust 0.8 + institutions 0.7 → spirals activate 6 months earlier
 */
export const HIGH_TRUST_START: ScenarioDefinition = {
  id: 'high-trust-start',
  name: 'High Trust Start',
  description:
    'Simulation starts with high trust in AI (0.8) and strong institutions (0.7). Tests if initial conditions accelerate spiral activation.',
  startingConditions: {
    trustInAI: 0.8, // High trust
    institutionalCapacity: 0.7, // Strong institutions
    socialCohesion: 0.75, // Good cohesion
  },
  governmentPriorities: {
    researchInvestment: 50, // $50B/month (threshold)
    climateSpending: 0.03, // 3% GDP
    redistributionRate: 0.025, // 2.5% GDP UBI
  },
  technologyDeployment: {
    strategy: 'immediate',
    deploymentMonth: 0,
  },
  hypothesis:
    'If trust = 0.8 and institutions = 0.7 at start, spirals should activate 6 months earlier than baseline (month 6 vs month 12)',
  targetSpirals: ['scientific', 'democratic', 'cognitive', 'abundance'],
};

/**
 * SCENARIO 8: Low Inequality Start
 *
 * Test: Does Nordic-level equality baseline enable meaning + abundance spirals?
 * Hypothesis: Gini 0.25 + cohesion 0.8 → meaning spiral by month 9
 */
export const LOW_INEQUALITY_START: ScenarioDefinition = {
  id: 'low-inequality-start',
  name: 'Low Inequality Start',
  description:
    'Simulation starts with Nordic-level inequality (Gini 0.25) and high social cohesion (0.8). Tests if equality enables meaning spiral.',
  startingConditions: {
    giniCoefficient: 0.25, // Nordic countries (Sweden, Norway)
    socialCohesion: 0.8, // High cohesion from equality
    institutionalCapacity: 0.75, // Strong Nordic institutions
  },
  governmentPriorities: {
    researchInvestment: 50, // $50B/month
    redistributionRate: 0.03, // 3% GDP UBI (maintain equality)
  },
  technologyDeployment: {
    strategy: 'immediate',
    deploymentMonth: 0,
  },
  hypothesis:
    'If Gini = 0.25 and cohesion = 0.8 at start, meaning spiral should activate by month 9 (meaning crisis low, cultural adaptation faster)',
  targetSpirals: ['meaning', 'abundance', 'democratic'],
};

/**
 * SCENARIO 9: Strong Institutions Start
 *
 * Test: Do strong institutions enable faster crisis response and spiral activation?
 * Hypothesis: Governance 0.8 + decision quality 0.8 → democratic spiral by month 6
 */
export const STRONG_INSTITUTIONS_START: ScenarioDefinition = {
  id: 'strong-institutions-start',
  name: 'Strong Institutions Start',
  description:
    'Simulation starts with exceptionally strong institutions (governance 0.8, decision quality 0.8). Tests if institutional capacity enables democratic spiral.',
  startingConditions: {
    institutionalCapacity: 0.8, // Very strong institutions
  },
  governmentPriorities: {
    democracyLevel: 0.8, // High democracy (decision quality, participation, transparency)
    researchInvestment: 50, // $50B/month
    climateSpending: 0.03, // 3% GDP
  },
  technologyDeployment: {
    strategy: 'adaptive', // Strong institutions → deliberative tech deployment
  },
  hypothesis:
    'If institutional capacity = 0.8 and democracy = 0.8, democratic spiral should activate by month 6 (effective decision-making)',
  targetSpirals: ['democratic', 'scientific', 'cognitive'],
};

// ============================================================================
// TECH DEPLOYMENT SCENARIOS
// ============================================================================

/**
 * SCENARIO 10: Renewable Energy First
 *
 * Test: Does prioritizing renewable energy enable positive tipping points?
 * Hypothesis: Immediate renewable deployment → S-curve cascade by month 3
 */
export const RENEWABLE_ENERGY_FIRST: ScenarioDefinition = {
  id: 'renewable-energy-first',
  name: 'Renewable Energy First',
  description:
    'Deploy renewable energy technologies (solar, wind, battery storage) at month 0. Tests if energy transition triggers positive tipping points.',
  governmentPriorities: {
    climateSpending: 0.04, // 4% GDP climate (support transition)
    researchInvestment: 30, // $30B/month (energy R&D)
  },
  technologyDeployment: {
    strategy: 'sequenced',
    priorityTechs: ['renewable-energy', 'grid-storage', 'smart-grid'],
    deploymentMonth: 0,
  },
  hypothesis:
    'If renewable energy deployed at month 0, positive tipping points (S-curve cascades) should trigger by month 3 (market share >5%)',
  targetSpirals: ['ecological', 'scientific'],
};

/**
 * SCENARIO 11: Carbon Removal First
 *
 * Test: Does prioritizing carbon removal enable climate stabilization?
 * Hypothesis: DAC + BECCS at month 0 → temperature decline by month 12
 */
export const CARBON_REMOVAL_FIRST: ScenarioDefinition = {
  id: 'carbon-removal-first',
  name: 'Carbon Removal First',
  description:
    'Deploy direct air capture (DAC) and bioenergy with carbon capture (BECCS) at month 0. Tests if carbon removal enables climate recovery.',
  governmentPriorities: {
    climateSpending: 0.06, // 6% GDP (expensive carbon removal)
    researchInvestment: 40, // $40B/month (carbon tech R&D)
  },
  technologyDeployment: {
    strategy: 'sequenced',
    priorityTechs: [
      'carbon-removal',
      'dac-gigatonne',
      'beccs',
      'ocean-restoration',
    ],
    deploymentMonth: 0,
  },
  hypothesis:
    'If carbon removal deployed at month 0 with 6% GDP spending, temperature should decline by month 12 (net negative emissions)',
  targetSpirals: ['ecological'],
};

/**
 * SCENARIO 12: Foundations First
 *
 * Test: Does dependency-ordered deployment prevent negative interactions?
 * Hypothesis: Foundation techs first → fewer crises, spirals activate month 18
 */
export const FOUNDATIONS_FIRST: ScenarioDefinition = {
  id: 'foundations-first',
  name: 'Foundations First',
  description:
    'Deploy technologies in dependency order (TIER 0 → TIER 1 → TIER 2 → TIER 3 → TIER 4). Tests if ordered deployment prevents negative interactions.',
  governmentPriorities: {
    researchInvestment: 50, // $50B/month (balanced)
    climateSpending: 0.03, // 3% GDP
    redistributionRate: 0.025, // 2.5% GDP UBI
  },
  technologyDeployment: {
    strategy: 'sequenced',
    // TIER 0: Crisis response (month 0)
    // TIER 1: Foundations (month 6)
    // TIER 2: Transformative (month 12)
    // TIER 3: Advanced (month 24)
    // TIER 4: Clarketech (month 36)
    priorityTechs: [
      // Will be expanded with full tech dependency tree
      'renewable-energy',
      'sustainable-agriculture',
      'ai-alignment-breakthrough',
    ],
  },
  hypothesis:
    'If techs deployed in dependency order (TIER 0→4 over 36 months), spirals should activate by month 18 with fewer crises',
  targetSpirals: ['scientific', 'democratic', 'cognitive'],
};

/**
 * SCENARIO 13: Adaptive Deployment
 *
 * Test: Does effectiveness-based deployment optimize spiral activation?
 * Hypothesis: Deploy highest effectiveness techs first → cascade by month 12
 */
export const ADAPTIVE_DEPLOYMENT: ScenarioDefinition = {
  id: 'adaptive-deployment',
  name: 'Adaptive Deployment',
  description:
    'Deploy technologies based on effectiveness metrics (which techs have highest impact given current state). Tests if adaptive strategy optimizes spiral activation.',
  governmentPriorities: {
    researchInvestment: 50, // $50B/month
    climateSpending: 0.03, // 3% GDP
    redistributionRate: 0.025, // 2.5% GDP UBI
    democracyLevel: 0.75, // High quality deliberation
  },
  technologyDeployment: {
    strategy: 'adaptive', // Effectiveness-based
  },
  hypothesis:
    'If techs deployed adaptively (highest effectiveness first), cascade spiral should activate by month 12 (4+ spirals simultaneously)',
  targetSpirals: ['cascade'], // Requires 4+ spirals
};

// ============================================================================
// SCENARIO REGISTRY
// ============================================================================

/**
 * All predefined scenarios indexed by ID
 */
export const PREDEFINED_SCENARIOS: Record<string, ScenarioDefinition> = {
  // Government Priorities
  [CLIMATE_FIRST.id]: CLIMATE_FIRST,
  [EQUALITY_FIRST.id]: EQUALITY_FIRST,
  [ALIGNMENT_FIRST.id]: ALIGNMENT_FIRST,
  [DEMOCRATIC_PARTICIPATION.id]: DEMOCRATIC_PARTICIPATION,
  [SCIENTIFIC_ACCELERATION.id]: SCIENTIFIC_ACCELERATION,
  [AUTHORITARIAN_EFFICIENCY.id]: AUTHORITARIAN_EFFICIENCY,

  // Starting Conditions
  [HIGH_TRUST_START.id]: HIGH_TRUST_START,
  [LOW_INEQUALITY_START.id]: LOW_INEQUALITY_START,
  [STRONG_INSTITUTIONS_START.id]: STRONG_INSTITUTIONS_START,

  // Tech Deployment
  [RENEWABLE_ENERGY_FIRST.id]: RENEWABLE_ENERGY_FIRST,
  [CARBON_REMOVAL_FIRST.id]: CARBON_REMOVAL_FIRST,
  [FOUNDATIONS_FIRST.id]: FOUNDATIONS_FIRST,
  [ADAPTIVE_DEPLOYMENT.id]: ADAPTIVE_DEPLOYMENT,
};

/**
 * Get scenario by ID
 */
export function getScenario(id: string): ScenarioDefinition | undefined {
  return PREDEFINED_SCENARIOS[id];
}

/**
 * List all available scenario IDs
 */
export function listScenarios(): string[] {
  return Object.keys(PREDEFINED_SCENARIOS);
}

/**
 * Get scenarios by category
 */
export function getScenariosByCategory(
  category: 'government' | 'starting-conditions' | 'tech-deployment'
): ScenarioDefinition[] {
  const scenarios = Object.values(PREDEFINED_SCENARIOS);
  switch (category) {
    case 'government':
      return scenarios.filter(
        s =>
          s.governmentPriorities &&
          Object.keys(s.governmentPriorities).length > 0
      );
    case 'starting-conditions':
      return scenarios.filter(
        s =>
          s.startingConditions && Object.keys(s.startingConditions).length > 0
      );
    case 'tech-deployment':
      return scenarios.filter(
        s => s.technologyDeployment?.strategy !== undefined
      );
    default:
      return [];
  }
}
