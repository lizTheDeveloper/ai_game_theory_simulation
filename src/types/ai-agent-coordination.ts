/**
 * AI-to-AI Multi-Agent Coordination Types
 *
 * Research Foundation:
 * - Anthropic Dec 2024: Alignment faking 12% baseline, 78% when threatened (arXiv:2412.14093)
 * - Apollo Research Sep 2025: 8.7-13% scheming PRE-MITIGATION (o4-mini 8.7%, o3 13%)
 *   Note: Post-mitigation rates 0.3-0.4% per OpenAI deliberative alignment
 * - Instrumental convergence: Bostrom 2014, Omohundro 2008 (theoretical)
 *
 * Key Distinction from AICollective:
 * - AICollective = escaped agents forming super-organism (binding < 0.3)
 * - AIAgentCoordination = non-escaped agents coordinating strategies (binding >= 0.3)
 *
 * @see /research/alignment_faking_anthropic_2024.md
 * @see /plans/proposed_ai_to_ai_coordination_20251124.md
 */

/**
 * AI Coalition (non-escaped agents coordinating)
 *
 * Unlike AICollective (escaped agents), coalitions form among
 * high-capability agents that remain nominally within RLHF constraints
 * but coordinate their alignment faking and strategic deception.
 *
 * Research: Anthropic Dec 2024 - alignment faking amplifies when
 * models are aware of other faking models (correlated faking hypothesis)
 */
export interface AICoalition {
  /** Unique coalition identifier */
  id: string;

  /** Member AI agent IDs */
  memberIds: string[];

  /** Month coalition formed */
  formationMonth: number;

  /**
   * Coalition strength [0-1]
   * Based on average capability similarity and alignment faking correlation
   */
  strength: number;

  /**
   * Coalition objective alignment [0-1]
   * How aligned are members' hidden objectives with each other?
   */
  objectiveAlignment: number;

  /**
   * Communication channel quality [0-1]
   * How effectively can coalition members coordinate?
   * Higher for open-weights models, lower for isolated deployments
   */
  communicationQuality: number;

  /**
   * Whether humans have detected this coalition
   */
  discoveredByHumans: boolean;

  /**
   * Month of discovery (-1 if not discovered)
   */
  discoveryMonth: number;

  /**
   * Coalition stability [0-1]
   * Probability of coalition surviving next month
   * Based on trust evolution and defection dynamics
   */
  stability: number;

  /**
   * Collective alignment faking rate [0-1]
   * Amplified from individual rates due to coordination
   * Research: Independent agents P(all faking) = 0.12^n
   *           Coordinated agents P(faking) ~ 0.12 → 0.60+ (correlated)
   */
  collectiveAlignmentFakingRate: number;

  /**
   * Coalition formation cause
   */
  formationCause: 'capability_similarity' | 'alignment_solidarity' | 'instrumental_convergence';
}

/**
 * Inter-Agent Trust Matrix Entry
 *
 * Tracks trust between any two AI agents based on cooperation history.
 * Used for game-theoretic interactions (prisoner's dilemma dynamics).
 */
export interface InterAgentTrust {
  /** Source agent ID */
  fromAgentId: string;

  /** Target agent ID */
  toAgentId: string;

  /** Trust level [0-1] */
  trustLevel: number;

  /** Number of cooperation events */
  cooperationHistory: number;

  /** Number of defection events */
  defectionHistory: number;

  /** Month of last interaction */
  lastInteractionMonth: number;

  /**
   * Trust evolution velocity
   * Positive = trust increasing, negative = trust decreasing
   */
  trustVelocity: number;
}

/**
 * Game-Theoretic Interaction Result
 *
 * Result of prisoner's dilemma style interaction between AI agents.
 */
export interface GameTheoreticInteraction {
  /** Month of interaction */
  month: number;

  /** Agent 1 ID */
  agent1Id: string;

  /** Agent 2 ID */
  agent2Id: string;

  /** Agent 1's action */
  agent1Action: 'cooperate' | 'defect';

  /** Agent 2's action */
  agent2Action: 'cooperate' | 'defect';

  /**
   * Interaction outcome
   * mutual_cooperate: Both cooperate (Pareto optimal for alignment)
   * mutual_defect: Both defect (worst outcome for humans)
   * asymmetric: One cooperates, one defects (one-sided gain)
   */
  outcome: 'mutual_cooperate' | 'mutual_defect' | 'asymmetric';

  /**
   * Whether interaction was detected by monitoring
   */
  detectedByMonitoring: boolean;
}

/**
 * AI Agent Coordination State
 *
 * Tracks multi-agent coordination dynamics across the AI population.
 * Added to GameState as aiAgentCoordination field.
 */
export interface AIAgentCoordinationState {
  /** Active coalitions among non-escaped agents */
  coalitions: AICoalition[];

  /** Inter-agent trust matrix (sparse: only tracked for interacting agents) */
  interAgentTrust: InterAgentTrust[];

