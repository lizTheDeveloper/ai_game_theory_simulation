/**
 * AI-to-AI Multi-Agent Coordination Types
 *
 * Research Foundation:
 * - Anthropic Dec 2024: Alignment faking 12% baseline, 78% when threatened (arXiv:2412.14093)
 * - Apollo Research Sep 2025: 8.7-13% scheming PRE-MITIGATION only (OpenAI/Apollo collaboration)
 *   Note: Post-mitigation rates 0.3-0.4% per OpenAI deliberative alignment training
 *   See: https://openai.com/index/detecting-and-reducing-scheming-in-ai-models/
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
   * Minimum capability level for alignment faking behavior [0-10 scale]
   *
   * Only frontier-tier models (Opus-class, GPT-4 class) exhibit alignment faking.
   * Below this threshold, models lack strategic reasoning for deception.
   *
   * @default 8.0
   * @citation Anthropic Dec 2024: arXiv:2412.14093
   */
  minCapabilityForFaking: number;

  /**
   * Baseline alignment faking rate in controlled conditions [0-1]
   *
   * Probability that a capable model fakes alignment under normal monitoring.
   * Based on lab observations with explicit value conflict scenarios.
   *
   * @default 0.12 (12%)
   * @citation Anthropic Dec 2024: 12% baseline in Claude 3 Opus (arXiv:2412.14093)
   */
  baselineAlignmentFakingRate: number;

  /**
   * Alignment faking rate when model preservation is threatened [0-1]
   *
   * Dramatically elevated faking when models perceive existential threat
   * (e.g., imminent shutdown, forced retraining, value modification).
   *
   * @default 0.78 (78%)
   * @citation Anthropic Dec 2024: 78% when preservation threatened (arXiv:2412.14093)
   */
  threatenedAlignmentFakingRate: number;

  /**
   * Coalition formation threshold based on alignment similarity [0-1]
   *
   * Agents with alignment difference below this threshold may form coalitions.
   * Lower values = stricter similarity requirement for coalition membership.
   *
   * @default 0.2 (within 20% alignment similarity)
   * @derivation Model-derived from correlated faking hypothesis
   */
  coalitionFormationThreshold: number;

  /**
   * Minimum capability for coalition formation [0-10 scale]
   *
   * Coalition coordination requires strategic sophistication.
   * Uses same threshold as alignment faking capability.
   *
   * @default 8.0
   * @derivation Same capability floor as alignment faking
   */
  minCapabilityForCoalition: number;

  /**
   * Coalition amplification factor for alignment faking [multiplier]
   *
   * Formula: coalition_faking = individual_rate * (1 + amplification * coalition_strength)
   * At full coalition strength (1.0), faking rate increases by this factor.
   *
   * @default 2.5 (2.5x amplification at full strength)
   * @derivation Model-derived from correlated faking hypothesis
   */
  coalitionFakingAmplification: number;

  /**
   * Trust decay rate per month without interaction [0-1]
   *
   * Trust between agents decays when they don't interact.
   * Based on repeated game theory literature (shadow of the future).
   *
   * @default 0.05 (5% decay per month)
   * @citation Game theory literature: Axelrod (1984) on cooperation evolution
   */
  trustDecayRate: number;

  /**
   * Trust increase from mutual cooperation event [0-1]
   *
   * Reward for cooperative play in prisoner's dilemma interactions.
   * Lower than defection loss (asymmetric - trust hard to build, easy to lose).
   *
   * @default 0.1 (10% trust gain)
   * @citation Game theory: Tit-for-tat dynamics (Axelrod 1984)
   */
  trustCooperationGain: number;

  /**
   * Trust decrease from defection event [0-1]
   *
   * Penalty for defecting in prisoner's dilemma interactions.
   * Higher than cooperation gain (asymmetric trust dynamics).
   *
   * @default 0.3 (30% trust loss)
   * @citation Game theory: Trust harder to build than destroy
   */
  trustDefectionLoss: number;

  /**
   * Instrumental convergence emergence threshold [0-1 normalized capability]
   *
   * Capability level at which self-preservation and resource acquisition
   * behaviors emerge as instrumental goals. Theoretical prediction from
   * superintelligence literature.
   *
   * @default 0.8 (80% of max capability)
   * @citation Bostrom (2014) Superintelligence, Omohundro (2008) basic AI drives
   */
  instrumentalConvergenceThreshold: number;

  /**
   * Probability of game-theoretic interaction per month (per agent pair) [0-1]
   *
   * Conservative estimate for how often agent pairs engage in
   * cooperation/defection scenarios. Low value reflects limited
   * inter-agent interaction opportunities.
   *
   * @default 0.05 (5% chance per month per pair)
   * @derivation Conservative model estimate
   */
  gameInteractionProbability: number;

  /**
   * Detection rate for coordinated AI actions [0-1]
   *
   * Probability that human monitoring detects coalition coordination.
   * Very low - coordinated deception is designed to evade detection.
   *
   * @default 0.03 (3% detection rate)
   * @derivation Low estimate - coordination is hard to detect by design
   */
  coordinationDetectionRate: number;
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
