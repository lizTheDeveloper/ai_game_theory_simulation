/**
 * Game Layer Event Types
 *
 * These are DISTINCT from simulation events (src/types/events.ts).
 * Game layer events represent player-relevant observations and feedback.
 *
 * CRITICAL: Game layer NEVER imports from src/simulation/ internal modules.
 */

/**
 * Game layer event types - player-relevant categories
 */
export type GameLayerEventType =
  | 'crisis_detected'           // Crisis requiring player attention
  | 'technology_unlocked'       // New tech became available
  | 'outcome_shift'             // Outcome classification changed
  | 'boundary_change'           // Planetary boundary status changed
  | 'critical_juncture'         // Intervention window detected
  | 'campaign_started'          // Player campaign began
  | 'campaign_ended'            // Player campaign concluded
  | 'coalition_formed'          // Coalition created
  | 'coalition_dissolved'       // Coalition ended
  | 'influence_applied'         // Player influence took effect
  | 'milestone_reached'         // Game milestone achieved
  | 'scenario_event';           // Scenario-specific event

/**
 * Severity levels for game events
 */
export type GameLayerSeverity =
  | 'info'          // Informational
  | 'success'       // Positive outcome
  | 'warning'       // Requires attention
  | 'danger'        // Serious concern
  | 'critical';     // Existential threat

/**
 * Game layer event - what the player sees/reacts to
 */
export interface GameLayerEvent {
  /** Unique event ID */
  id: string;

  /** Month when event occurred */
  month: number;

  /** Event type */
  type: GameLayerEventType;

  /** Severity level */
  severity: GameLayerSeverity;

  /** Human-readable title */
  title: string;

  /** Detailed description */
  description: string;

  /** Optional narrative framing */
  narrative?: string;

  /** Related game state paths (for highlighting in UI) */
  relatedMetrics?: string[];

  /** Whether player can take action in response */
  actionable: boolean;

  /** Suggested actions if actionable */
  suggestedActions?: string[];
}

/**
 * Crisis event - detected emergencies requiring response
 */
export interface CrisisEvent extends GameLayerEvent {
  type: 'crisis_detected';

  /** Crisis domain */
  domain: 'environmental' | 'social' | 'technological' | 'political' | 'economic';

  /** Crisis severity level */
  crisisSeverity: 'minor' | 'moderate' | 'severe' | 'catastrophic';

  /** Time window for effective response (months) */
  responseWindow: number;

  /** Expected impact if unaddressed */
  projectedImpact: {
    metric: string;
    currentValue: number;
    projectedValue: number;
    timeframe: number;
  }[];
}

/**
 * Technology event - tech becoming available or deployed
 */
export interface TechnologyEvent extends GameLayerEvent {
  type: 'technology_unlocked';

  /** Technology ID */
  techId: string;

  /** Technology name */
  techName: string;

  /** Technology tier (0-4) */
  tier: number;

  /** Primary impact category */
  category: string;

  /** Expected effects */
  effects: string[];
}

/**
 * Outcome shift event - trajectory change detected
 */
export interface OutcomeEvent extends GameLayerEvent {
  type: 'outcome_shift';

  /** Previous outcome classification */
  previousOutcome: string;

  /** New outcome classification */
  newOutcome: string;

  /** Direction of change */
  direction: 'improving' | 'worsening';

  /** Key factors in the shift */
  keyFactors: string[];
}

/**
 * Planetary boundary event - threshold crossed
 */
export interface BoundaryEvent extends GameLayerEvent {
  type: 'boundary_change';

  /** Boundary name */
  boundaryName: string;

  /** Previous status */
  previousStatus: 'safe' | 'warning' | 'danger' | 'critical';

  /** New status */
  newStatus: 'safe' | 'warning' | 'danger' | 'critical';

  /** Reversibility assessment */
  reversible: boolean;

  /** Time to irreversibility (months, if applicable) */
  timeToIrreversibility?: number;
}

/**
 * Critical juncture event - intervention window detected
 */
export interface JunctureEvent extends GameLayerEvent {
  type: 'critical_juncture';

  /** Juncture type */
  junctureType: 'policy_window' | 'tech_window' | 'social_window' | 'crisis_inflection';

  /** Window duration (months) */
  windowDuration: number;

  /** Potential impact of action during window */
  potentialImpact: {
    optimistic: string;
    pessimistic: string;
  };

  /** Available actions during this window */
  availableActions: string[];
}

/**
 * Event handler type for subscriptions
 */
export type GameLayerEventHandler<T extends GameLayerEvent = GameLayerEvent> = (event: T) => void;

/**
 * Event subscription result
 */
export interface EventSubscription {
  /** Unsubscribe function */
  unsubscribe: () => void;
}
