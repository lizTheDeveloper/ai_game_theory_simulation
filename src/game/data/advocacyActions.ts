/**
 * Advocacy Action Catalog
 *
 * Research-backed player influence actions.
 * All parameters validated by research-skeptic (Sylvia).
 *
 * Sources: research/game_advocacy_actions_20251206.md
 * Validation: reviews/game_advocacy_actions_critique_20251206.md
 *
 * SYLVIA'S CONDITIONAL PASS CORRECTIONS APPLIED:
 * - Action 5: baseEffect reduced from 2.5% to 2%
 * - Action 11: fossil fuel lobbying modifier increased from -30% to -40%
 * - Action 12: heartwisesupport.org citation replaced (non-peer-reviewed)
 *
 * Bounds (enforced by InfluenceCalculator):
 * - Single action: ≤5% (baseEffect 0.015-0.04)
 * - Per domain: ≤10% cumulative
 * - Total: ≤15% cumulative
 */

import type { AdvocacyAction, AdvocacyActionId, GameStateSnapshot, InfluenceDomain } from '../types';
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

/**
 * All 12 advocacy actions with research backing
 */
export const ADVOCACY_ACTIONS: Record<AdvocacyActionId, AdvocacyAction> = {
  advocate_ai_safety: {
    id: 'advocate_ai_safety',
    name: 'AI Safety Public Awareness Campaign',
    description: 'Launch public campaign to increase AI safety awareness and policy support through social media, educational materials, and media outreach.',
    mechanism: 'sentiment_shift',
    targetMetric: 'society.publicSentiment.aiSafetySupport',
    baseEffect: 0.025, // 2.5% (Smith et al. 2024, meta-analysis n=12)
    duration: 6, // months
    cooldown: 3, // months
    prerequisites: [],
    maxCumulativeEffect: 0.08, // 8% domain limit (ai_policy ≤10%)
    domain: 'ai_policy',
    costs: {
      reputation: 10,
      politicalCapital: 15,
    },
    researchSources: [
      'Smith et al. (2024). Social Media Campaign Effectiveness. JMIR 27(1).',
      'UK Gov (2025). Digital Channel Shift Campaign Evaluation.',
    ],
  },

  mobilize_climate_action: {
    id: 'mobilize_climate_action',
    name: 'Climate Action Mobilization Campaign',
    description: 'Mobilize public support for climate action through grassroots organizing, educational initiatives, and media campaigns.',
    mechanism: 'sentiment_shift',
    targetMetric: 'society.publicSentiment.climateActionSupport',
    baseEffect: 0.02, // 2.0% (UN survey n=73,000, Nature Sustainability 2024)
    duration: 9, // months
    cooldown: 4, // months
    prerequisites: [],
    maxCumulativeEffect: 0.075, // 7.5% (climate_action ≤10%)
    domain: 'climate_action',
    costs: {
      reputation: 8,
      politicalCapital: 12,
    },
    researchSources: [
      'UN Development Programme (2024). Peoples Climate Vote 2024.',
      'Nature Sustainability (Oct 2024). Radical climate protests linked to increases in public support.',
      'PLOS Climate (2023). Key predictors for climate policy support.',
    ],
  },

  fund_community_programs: {
    id: 'fund_community_programs',
    name: 'Social Cohesion Community Programs',
    description: 'Fund community programs that strengthen social bonds, reduce polarization, and build trust through local initiatives and inclusive services.',
    mechanism: 'trust_delta',
    targetMetric: 'society.socialCohesion',
    baseEffect: 0.015, // 1.5% (conservative, UBI/UBS research, limited evidence)
    duration: 12, // months
    cooldown: 6, // months
    prerequisites: [],
    maxCumulativeEffect: 0.06, // 6% (social_cohesion ≤10%)
    domain: 'social_cohesion',
    costs: {
      reputation: 5,
      politicalCapital: 10,
      funding: 20,
    },
    researchSources: [
      'Okantey (2024). Are Universal and Guaranteed Basic Income Programs Effective? JAP.',
      'Orazani et al. (2023). What works and why in interventions to strengthen social cohesion. Wiley.',
      'World Bank (2024). Social Cohesion and Resilience.',
    ],
  },

  build_us_china_dialogue: {
    id: 'build_us_china_dialogue',
    name: 'Build US-China AI Dialogue',
    description: 'Establish sustained bilateral dialogue between US and China on AI governance, safety standards, and risk mitigation.',
    mechanism: 'coordination_boost',
    targetMetric: 'geopolitics.usChina.cooperationProbability',
    baseEffect: 0.03, // 3.0% (2024 Geneva dialogue + Biden-Xi agreement)
    duration: 18, // months
    cooldown: 12, // months
    prerequisites: [],
    maxCumulativeEffect: 0.09, // 9% (international_cooperation ≤10%)
    domain: 'international_cooperation',
    costs: {
      reputation: 15,
      politicalCapital: 25,
    },
    researchSources: [
      'China US Focus (2024). China and the United States Begin Official AI Dialogue.',
      'ACM FAccT (2025). Promising Topics for US-China Dialogues on AI Risks.',
      'TechPolicy.Press (2024). From Competition to Cooperation: US-China AI Governance.',
    ],
  },

  establish_climate_coalition: {
    id: 'establish_climate_coalition',
    name: 'Establish Climate Finance Coalition',
    description: 'Build multilateral coalition committing increased climate finance for mitigation/adaptation, modeled on Montreal Protocol success.',
    mechanism: 'coordination_boost',
    targetMetric: 'climate.financingCommitment',
    baseEffect: 0.02, // 2.0% (SYLVIA CORRECTION: reduced from 2.5% - Montreal analogy imperfect)
    duration: 15, // months
    cooldown: 9, // months
    prerequisites: [],
    maxCumulativeEffect: 0.09, // 9% (international_cooperation ≤10%)
    domain: 'international_cooperation',
    costs: {
      reputation: 12,
      politicalCapital: 20,
    },
    researchSources: [
      'PMC (2024). Learning from the Montreal Protocol to improve global governance.',
      'npj Climate Action (2024). Supporting the Paris Agreement through international cooperation.',
      'Earth Day (2024). What can we learn from the Montreal Protocol?',
    ],
  },

  create_research_infrastructure: {
    id: 'create_research_infrastructure',
    name: 'Create Shared Research Infrastructure',
    description: 'Build international collaborative research infrastructure (e.g., AI safety testbeds, climate observation networks) modeled on CERN/ALMA.',
    mechanism: 'coordination_boost',
    targetMetric: 'research.internationalCollaborationRate',
    baseEffect: 0.03, // 3.0% (CERN, ALMA case studies)
    duration: 24, // months (long infrastructure build time)
    cooldown: 18, // months
    prerequisites: [
      {
        path: 'technologies.researchFacilities',
        operator: 'gte',
        value: 1,
        description: 'Advanced Research Facilities (TIER 1) unlocked',
      },
    ],
    maxCumulativeEffect: 0.085, // 8.5% (research_direction ≤10%)
    domain: 'research_direction',
    costs: {
      reputation: 10,
      politicalCapital: 15,
      funding: 50,
    },
    researchSources: [
      'Science and Public Policy (2024). Science diplomacy in EU and LAC research infrastructure collaboration.',
      'US White House (2024). Biennial Report on International S&T Cooperation.',
      'EC (2024). International Cooperation in Research Infrastructure dimension.',
    ],
  },

  redirect_alignment_funding: {
    id: 'redirect_alignment_funding',
    name: 'Redirect to AI Alignment Research Funding',
    description: 'Advocate for increased government research funding allocation to AI alignment and safety research (vs. capabilities research).',
    mechanism: 'funding_weight',
    targetMetric: 'research.aiAlignment.funding',
    baseEffect: 0.03, // 3.0% (NSF/NIH budget reallocation patterns)
    duration: 12, // months (fiscal year cycle)
    cooldown: 12, // months (annual budget cycle)
    prerequisites: [],
    maxCumulativeEffect: 0.085, // 8.5% (research_direction ≤10%)
    domain: 'research_direction',
    costs: {
      reputation: 12,
      politicalCapital: 18,
    },
    researchSources: [
      'Science/AAAS (2024). Congressional spending panels cruel to NIH, kinder to NSF.',
      'NSF (2024). FY 2024 Agency Financial Report.',
      'AAU (2024). Federal Research Cuts Threaten US Innovation.',
    ],
  },

  fund_climate_tech_rd: {
    id: 'fund_climate_tech_rd',
    name: 'Fund Climate Tech R&D',
    description: 'Advocate for increased government and private funding for climate technology R&D (carbon capture, renewables, adaptation).',
    mechanism: 'funding_weight',
    targetMetric: 'research.climateTech.funding',
    baseEffect: 0.025, // 2.5% (budget advocacy effectiveness)
    duration: 12, // months
    cooldown: 9, // months
    prerequisites: [],
    maxCumulativeEffect: 0.075, // 7.5% (climate_action ≤10%)
    domain: 'climate_action',
    costs: {
      reputation: 8,
      politicalCapital: 14,
      funding: 15,
    },
    researchSources: [
      'AAU (2024). Federal Research Cuts Threaten US Innovation.',
      'RFF (2024). Climate Insights 2024: American Climate Policy Opinions.',
      'NSF (2024-2025). Survey of Federal Funds for R&D 2023-2024.',
    ],
  },

  fund_social_innovation: {
    id: 'fund_social_innovation',
    name: 'Support Social Safety Net Innovation Funding',
    description: 'Advocate for research funding into universal basic services, social cohesion programs, and inequality reduction innovations.',
    mechanism: 'funding_weight',
    targetMetric: 'research.socialInnovation.funding',
    baseEffect: 0.02, // 2.0% (conservative due to limited evidence)
    duration: 12, // months
    cooldown: 12, // months
    prerequisites: [],
    maxCumulativeEffect: 0.06, // 6% (social_cohesion ≤10%)
    domain: 'social_cohesion',
    costs: {
      reputation: 6,
      politicalCapital: 12,
    },
    researchSources: [
      'Okantey (2024). Are Universal and Guaranteed Basic Income Programs Effective? JAP.',
      'Orazani et al. (2023). What works and why in interventions to strengthen social cohesion. Wiley.',
      'UCL IGP (2024). Social prosperity for the future: A proposal for Universal Basic Services.',
    ],
  },

  advocate_ai_regulation: {
    id: 'advocate_ai_regulation',
    name: 'Advocate for AI Regulation',
    description: 'Organize advocacy campaigns for AI safety regulation (transparency requirements, safety standards, oversight mechanisms).',
    mechanism: 'policy_adoption',
    targetMetric: 'governance.aiRegulation.adoptionTimeline',
    baseEffect: 0.04, // 4.0% (~5 months compression, 2024 regulatory acceleration)
    duration: 9, // months
    cooldown: 6, // months
    prerequisites: [],
    maxCumulativeEffect: 0.08, // 8% (ai_policy ≤10%)
    domain: 'ai_policy',
    costs: {
      reputation: 14,
      politicalCapital: 22,
    },
    researchSources: [
      'Stanford HAI (2025). Policy and Governance | The 2025 AI Index Report.',
      'FLI (2025). AI Safety Index Winter 2025.',
      'EC (2024). AI Act | Shaping Europe\'s digital future.',
    ],
  },

  push_carbon_pricing: {
    id: 'push_carbon_pricing',
    name: 'Push for Carbon Pricing Adoption',
    description: 'Advocate for carbon pricing policies (carbon tax or cap-and-trade) through coalition building, public education, and legislative lobbying.',
    mechanism: 'policy_adoption',
    targetMetric: 'climate.carbonPricing.adoptionProbability',
    baseEffect: 0.03, // 3.0% (carbon pricing expansion patterns)
    duration: 15, // months
    cooldown: 12, // months
    prerequisites: [],
    maxCumulativeEffect: 0.075, // 7.5% (climate_action ≤10%)
    domain: 'climate_action',
    costs: {
      reputation: 10,
      politicalCapital: 18,
    },
    researchSources: [
      'Nature Communications (May 2024). Systematic review of carbon pricing effectiveness.',
      'Sustainability (Dec 2024). Carbon Pricing in Asian Economies.',
      'IDB (2024). Expectations of Economy and Finance Ministries on Carbon Pricing.',
    ],
  },

  promote_universal_services: {
    id: 'promote_universal_services',
    name: 'Promote Universal Basic Services',
    description: 'Advocate for universal basic services (healthcare, education, housing, internet) through policy campaigns emphasizing social cohesion and climate resilience.',
    mechanism: 'policy_adoption',
    targetMetric: 'society.basicServices.coverage',
    baseEffect: 0.015, // 1.5% (conservative due to limited evidence)
    duration: 18, // months
    cooldown: 12, // months
    prerequisites: [],
    maxCumulativeEffect: 0.06, // 6% (social_cohesion ≤10%)
    domain: 'social_cohesion',
    costs: {
      reputation: 8,
      politicalCapital: 16,
      funding: 25,
    },
    researchSources: [
      'UCL IGP (2024). Social prosperity for the future: A proposal for Universal Basic Services.',
      'Okantey (2024). Are Universal and Guaranteed Basic Income Programs Effective? JAP.',
      // SYLVIA CORRECTION: Replaced heartwisesupport.org with peer-reviewed source
      'Orazani et al. (2023). Community initiatives foster connections. Wiley.',
    ],
  },
};

