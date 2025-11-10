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
 * SCENARIO REGISTRY
 * All pre-defined scenarios in one object for easy access
 */
export const SCENARIOS = {
  // Government priorities
  climateFirst: CLIMATE_FIRST,
  equalityFirst: EQUALITY_FIRST,
  aiAlignmentFirst: AI_ALIGNMENT_FIRST,
  democraticParticipation: DEMOCRATIC_PARTICIPATION,
  scientificAcceleration: SCIENTIFIC_ACCELERATION,
  authoritarianEfficiency: AUTHORITARIAN_EFFICIENCY,

  // Starting conditions
  highTrustStart: HIGH_TRUST_START,
  lowInequalityStart: LOW_INEQUALITY_START,
  strongInstitutionsStart: STRONG_INSTITUTIONS_START,

  // Technology deployment
  renewableEnergyFirst: RENEWABLE_ENERGY_FIRST,
  carbonRemovalFirst: CARBON_REMOVAL_FIRST,
  foundationsFirst: FOUNDATIONS_FIRST,
  adaptiveDeployment: ADAPTIVE_DEPLOYMENT,

  // Combos
  idealConditions: IDEAL_CONDITIONS,
  worstCase: WORST_CASE,
};
