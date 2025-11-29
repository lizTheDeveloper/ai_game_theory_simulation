/**
 * Scenario Analysis Framework - Pre-defined Scenarios
 *
 * Collection of governance and technology deployment scenarios
 * for systematic testing of simulation outcomes.
 */

import type { ScenarioDefinition } from './types';

/**
 * GOVERNMENT PRIORITY SCENARIOS
 * Test how different governance priorities affect outcomes
 */

export const CLIMATE_FIRST: ScenarioDefinition = {
  name: 'Climate First',
  description: 'Government prioritizes climate action above all else (80% climate spending)',
  governmentPriorities: {
    climateSpending: 0.8,
    redistributionLevel: 0.3, // Standard
    alignmentResearch: 0.2,
    democraticParticipation: 0.3,
    scientificResearch: 0.4,
  },
  expectedOutcome: 'Strong environmental outcomes, potential social cohesion trade-offs',
  researchBasis: ['IPCC AR6 (2023)', 'Stern Review (2006)'],
};

export const EQUALITY_FIRST: ScenarioDefinition = {
  name: 'Equality First',
  description: 'Government prioritizes reducing inequality (target Gini 0.25)',
  governmentPriorities: {
    climateSpending: 0.4,
    redistributionLevel: 0.8, // Aggressive redistribution
    alignmentResearch: 0.3,
    democraticParticipation: 0.5,
    scientificResearch: 0.4,
  },
  expectedOutcome: 'High social cohesion, potential economic growth trade-offs',
  researchBasis: ['Wilkinson & Pickett (2009)', 'Piketty (2014)'],
};

export const AI_ALIGNMENT_FIRST: ScenarioDefinition = {
  name: 'AI Alignment First',
  description: 'Government prioritizes AI safety and alignment research (80% AI research)',
  governmentPriorities: {
    climateSpending: 0.3,
    redistributionLevel: 0.3,
    alignmentResearch: 0.8, // Maximum alignment focus
    democraticParticipation: 0.4,
    scientificResearch: 0.5,
  },
  expectedOutcome: 'Lower AI risk, but potential environmental/social neglect',
  researchBasis: ['Bostrom (2014)', 'Amodei et al. (2016)'],
};

export const DEMOCRATIC_PARTICIPATION: ScenarioDefinition = {
  name: 'Democratic Participation',
  description: 'Government invests heavily in liquid democracy and participation (70% democracy spending)',
  governmentPriorities: {
    climateSpending: 0.4,
    redistributionLevel: 0.4,
    alignmentResearch: 0.3,
    democraticParticipation: 0.7, // High participation investment
    scientificResearch: 0.4,
  },
  expectedOutcome: 'Strong governance quality, potential decision-making slowdown',
  researchBasis: ['Acemoglu & Robinson (2001)', 'Ostrom (2009)'],
};

export const SCIENTIFIC_ACCELERATION: ScenarioDefinition = {
  name: 'Scientific Acceleration',
  description: 'Government maximizes scientific research investment (80% research spending)',
  governmentPriorities: {
    climateSpending: 0.4,
    redistributionLevel: 0.3,
    alignmentResearch: 0.4,
    democraticParticipation: 0.3,
    scientificResearch: 0.8, // Maximum research investment
  },
  expectedOutcome: 'Rapid breakthrough rate, potential short-term crisis neglect',
  researchBasis: ['Romer (1990)', 'Aghion & Howitt (2009)'],
};

export const AUTHORITARIAN_EFFICIENCY: ScenarioDefinition = {
  name: 'Authoritarian Efficiency',
  description: 'Centralized decision-making, no democratic participation (efficiency hypothesis)',
  governmentPriorities: {
    climateSpending: 0.6,
    redistributionLevel: 0.2, // Low redistribution
    alignmentResearch: 0.5,
    democraticParticipation: 0.0, // No democracy investment
    scientificResearch: 0.6,
  },
  startingConditions: {
    governanceQuality: 0.8, // Start with high capacity
    institutionalTrust: 0.4, // But low trust
    collectiveActionWillingness: 0.3, // Low cooperation
  },
  expectedOutcome: 'Fast decision-making, but fragile (low trust/cooperation)',
  researchBasis: ['Acemoglu & Robinson (2001) - extractive institutions'],
};

/**
 * STARTING CONDITION SCENARIOS
 * Test how initial societal conditions affect outcomes
 */

export const HIGH_TRUST_START: ScenarioDefinition = {
  name: 'High Trust Start',
  description: 'Society begins with high institutional trust and social cohesion',
  startingConditions: {
    trustInAI: 0.7,
    institutionalTrust: 0.8,
    socialCohesion: 0.8,
    collectiveActionWillingness: 0.7,
    gini: 0.30, // Low inequality
  },
  expectedOutcome: 'Cooperative spirals more likely, better policy effectiveness',
  researchBasis: ['Putnam (2000)', 'Fukuyama (1995)'],
};

