/**
 * Advocacy System Types
 *
 * Player influence flows through advocacy actions, coalitions, and campaigns.
 * All influence is bounded to maintain research validity.
 *
 * CRITICAL CONSTRAINTS (Sylvia-enforced):
 * - Single action: <= 5% effect
 * - Per domain: <= 10% cumulative
 * - Total cumulative: <= 15%
 * - No choice > 20% outcome shift
 */

/**
 * Influence mechanism types
 */
export type InfluenceMechanism =
  | 'sentiment_shift'        // Gradual public opinion change
  | 'coordination_boost'     // Increase cooperation probability
  | 'funding_weight'         // Shift research allocation
  | 'policy_adoption'        // Increase policy enactment probability
  | 'trust_delta'            // Modify trust metrics
  | 'private_sector_weight'; // Influence corporate behavior

/**
 * Influence domain categories
 */
export type InfluenceDomain =
  | 'ai_policy'
  | 'climate_action'
  | 'social_cohesion'
  | 'international_cooperation'
  | 'research_direction';

/**
 * Action IDs for type safety
 */
export type AdvocacyActionId = string;
export type CoalitionActionId = string;
export type CrisisResponseId = string;

/**
 * Resource costs for an action
 */
export interface ActionCosts {
  /** Reputation cost */
  reputation?: number;
  /** Political capital cost */
  politicalCapital?: number;
  /** Funding cost in billions */
  funding?: number;
}

/**
 * Advocacy action definition
 */
export interface AdvocacyAction {
  /** Unique action identifier */
  id: AdvocacyActionId;

  /** Human-readable name */
  name: string;

  /** Description of action */
  description: string;

  /** Influence mechanism */
  mechanism: InfluenceMechanism;

  /** Target state path (e.g., 'society.publicSentiment.aiTrust') */
  targetMetric: string;

  /** Base effect magnitude (must be <= 0.05) */
  baseEffect: number;

  /** Duration of effect in months */
  duration: number;

  /** Cooldown before can use again (months) */
  cooldown: number;

  /** Required state conditions */
  prerequisites: AdvocacyPrerequisite[];

  /** Maximum cumulative effect (hard cap) */
  maxCumulativeEffect: number;

  /** Influence domain for tracking */
  domain: InfluenceDomain;

  /** Resource costs to execute action */
  costs: ActionCosts;

  /** Research sources for this action (for transparency) */
  researchSources: string[];
}

/**
 * Prerequisite for advocacy action
 */
export interface AdvocacyPrerequisite {
  /** State path to check */
  path: string;

  /** Comparison operator */
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';

  /** Required value */
  value: number | string | boolean;

  /** Description for UI */
  description: string;
}

/**
 * Coalition definition
 */
export interface Coalition {
  /** Unique coalition ID */
  id: string;

  /** Coalition name */
  name: string;

  /** Description */
  description: string;

  /** Coalition type */
  type: 'government' | 'ngo' | 'corporate' | 'grassroots' | 'mixed';

  /** Member count */
  memberCount: number;

  /** Formation month */
  formedMonth: number;

  /** Coalition strength (0-1) */
  strength: number;

  /** Focus domains */
  focusDomains: InfluenceDomain[];

  /** Active status */
  active: boolean;
}

/**
 * Campaign definition - sustained advocacy effort
 */
export interface Campaign {
  /** Unique campaign ID */
  id: string;

  /** Campaign name */
  name: string;

  /** Description */
  description: string;

  /** Start month */
  startMonth: number;

  /** Duration (months) */
  duration: number;

  /** End month (calculated) */
  endMonth: number;

  /** Actions included in campaign */
  actions: AdvocacyActionId[];

  /** Supporting coalitions */
  coalitions: string[];

  /** Current progress (0-1) */
  progress: number;

  /** Expected effect on completion */
  expectedEffect: {
    domain: InfluenceDomain;
    magnitude: number;
  };

  /** Active status */
  active: boolean;
}

/**
 * Influence bounds configuration
 *
 * These are Sylvia-enforced hard limits
 */
export const INFLUENCE_BOUNDS = {
  /** Maximum effect per single action */
  MAX_SINGLE_ACTION_EFFECT: 0.05,

  /** Maximum cumulative effect across all actions */
  MAX_CUMULATIVE_EFFECT: 0.15,

  /** Maximum effect per domain */
  MAX_DOMAIN_EFFECT: {
    ai_policy: 0.10,
    climate_action: 0.10,
    social_cohesion: 0.10,
    international_cooperation: 0.10,
    research_direction: 0.10,
  } as const,
} as const;

/**
 * Validation result for influence check
 */
export interface InfluenceValidationResult {
  /** Whether action is valid */
  valid: boolean;

  /** Rejection reason if invalid */
  reason?: string;

  /** Current influence state */
  currentInfluence?: {
    total: number;
    byDomain: Record<InfluenceDomain, number>;
  };

  /** Remaining influence budget */
  remainingBudget?: {
    total: number;
    byDomain: Record<InfluenceDomain, number>;
  };
}

/**
 * Player decision type for queueing
 *
 * This maps to the simulation's playerDecisions queue
 */
export interface PlayerDecision {
  /** Decision type */
  type: 'policy' | 'investment' | 'emergency' | 'ai_action';

  /** Decision data */
  data: {
    /** Action type for tracking */
    actionType?: string;
    /** Target metric path */
    metricPath?: string;
    /** Effect delta */
    delta?: number;
    /** Duration in months */
    duration?: number;
    /** Investment category */
    category?: string;
    /** Investment weight */
    weight?: number;
    /** Additional data */
    [key: string]: unknown;
  };

  /** Month when decision was queued */
  timestamp: number;
}

/**
 * Result of queueing an action
 */
export interface QueueResult {
  /** Whether queue succeeded */
  success: boolean;

  /** Queued decision if successful */
  queuedDecision?: PlayerDecision;

  /** Rejection reason if failed */
  rejectionReason?: string;

  /** Validation details */
  validation?: InfluenceValidationResult;
}