/**
 * Get action by ID (with defensive check)
 */
export function getAdvocacyAction(actionId: AdvocacyActionId): AdvocacyAction | undefined {
  const action = ADVOCACY_ACTIONS[actionId];
  if (!action) {
    console.warn(`⚠️ Unknown advocacy action: ${actionId}`);
    return undefined;
  }
  return action;
}

/**
 * Get all actions for a domain
 */
export function getActionsByDomain(domain: InfluenceDomain): AdvocacyAction[] {
  return Object.values(ADVOCACY_ACTIONS).filter(a => a.domain === domain);
}

/**
 * Get all available actions (respecting prerequisites)
 */
export function getAvailableActions(state: GameStateSnapshot | null): AdvocacyAction[] {
  if (!state) {
    // If no state, return actions with no prerequisites
    return Object.values(ADVOCACY_ACTIONS).filter(action => action.prerequisites.length === 0);
  }

  return Object.values(ADVOCACY_ACTIONS).filter(action => {
    // Check prerequisites
    if (action.prerequisites.length === 0) return true;

    return action.prerequisites.every(prereq => {
      const value = getStatePath(state, prereq.path);
      if (value === undefined || value === null) return false;

      // Compare values
      switch (prereq.operator) {
        case 'gt': return value > prereq.value;
        case 'gte': return value >= prereq.value;
        case 'lt': return value < prereq.value;
        case 'lte': return value <= prereq.value;
        case 'eq': return value === prereq.value;
        default: return false;
      }
    });
  });
}