export const LOW_INEQUALITY_START: ScenarioDefinition = {
  name: 'Low Inequality Start',
  description: 'Society begins with Scandinavian-level equality (Gini 0.25)',
  startingConditions: {
    gini: 0.25, // Very low inequality
    socialCohesion: 0.7,
    collectiveActionWillingness: 0.6,
  },
  expectedOutcome: 'Stronger social cohesion, easier cooperation',
  researchBasis: ['Wilkinson & Pickett (2009)', 'OECD (2015)'],
};

export const STRONG_INSTITUTIONS_START: ScenarioDefinition = {
  name: 'Strong Institutions Start',
  description: 'Society begins with high-capacity governance institutions',
  startingConditions: {
    governanceQuality: 0.8,
    institutionalTrust: 0.7,
  },
  expectedOutcome: 'Better crisis response, policy effectiveness',
  researchBasis: ['Acemoglu & Robinson (2001)', 'North (1990)'],
};

/**
 * TECHNOLOGY DEPLOYMENT SCENARIOS
 * Test how technology deployment patterns affect outcomes
 */

export const RENEWABLE_ENERGY_FIRST: ScenarioDefinition = {
  name: 'Renewable Energy First',
  description: 'Deploy only renewable energy technologies (solar, wind, batteries)',
  techDeployment: {
    strategy: 'immediate',
    techList: [
      'solar_pv_breakthrough',
      'wind_power_scaling',
      'battery_storage_breakthrough',
      'geothermal_advanced',
      'tidal_wave_power',
    ],
    deploymentLevel: 1.0,
  },
  expectedOutcome: 'Climate improvement via clean energy, but incomplete coverage',
  researchBasis: ['OECD (2025)', 'NREL (2024)'],
};

export const CARBON_REMOVAL_FIRST: ScenarioDefinition = {
  name: 'Carbon Removal First',
  description: 'Deploy only carbon removal and sequestration technologies',
  techDeployment: {
    strategy: 'immediate',
    techList: [
      'gigatonne_dac',
      'ocean_alkalinity',
      'afforestation_ai',
      'soil_carbon_sequestration',
      'biochar_production',
    ],
    deploymentLevel: 1.0,
  },
  expectedOutcome: 'Direct climate reversal, but energy system unchanged',
  researchBasis: ['IPCC AR6 (2023)', 'National Academies (2019)'],
};

export const FOUNDATIONS_FIRST: ScenarioDefinition = {
  name: 'Foundations First',
  description: 'Deploy Tier 0 foundations before higher tiers (dependency-ordered)',
  techDeployment: {
    strategy: 'sequenced',
    priority: 'dependency-ordered',
    deploymentInterval: 6, // Deploy one every 6 months
  },
  expectedOutcome: 'Gradual, stable improvement following tech dependencies',
  researchBasis: ['Rogers (2003) - Diffusion of Innovations'],
};

export const ADAPTIVE_DEPLOYMENT: ScenarioDefinition = {
  name: 'Adaptive Deployment',
  description: 'Simulation chooses technologies adaptively based on current state',
  techDeployment: {
    strategy: 'adaptive', // NOT immediate - let simulation decide
  },
  expectedOutcome: 'Optimal deployment order, but slower than god mode',
  researchBasis: ['Ostrom (2009) - Adaptive governance'],
};

/**
 * COMBO SCENARIOS
 * Combine governance + starting conditions + tech deployment
 */

export const IDEAL_CONDITIONS: ScenarioDefinition = {
  name: 'Ideal Conditions',
  description: 'High trust + equality + strong institutions + balanced priorities + god mode tech',
  governmentPriorities: {
    climateSpending: 0.6,
    redistributionLevel: 0.6,
    alignmentResearch: 0.6,
    democraticParticipation: 0.6,
    scientificResearch: 0.6,
  },
  startingConditions: {
    trustInAI: 0.7,
    institutionalTrust: 0.8,
    gini: 0.25,
    governanceQuality: 0.8,
    socialCohesion: 0.8,
    collectiveActionWillingness: 0.7,
  },
  techDeployment: {
    strategy: 'immediate',
    deploymentLevel: 1.0,
  },
  expectedOutcome: 'Best-case scenario - utopia conditions maximized',
  researchBasis: ['Composite from multiple sources'],
};