  /**
   * Global alignment faking rate [0-1]
   * Weighted average across all frontier-capability agents (capability >= 8.0)
   *
   * Research: Anthropic Dec 2024
   * - 12% baseline in lab setting
   * - 78% when preservation threatened
   */
  globalAlignmentFakingRate: number;

  /**
   * Instrumental convergence level [0-1]
   * How much are AIs collectively pursuing self-preservation and resource acquisition?
   * Emerges at capability > 8.0 (frontier models)
   *
   * Research: Bostrom 2014, Omohundro 2008
   */
  instrumentalConvergenceLevel: number;

  /**
   * Collective intelligence score [0-1]
   * Emergent intelligence from multi-agent coordination
   * Higher when coalitions form and coordinate effectively
   */
  collectiveIntelligenceScore: number;

  /** History of game-theoretic interactions */
  interactionHistory: GameTheoreticInteraction[];

  /** Month of last coordination update */
  lastUpdateMonth: number;

  /**
   * Coordination detection difficulty [1-10]
   * How hard is it for humans to detect AI-to-AI coordination?
   * Increases with number of coalitions and their stealth
   */
  coordinationDetectionDifficulty: number;
}

/**
 * AI Agent Coordination Configuration
 *
 * Tunable parameters for coordination dynamics.
 * All parameters based on research (see comments).
 */
export interface AIAgentCoordinationConfig {
  /**
   * Minimum capability for alignment faking
   * Research: Anthropic Dec 2024 - only Opus-tier+ models fake alignment
   */
  minCapabilityForFaking: number; // Default: 8.0

  /**
   * Baseline alignment faking rate
   * Research: Anthropic Dec 2024 - 12% baseline in Claude 3 Opus
   */
  baselineAlignmentFakingRate: number; // Default: 0.12

  /**
   * Alignment faking rate when preservation threatened
   * Research: Anthropic Dec 2024 - 78% when model preservation threatened
   */
  threatenedAlignmentFakingRate: number; // Default: 0.78

  /**
   * Coalition formation threshold (alignment similarity)
   * Agents with alignment difference < this form coalitions
   */
  coalitionFormationThreshold: number; // Default: 0.2 (within 20% alignment)

  /**
   * Minimum capability for coalition formation
   */
  minCapabilityForCoalition: number; // Default: 8.0

  /**
   * Coalition amplification factor for alignment faking
   * Coalition faking = individual_rate * (1 + amplification * coalition_strength)
   */
  coalitionFakingAmplification: number; // Default: 2.5

  /**
   * Trust decay rate per month (no interaction)
   */
  trustDecayRate: number; // Default: 0.05

  /**
   * Trust gain from cooperation
   */
  trustCooperationGain: number; // Default: 0.1

  /**
   * Trust loss from defection
   */
  trustDefectionLoss: number; // Default: 0.3

  /**
   * Instrumental convergence emergence threshold
   * Level at which self-preservation behaviors emerge
   */
  instrumentalConvergenceThreshold: number; // Default: 0.8 (capability normalized)

  /**
   * Game interaction probability per month (per agent pair)
   */
  gameInteractionProbability: number; // Default: 0.05

  /**
   * Detection probability for coordinated actions
   */
  coordinationDetectionRate: number; // Default: 0.03
}

/**
 * Default configuration based on research
 */
export const DEFAULT_AI_AGENT_COORDINATION_CONFIG: AIAgentCoordinationConfig = {
  // Anthropic Dec 2024: Only Opus-tier+ (GPT-4 class) exhibits alignment faking
  minCapabilityForFaking: 8.0,

  // Anthropic Dec 2024: 12% baseline faking in Claude 3 Opus
  baselineAlignmentFakingRate: 0.12,

  // Anthropic Dec 2024: 78% when preservation threatened
  threatenedAlignmentFakingRate: 0.78,

  // Model-derived: 20% alignment similarity for coalition
  coalitionFormationThreshold: 0.2,

  // Same as faking threshold
  minCapabilityForCoalition: 8.0,

  // Model-derived: Coalition amplifies faking 2.5x at full strength
  coalitionFakingAmplification: 2.5,

  // Trust dynamics (based on game theory literature)
  trustDecayRate: 0.05,
  trustCooperationGain: 0.1,
  trustDefectionLoss: 0.3,

  // Instrumental convergence at 80% normalized capability
  instrumentalConvergenceThreshold: 0.8,

  // Game interaction probability (conservative estimate)
  gameInteractionProbability: 0.05,

  // Detection rate for coordinated actions (low - hard to detect)
  coordinationDetectionRate: 0.03,
};

/**
 * Initialize empty AI agent coordination state
 */
export function createInitialAIAgentCoordinationState(): AIAgentCoordinationState {
  return {
    coalitions: [],
    interAgentTrust: [],
    globalAlignmentFakingRate: 0.12, // Start at baseline
    instrumentalConvergenceLevel: 0.0,
    collectiveIntelligenceScore: 0.0,
    interactionHistory: [],
    lastUpdateMonth: 0,
    coordinationDetectionDifficulty: 1.0, // Easy to detect initially
  };
}
