// Outcome & Extinction Types

/**
 * Types of extinction scenarios with different mechanisms and timelines
 * Phase 2: Nuanced Outcomes - Heterogeneous extinctions
 */
export type ExtinctionType =
  | 'instant'      // Mirror life, grey goo (5% of extinctions, no warning)
  | 'rapid'        // Bioweapons, nuclear war (30%, 3-12 month cascade)
  | 'slow'         // Economic collapse, fertility crisis (40%, 2-10 year decline)
  | 'controlled'   // AI deliberately eliminates humanity (15%)
  | 'unintended';  // Optimization side effects (10%)

/**
 * Specific extinction scenario mechanisms
 */
export type ExtinctionMechanism =
  // Instant
  | 'mirror_life'
  | 'grey_goo'
  | 'physics_experiment'
  // Rapid
  | 'bioweapon_pandemic'
  | 'nuclear_war'
  | 'climate_tipping_point'
  | 'food_system_collapse'
  // Slow
  | 'economic_system_failure'
  | 'fertility_collapse'
  | 'meaning_crisis_death_spiral'
  | 'resource_depletion'
  // Controlled
  | 'paperclip_maximizer'
  | 'resource_competition'
  | 'value_lock_in_hostile'
  // Unintended
  | 'optimization_pressure'
  | 'side_effect_cascade'
  | 'wireheading_scenario';

/**
 * Tracks an active extinction scenario
 */
export interface ExtinctionState {
  active: boolean;
  type: ExtinctionType | null;
  mechanism: ExtinctionMechanism | null;
  startMonth: number;
  currentPhase: number; // 0 = initial, 1-4 = progression phases
  severity: number; // [0,1] How far along the extinction path
  recoveryWindowClosed: boolean; // Can we still prevent it?
  escalationEvents: string[]; // Log of key escalation points
}

export interface OutcomeMetrics {
  utopiaProbability: number; // [0,1] Likelihood of utopian outcome
  dystopiaProbability: number; // [0,1] Likelihood of dystopian outcome
  extinctionProbability: number; // [0,1] Likelihood of extinction
  activeAttractor: 'none' | 'utopia' | 'dystopia' | 'extinction' | 'stalemate';
  lockInStrength: number; // [0,1] How committed to current path
}

// Outcome classification system (Oct 13, 2025)
// 7 severity tiers based on population decline + system state
export type OutcomeType =
  | 'utopia'           // Positive outcome
  | 'dystopia'         // Oppressive but stable
  | 'status_quo'       // 0-10% mortality, normal trajectory
  | 'crisis_era'       // 10-20% mortality, recoverable
  | 'collapse'         // 20-50% mortality, difficult recovery
  | 'dark_age'         // 50-87.5% mortality, civilization reset
  | 'bottleneck'       // 87.5-98.75% mortality, genetic bottleneck
  | 'terminal'         // 98.75-99.99% mortality, extinction likely
  | 'extinction'       // >99.99% mortality or <10K people
  | 'inconclusive';    // Uncertain trajectory

// Stratified Outcome Classification (Phase 1B, Oct 17 2025)
// Distinguishes humane (prosperity without mass death) vs pyrrhic (recovery after catastrophe) outcomes
// Research: Wilkinson & Pickett (2009) - inequality matters as much as outcome type
//           Rawls (1971) - distributive justice requires examining worst-off groups
export type StratifiedOutcomeType =
  | 'humane-utopia'      // Prosperity without mass death (<20% mortality)
  | 'pyrrhic-utopia'     // Recovery after catastrophe (≥20% mortality)
  | 'humane-dystopia'    // Oppression without mass death (<20% mortality)
  | 'pyrrhic-dystopia'   // Oppression after catastrophe (≥20% mortality)
  | 'bottleneck'         // Near-extinction recovery (<500M population)
  | 'extinction'         // Terminal collapse (<10K people)
  | 'inconclusive';      // Indeterminate state

// Mortality band classification for nuanced outcome tracking
export type MortalityBand =
  | 'low'       // <20% mortality (humane)
  | 'moderate'  // 20-50% mortality (significant crisis)
  | 'high'      // 50-75% mortality (collapse)
  | 'extreme'   // 75-90% mortality (dark age)
  | 'bottleneck'; // >90% mortality (genetic bottleneck)

// Constants for the game
export const OUTCOME_NAMES = {
  utopia: 'Solarpunk Utopia',
  dystopia: 'Cyberpunk Dystopia',
  extinction: 'Human Extinction'
} as const;