export const WORST_CASE: ScenarioDefinition = {
  name: 'Worst Case',
  description: 'Low trust + high inequality + weak institutions + no tech',
  startingConditions: {
    trustInAI: 0.2,
    institutionalTrust: 0.3,
    gini: 0.55, // Very high inequality
    governanceQuality: 0.3,
    socialCohesion: 0.3,
    collectiveActionWillingness: 0.2,
  },
  techDeployment: {
    strategy: 'none', // No tech deployment
  },
  expectedOutcome: 'Worst-case scenario - cascading failures likely',
  researchBasis: ['Acemoglu & Robinson (2001) - extractive institutions'],
};

/**
 * PHASE 3: REALISTIC POLICY PACKAGES
 * Test real-world policy combinations that reflect contemporary debates
 */

export const GREEN_NEW_DEAL: ScenarioDefinition = {
  name: 'Green New Deal',
  description: 'Progressive climate policy with jobs guarantee + UBI + high redistribution (US/EU model)',
  governmentPriorities: {
    climateSpending: 0.8, // Aggressive climate action
    redistributionLevel: 0.7, // High redistribution for equity
    alignmentResearch: 0.3,
    democraticParticipation: 0.6, // Participatory and transparent
    scientificResearch: 0.6, // Clean energy R&D focus
  },
  startingConditions: {
    gini: 0.30, // Target aggressive redistribution (from US baseline ~0.41)
  },
  techDeployment: {
    strategy: 'sequenced',
    priority: 'energy', // Renewable energy prioritized
    deploymentInterval: 6,
    techList: [
      'solar_pv_breakthrough',
      'wind_power_scaling',
      'battery_storage_breakthrough',
      'geothermal_advanced',
      'gigatonne_dac', // Carbon removal after energy
    ],
  },
  expectedOutcome: 'Strong environmental outcomes + high social cohesion, but potential economic transition costs',
  researchBasis: [
    'US Green New Deal Resolution H.Res.109 (2019)',
    'EU Green Deal (2020-2024)',
    'Pollin et al. (2020) - Economic Analysis of Green New Deal',
  ],
};

export const TECHNO_OPTIMIST: ScenarioDefinition = {
  name: 'Techno-Optimist Path',
  description: 'Accelerationist approach: maximize innovation, minimal regulation, market-driven solutions',
  governmentPriorities: {
    climateSpending: 0.05, // M-3 FIX: 5% GDP/month (moderate tech investment, not crisis-level)
    redistributionLevel: 0.02, // M-3 FIX: 2% GDP/month (minimal redistribution, market-driven)
    alignmentResearch: 0.05, // M-3 FIX: 5% GDP/month (moderate safety, not zero)
    democraticParticipation: 0.03, // M-3 FIX: 3% GDP/month (low regulation, fast deployment)
    scientificResearch: 0.09, // M-3 FIX: 9% GDP/month (maximum innovation velocity)
  },
  startingConditions: {
    gini: 0.40, // Accept higher inequality for growth
  },
  techDeployment: {
    strategy: 'immediate', // MEDIUM-3 FIX (Nov 29, 2025): Unlock all techs to enable bifurcation
    deploymentLevel: 1.0, // Deploy everything immediately (god mode)
  },
  expectedOutcome: 'Rapid breakthrough rate + faster crisis response, but potential inequality/social cohesion costs',
  researchBasis: [
    'Andreessen (2023) - Techno-Optimist Manifesto',
    'Cowen (2011) - The Great Stagnation',
    'Effective Accelerationism (e/acc) movement (2023-2024)',
  ],
};

export const DEGROWTH: ScenarioDefinition = {
  name: 'Degrowth Path',
  description: 'Ecological economics: consumption reduction, restoration priority, strong redistribution',
  governmentPriorities: {
    climateSpending: 0.9, // Ecological restoration top priority
    redistributionLevel: 0.8, // High redistribution for equity
    alignmentResearch: 0.3,
    democraticParticipation: 0.7, // Participatory governance
    scientificResearch: 0.5, // Sustainable tech only
  },
  startingConditions: {
    gini: 0.28, // Low inequality (egalitarian starting point)
    collectiveActionWillingness: 0.7, // Strong community engagement
  },
  techDeployment: {
    strategy: 'sequenced',
    priority: 'dependency-ordered',
    deploymentInterval: 12, // Slow, careful deployment
    techList: [
      'afforestation_ai', // Restoration prioritized
      'rewilding_corridors',
      'permaculture_scaling',
      'soil_carbon_sequestration',
      // Limit high-energy tech (no gigatonne DAC)
    ],
    deploymentLevel: 0.7, // Conservative deployment
  },
  expectedOutcome: 'Strong environmental restoration, high social cohesion, but slower tech deployment',
  researchBasis: [
    'Hickel (2020) - Less is More: How Degrowth Will Save the World',
    'Kallis et al. (2020) - Limits: Why Malthus Was Wrong',
    'Jackson (2021) - Post Growth: Life After Capitalism',
  ],
};

