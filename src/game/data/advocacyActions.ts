/**
 * Advocacy Actions Data
 *
 * Predefined advocacy actions available to players.
 * All actions respect Sylvia-enforced influence bounds:
 * - Single action: <= 5% effect
 * - Per domain: <= 10% cumulative
 * - Total cumulative: <= 15%
 *
 * Note: This is a stub file created to unblock the build.
 * Full action definitions should be added based on game design.
 */

import type { AdvocacyAction } from '../types/advocacy';

/**
 * Initial advocacy actions available to players
 *
 * Each action has bounded effects to maintain research validity.
 */
export const ADVOCACY_ACTIONS: AdvocacyAction[] = [
  {
    id: 'public_awareness_campaign',
    name: 'Public Awareness Campaign',
    description: 'Launch a media campaign to increase public awareness of AI safety issues.',
    mechanism: 'sentiment_shift',
    targetMetric: 'society.publicSentiment.aiSafety',
    baseEffect: 0.02,
    duration: 3,
    cooldown: 6,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'ai_policy',
    costs: { reputation: 10, politicalCapital: 5 },
    researchSources: ['Public opinion research on AI perception'],
  },
  {
    id: 'research_funding_advocacy',
    name: 'Research Funding Advocacy',
    description: 'Advocate for increased funding toward AI alignment research.',
    mechanism: 'funding_weight',
    targetMetric: 'resourceEconomy.researchInvestment.aiAlignment',
    baseEffect: 0.03,
    duration: 6,
    cooldown: 12,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'research_direction',
    costs: { politicalCapital: 15, funding: 0.5 },
    researchSources: ['Research funding allocation studies'],
  },
  {
    id: 'climate_coalition_building',
    name: 'Climate Coalition Building',
    description: 'Build coalitions to accelerate climate action policies.',
    mechanism: 'coordination_boost',
    targetMetric: 'governmentSystem.climateCommitment',
    baseEffect: 0.02,
    duration: 4,
    cooldown: 8,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'climate_action',
    costs: { reputation: 5, politicalCapital: 10 },
    researchSources: ['Climate coalition effectiveness research'],
  },
  {
    id: 'international_coordination_initiative',
    name: 'International Coordination Initiative',
    description: 'Facilitate international cooperation on AI governance.',
    mechanism: 'coordination_boost',
    targetMetric: 'governmentSystem.internationalCoordination',
    baseEffect: 0.02,
    duration: 6,
    cooldown: 12,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'international_cooperation',
    costs: { reputation: 15, politicalCapital: 20, funding: 1.0 },
    researchSources: ['International AI governance frameworks'],
  },
  {
    id: 'community_resilience_program',
    name: 'Community Resilience Program',
    description: 'Support grassroots efforts to strengthen social cohesion.',
    mechanism: 'trust_delta',
    targetMetric: 'society.trust',
    baseEffect: 0.02,
    duration: 4,
    cooldown: 6,
    prerequisites: [],
    maxCumulativeEffect: 0.05,
    domain: 'social_cohesion',
    costs: { reputation: 5, funding: 0.2 },
    researchSources: ['Community resilience and social capital research'],
  },
];

/**
 * Get advocacy action by ID
 */
export function getAdvocacyAction(id: string): AdvocacyAction | undefined {
  return ADVOCACY_ACTIONS.find((action) => action.id === id);
}

/**
 * Get all advocacy actions for a specific domain
 */
export function getActionsByDomain(domain: AdvocacyAction['domain']): AdvocacyAction[] {
  return ADVOCACY_ACTIONS.filter((action) => action.domain === domain);
}
