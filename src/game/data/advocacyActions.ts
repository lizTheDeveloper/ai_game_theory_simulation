/**
 * Advocacy Actions Data
 *
 * Defines available player actions for influencing the simulation.
 * All actions comply with Sylvia's influence bounds:
 * - Single action: <= 5% effect
 * - Per domain: <= 10% cumulative
 * - Total cumulative: <= 15%
 */

import type { AdvocacyAction, InfluenceDomain } from '../types';

/**
 * All available advocacy actions
 *
 * Organized by domain for easy reference.
 */
export const ADVOCACY_ACTIONS: AdvocacyAction[] = [
  // === AI Policy Domain ===
  {
    id: 'ai_safety_public_campaign',
    name: 'AI Safety Public Campaign',
    description: 'Launch a public awareness campaign about AI safety. Increases public support for safety-focused AI development.',
    mechanism: 'sentiment_shift',
    targetMetric: 'society.publicSentiment.aiSafety',
    baseEffect: 0.03,
    duration: 6,
    cooldown: 12,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'ai_policy',
  },
  {
    id: 'ai_governance_lobbying',
    name: 'AI Governance Lobbying',
    description: 'Lobby governments for stronger AI governance frameworks. Increases probability of regulatory adoption.',
    mechanism: 'policy_adoption',
    targetMetric: 'governmentSystem.aiPolicyStrength',
    baseEffect: 0.025,
    duration: 3,
    cooldown: 6,
    prerequisites: [
      {
        path: 'society.publicSentiment.aiSafety',
        operator: 'gte',
        value: 0.4,
        description: 'Public support for AI safety at least 40%',
      },
    ],
    maxCumulativeEffect: 0.05,
    domain: 'ai_policy',
  },
  {
    id: 'ai_research_transparency',
    name: 'AI Research Transparency Initiative',
    description: 'Promote open publication of AI safety research. Increases trust and research coordination.',
    mechanism: 'trust_delta',
    targetMetric: 'society.trustInAI',
    baseEffect: 0.02,
    duration: 12,
    cooldown: 18,
    prerequisites: [],
    maxCumulativeEffect: 0.04,
    domain: 'ai_policy',
  },

  // === Climate Action Domain ===
  {
    id: 'climate_divestment_campaign',
    name: 'Climate Divestment Campaign',
    description: 'Pressure institutional investors to divest from fossil fuels. Shifts capital toward clean energy.',
    mechanism: 'private_sector_weight',
    targetMetric: 'resourceEconomy.cleanEnergyInvestment',
    baseEffect: 0.035,
    duration: 12,
    cooldown: 24,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'climate_action',
  },
  {
    id: 'carbon_pricing_advocacy',
    name: 'Carbon Pricing Advocacy',
    description: 'Advocate for carbon pricing mechanisms. Increases probability of carbon tax adoption.',
    mechanism: 'policy_adoption',
    targetMetric: 'governmentSystem.carbonPolicy',
    baseEffect: 0.03,
    duration: 6,
    cooldown: 12,
    prerequisites: [
      {
        path: 'society.publicSentiment.climateAction',
        operator: 'gte',
        value: 0.5,
        description: 'Public support for climate action at least 50%',
      },
    ],
    maxCumulativeEffect: 0.05,
    domain: 'climate_action',
  },
  {
    id: 'climate_adaptation_funding',
    name: 'Climate Adaptation Funding',
    description: 'Direct funding toward climate adaptation projects. Increases resilience in vulnerable regions.',
    mechanism: 'funding_weight',
    targetMetric: 'resourceEconomy.adaptationFunding',
    baseEffect: 0.025,
    duration: 24,
    cooldown: 36,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'climate_action',
  },

  // === Social Cohesion Domain ===
  {
    id: 'trust_building_initiative',
    name: 'Trust Building Initiative',
    description: 'Launch programs to rebuild social trust. Reduces polarization and increases cooperation.',
    mechanism: 'trust_delta',
    targetMetric: 'society.trust',
    baseEffect: 0.02,
    duration: 18,
    cooldown: 24,
    prerequisites: [],
    maxCumulativeEffect: 0.04,
    domain: 'social_cohesion',
  },
  {
    id: 'media_literacy_campaign',
    name: 'Media Literacy Campaign',
    description: 'Promote media literacy to counter misinformation. Increases public resilience to manipulation.',
    mechanism: 'sentiment_shift',
    targetMetric: 'society.mediaLiteracy',
    baseEffect: 0.03,
    duration: 12,
    cooldown: 18,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'social_cohesion',
  },
  {
    id: 'community_resilience_program',
    name: 'Community Resilience Program',
    description: 'Fund community resilience programs. Increases local capacity to handle crises.',
    mechanism: 'coordination_boost',
    targetMetric: 'society.communityResilience',
    baseEffect: 0.025,
    duration: 24,
    cooldown: 36,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'social_cohesion',
  },

  // === International Cooperation Domain ===
  {
    id: 'international_ai_treaty',
    name: 'International AI Treaty Advocacy',
    description: 'Advocate for international AI governance treaties. Increases coordination probability.',
    mechanism: 'coordination_boost',
    targetMetric: 'governmentSystem.internationalCoordination',
    baseEffect: 0.03,
    duration: 12,
    cooldown: 24,
    prerequisites: [
      {
        path: 'governmentSystem.aiPolicyStrength',
        operator: 'gte',
        value: 0.3,
        description: 'National AI policy strength at least 30%',
      },
    ],
    maxCumulativeEffect: 0.05,
    domain: 'international_cooperation',
  },
  {
    id: 'climate_cooperation_summit',
    name: 'Climate Cooperation Summit',
    description: 'Organize international climate cooperation summits. Increases likelihood of coordinated action.',
    mechanism: 'coordination_boost',
    targetMetric: 'governmentSystem.climateCooperation',
    baseEffect: 0.035,
    duration: 6,
    cooldown: 18,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'international_cooperation',
  },
  {
    id: 'technology_sharing_agreement',
    name: 'Technology Sharing Agreement',
    description: 'Promote agreements for sharing beneficial technologies. Accelerates global tech adoption.',
    mechanism: 'coordination_boost',
    targetMetric: 'governmentSystem.techSharing',
    baseEffect: 0.025,
    duration: 18,
    cooldown: 24,
    prerequisites: [],
    maxCumulativeEffect: 0.04,
    domain: 'international_cooperation',
  },

  // === Research Direction Domain ===
  {
    id: 'safety_research_funding',
    name: 'AI Safety Research Funding',
    description: 'Direct funding toward AI safety research. Accelerates safety-focused research progress.',
    mechanism: 'funding_weight',
    targetMetric: 'researchSystem.safetyWeight',
    baseEffect: 0.04,
    duration: 24,
    cooldown: 36,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'research_direction',
  },
  {
    id: 'climate_tech_research',
    name: 'Climate Technology Research',
    description: 'Fund climate technology research. Accelerates development of carbon capture and clean energy.',
    mechanism: 'funding_weight',
    targetMetric: 'researchSystem.climateWeight',
    baseEffect: 0.035,
    duration: 24,
    cooldown: 36,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'research_direction',
  },
  {
    id: 'alignment_research_priority',
    name: 'Alignment Research Priority',
    description: 'Shift research priorities toward AI alignment. Increases probability of alignment breakthroughs.',
    mechanism: 'funding_weight',
    targetMetric: 'researchSystem.alignmentWeight',
    baseEffect: 0.03,
    duration: 18,
    cooldown: 24,
    prerequisites: [
      {
        path: 'society.publicSentiment.aiSafety',
        operator: 'gte',
        value: 0.5,
        description: 'Public support for AI safety at least 50%',
      },
    ],
    maxCumulativeEffect: 0.05,
    domain: 'research_direction',
  },
];

/**
 * Get actions by domain
 */
export function getActionsByDomain(domain: InfluenceDomain): AdvocacyAction[] {
  return ADVOCACY_ACTIONS.filter(action => action.domain === domain);
}

/**
 * Get action by ID
 */
export function getActionById(id: string): AdvocacyAction | undefined {
  return ADVOCACY_ACTIONS.find(action => action.id === id);
}

/**
 * Domain display names
 */
export const DOMAIN_LABELS: Record<InfluenceDomain, string> = {
  ai_policy: 'AI Policy',
  climate_action: 'Climate Action',
  social_cohesion: 'Social Cohesion',
  international_cooperation: 'International Cooperation',
  research_direction: 'Research Direction',
};

/**
 * Domain descriptions
 */
export const DOMAIN_DESCRIPTIONS: Record<InfluenceDomain, string> = {
  ai_policy: 'Shape AI governance and safety policies',
  climate_action: 'Drive climate mitigation and adaptation',
  social_cohesion: 'Build trust and community resilience',
  international_cooperation: 'Foster global coordination',
  research_direction: 'Influence research priorities',
};