export const AUTHORITARIAN_CLIMATE_ACTION: ScenarioDefinition = {
  name: 'Authoritarian Climate Action',
  description: 'Centralized top-down climate policy with rapid deployment (China/Singapore model)',
  governmentPriorities: {
    climateSpending: 0.9, // Maximum climate action
    redistributionLevel: 0.5, // Moderate (for stability)
    alignmentResearch: 0.5,
    democraticParticipation: 0.1, // Minimal participation (top-down)
    scientificResearch: 0.7, // State-directed innovation
  },
  startingConditions: {
    governanceQuality: 0.8, // High capacity
    institutionalTrust: 0.4, // Low trust (coercion-based)
    collectiveActionWillingness: 0.3, // Low cooperation
  },
  techDeployment: {
    strategy: 'sequenced',
    priority: 'dependency-ordered',
    deploymentInterval: 3, // RAPID deployment (override consultation)
    deploymentLevel: 1.0,
  },
  expectedOutcome: 'Rapid environmental improvement, but fragile (low trust/cooperation) - crisis vulnerability',
  researchBasis: [
    'Beeson (2010) - The coming of environmental authoritarianism',
    'Gilley (2012) - Authoritarian environmentalism and China climate response',
    'Shearman & Smith (2007) - Climate Change Challenge and Failure of Democracy',
  ],
};

export const NORDIC_SOCIAL_DEMOCRACY: ScenarioDefinition = {
  name: 'Nordic Social Democracy',
  description: 'High redistribution + high participation + strong safety nets (Sweden/Denmark/Norway model)',
  governmentPriorities: {
    climateSpending: 0.7, // Strong climate action
    redistributionLevel: 0.8, // High redistribution
    alignmentResearch: 0.4,
    democraticParticipation: 0.8, // High participation + transparency
    scientificResearch: 0.6, // Innovation with social safety net
  },
  startingConditions: {
    gini: 0.25, // Very low inequality (Scandinavian baseline)
    institutionalTrust: 0.8, // High trust
    trustInAI: 0.8, // High tech adoption due to trust
    governanceQuality: 0.8, // Strong institutions
    socialCohesion: 0.8, // High cohesion
    collectiveActionWillingness: 0.7, // Strong cooperation
  },
  techDeployment: {
    strategy: 'sequenced',
    priority: 'dependency-ordered',
    deploymentInterval: 8, // Gradual, consensus-driven
    deploymentLevel: 0.9, // High but cautious
  },
  expectedOutcome: 'Balanced outcomes: strong environment + high social cohesion + gradual tech deployment',
  researchBasis: [
    'Andersen et al. (2007) - Nordic Model: Embracing globalization and sharing risks',
    'OECD (2024) - Nordic countries inequality data',
    'Esping-Andersen (1990) - Three Worlds of Welfare Capitalism',
  ],
};

/**
 * SCENARIO REGISTRY
 * All pre-defined scenarios in one object for easy access
 */
export const SCENARIOS = {
  // Government priorities (Phase 1)
  climateFirst: CLIMATE_FIRST,
  equalityFirst: EQUALITY_FIRST,
  aiAlignmentFirst: AI_ALIGNMENT_FIRST,
  democraticParticipation: DEMOCRATIC_PARTICIPATION,
  scientificAcceleration: SCIENTIFIC_ACCELERATION,
  authoritarianEfficiency: AUTHORITARIAN_EFFICIENCY,

  // Starting conditions (Phase 1)
  highTrustStart: HIGH_TRUST_START,
  lowInequalityStart: LOW_INEQUALITY_START,
  strongInstitutionsStart: STRONG_INSTITUTIONS_START,

  // Technology deployment (Phase 1)
  renewableEnergyFirst: RENEWABLE_ENERGY_FIRST,
  carbonRemovalFirst: CARBON_REMOVAL_FIRST,
  foundationsFirst: FOUNDATIONS_FIRST,
  adaptiveDeployment: ADAPTIVE_DEPLOYMENT,

  // Combos (Phase 1)
  idealConditions: IDEAL_CONDITIONS,
  worstCase: WORST_CASE,

  // Realistic Policy Packages (Phase 3)
  greenNewDeal: GREEN_NEW_DEAL,
  technoOptimist: TECHNO_OPTIMIST,
  degrowth: DEGROWTH,
  authoritarianClimateAction: AUTHORITARIAN_CLIMATE_ACTION,
  nordicSocialDemocracy: NORDIC_SOCIAL_DEMOCRACY,
};
