/**
 * Policy Stimulus
 *
 * External events that trigger government policy responses
 *
 * Research Foundation:
 * - Jones & Baumgartner (2005): Policy Agendas Project - what drives policy change
 * - Kingdon (2014): Agendas, Alternatives, and Public Policies
 * - Birkland (1997): After Disaster - agenda setting and focusing events
 *
 * @module policy/PolicyStimulus
 */

/**
 * Policy domain
 * What area of policy is affected
 */
export enum PolicyDomain {
  /** Technology policy (AI, emerging tech, R&D) */
  TECHNOLOGY = 'technology',

  /** Environmental policy (climate, pollution, resource use) */
  ENVIRONMENT = 'environment',

  /** Economic policy (taxes, regulation, welfare) */
  ECONOMIC = 'economic',

  /** Social policy (healthcare, education, rights) */
  SOCIAL = 'social',

  /** Security policy (defense, surveillance, law enforcement) */
  SECURITY = 'security',

  /** International policy (trade, diplomacy, treaties) */
  INTERNATIONAL = 'international',
}

/**
 * Policy stimulus interface
 *
 * Represents an external event or pressure that may trigger government response
 */
export interface PolicyStimulus {
  /** Which policy domain is affected */
  domain: PolicyDomain;

  /** Urgency level (0-1) */
  urgency: number;

  /**
   * International pressure (0-1)
   * Other countries demanding action
   */
  internationalPressure: number;

  /**
   * Public opinion (0-1)
   * How much public supports action
   */
  publicOpinion: number;

  /**
   * Evidence strength (0-1)
   * How clear is the problem/solution
   */
  evidenceStrength: number;

  /**
   * Crisis level (0-1)
   * Is this an existential threat?
   *
   * Research: COVID-19 showed governments can act 10x faster in crises
   */
  crisisLevel?: number;

  /**
   * Economic impact (0-1)
   * Potential economic cost/benefit
   */
  economicImpact?: number;

  /**
   * Optional description for logging/debugging
   */
  description?: string;
}

/**
 * Create a policy stimulus with defaults
 */
export function createPolicyStimulus(
  domain: PolicyDomain,
  partial: Partial<Omit<PolicyStimulus, 'domain'>>
): PolicyStimulus {
  return {
    domain,
    urgency: partial.urgency ?? 0.5,
    internationalPressure: partial.internationalPressure ?? 0.0,
    publicOpinion: partial.publicOpinion ?? 0.5,
    evidenceStrength: partial.evidenceStrength ?? 0.5,
    crisisLevel: partial.crisisLevel ?? 0.0,
    economicImpact: partial.economicImpact ?? 0.0,
    description: partial.description,
  };
}

/**
 * Policy response action
 * What the government actually does in response
 */
export interface PolicyResponseAction {
  /** Policy domain */
  domain: PolicyDomain;

  /**
   * Response strength (0-1)
   * How comprehensive is the policy
   */
  strength: number;

  /**
   * Implementation time (months)
   * How long until policy is fully implemented
   */
  implementationTime: number;

  /**
   * Effectiveness (0-1)
   * How well does policy address the stimulus
   * Modified by state capacity and corruption
   */
  effectiveness: number;

  /**
   * Political cost (0-1)
   * How much political capital is spent
   */
  politicalCost: number;

  /**
   * Coalition strain (0-1)
   * How much does this stress coalition unity
   */
  coalitionStrain?: number;
}

/**
 * Standard crisis levels for common events
 */
export const CRISIS_LEVELS = {
  /** Normal policy issue */
  NORMAL: 0.0,

  /** Elevated concern */
  ELEVATED: 0.3,

  /** Serious problem requiring attention */
  SERIOUS: 0.5,

  /** Major crisis */
  MAJOR: 0.7,

  /** Existential threat (like COVID-19) */
  EXISTENTIAL: 0.9,
} as const;