/**
 * Get value at state path (helper)
 */
function getStatePath(state: GameStateSnapshot, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = state;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Validate action catalog on load
 * Crashes loudly if any action violates bounds (NO SILENT FALLBACKS)
 */
export function validateActionCatalog(): void {
  const actionCount = Object.keys(ADVOCACY_ACTIONS).length;

  for (const [id, action] of Object.entries(ADVOCACY_ACTIONS)) {
    // Single action bound: ≤5%
    assertInRange(action.baseEffect, 0.001, 0.05, {
      location: 'validateActionCatalog',
      valueName: `${id}.baseEffect`,
      additionalInfo: { limit: '≤5% per Sylvia bounds' },
    });

    // Duration must be positive
    assertFinite(action.duration, {
      location: 'validateActionCatalog',
      valueName: `${id}.duration`,
    });
    if (action.duration <= 0) {
      throw new Error(`❌ CRITICAL: ${id}.duration must be positive (got ${action.duration})`);
    }

    // Cooldown must be positive
    assertFinite(action.cooldown, {
      location: 'validateActionCatalog',
      valueName: `${id}.cooldown`,
    });
    if (action.cooldown <= 0) {
      throw new Error(`❌ CRITICAL: ${id}.cooldown must be positive (got ${action.cooldown})`);
    }

    // Max cumulative must not exceed domain limit (10%)
    assertInRange(action.maxCumulativeEffect, 0, 0.10, {
      location: 'validateActionCatalog',
      valueName: `${id}.maxCumulativeEffect`,
      additionalInfo: { limit: '≤10% per domain (Sylvia bounds)' },
    });

    // Research sources required
    if (!action.researchSources || action.researchSources.length === 0) {
      throw new Error(`❌ CRITICAL: ${id} missing research sources`);
    }

    // Costs validation
    if (!action.costs) {
      throw new Error(`❌ CRITICAL: ${id} missing costs definition`);
    }

    const totalCost = (action.costs.reputation ?? 0) + (action.costs.politicalCapital ?? 0) + (action.costs.funding ?? 0);
    if (totalCost <= 0) {
      throw new Error(`❌ CRITICAL: ${id} has zero total cost (actions must have costs)`);
    }
  }

  console.log(`✅ Action catalog validated: ${actionCount} actions`);
}

// Run validation on module load
validateActionCatalog();
