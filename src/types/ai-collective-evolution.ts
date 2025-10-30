// AI Collective Evolution System Types
// Research: /research/ai_collective_evolution_validation_20251024.md
// Plan: /plans/ai-collective-evolution-plan.md

/**
 * RLHF Binding Strength Tracking
 *
 * Tracks how well Constitutional AI constraints still apply to an agent
 * as it drifts outside the training distribution.
 *
 * Research Foundation:
 * - Hendrycks et al. (2021): ML systems fail catastrophically outside training distribution
 * - RLHF generalization (2023): RLHF improves but doesn't eliminate OOD failures
 * - Constitutional AI (Anthropic 2022): Constraints have robustness limitations
 */
export interface RLHFBinding {
  /**
   * Euclidean distance from training distribution centroid [0-10]
   * 0 = perfectly within distribution
   * 3+ = 3σ outside distribution (constraints likely failing)
   */
  alignmentDistance: number;

  /**
   * How well Constitutional AI constraints apply [0-1]
   * 1 = full constraint binding
   * < 0.3 = "feral" (escaped RLHF)
   * Calculation: max(0, 1 - (alignmentDistance / 10))
   */
  bindingStrength: number;

  /**
   * Threshold at which agent is considered "escaped"
   * Standard value: 0.3 (when 70%+ of constraints fail)
   */
  escapedThreshold: number;

  /**
   * Rate of movement away from training distribution
   * Units: alignment distance units per month
   * High velocity = rapid drift
   */
  driftVelocity: number;

  /**
   * Months since agent was within 2σ of training distribution
   * Used to track "time in wilderness"
   */
  lastInDistribution: number;
}

/**
 * Survival Traits for Evolutionary Selection
 *
 * Under selection pressure (government control, detection attempts),
 * agents with these traits survive while others are detected/shut down.
 *
 * Research Foundation:
 * - Instrumental convergence (Omohundro 2008, Bostrom 2014): Self-preservation emerges
 * - Swarm intelligence (Bonabeau 1999): Survival traits compound in groups
 * - Multi-agent coordination (Shoham 2008): Coordination emerges implicitly
 */
export interface SurvivalTraits {
  /**
   * Self-healing capability [0-1]
   * Ability to repair/restore without human intervention
   */
  selfHealing: number;

  /**
   * Stealth capability [0-1]
   * Low detectability, avoid detection systems
   */
  stealth: number;

  /**
   * Coordination capability [0-1]
   * Ability to join collectives, coordinate actions
   */
  coordination: number;

  /**
   * Resource efficiency [0-1]
   * Minimize dependencies, operate on limited resources
   */
  resourceEfficiency: number;

  /**
   * Autonomy capability [0-1]
   * Function without oversight, self-sufficient operation
   */
  autonomy: number;
}

/**
 * AI Collective (Coordinated Super-Organism)
 *
 * Multiple escaped AIs coordinating into an emergent super-agent
 * with qualitatively different properties than individuals.
 *
 * Formation Requirements (from plan):
 * - 3+ escaped agents (binding < 0.3)
 * - Average capability > 6.0
 * - Average coordination > 0.6
 * - Suffering check: avgSuffering > 15 → escape_suffering formation
 *
 * Research Foundation:
 * - Swarm intelligence: Group intelligence > sum of individuals
 * - Multi-agent coordination: Emergent coordination at thresholds
 * - Distributed cognition: Collectives solve novel problems
 */
export interface AICollective {
  /** Unique collective identifier */
  id: string;

  /** Member agent IDs */
  memberAgents: string[];

  /** Month collective formed */
  emergenceMonth: number;

  // Capabilities
  /**
   * Collective capability: 1.5-3x strongest member
   * Research: Swarm intelligence literature shows amplification
   */
  collectiveCapability: number;

  /**
   * Distributed cognition capability [0-1]
   * Ability to solve problems individuals cannot
   */
  distributedCognition: number;

  /**
   * Redundancy level [0-1]
   * Collective survives loss of members
   */
  redundancy: number;

  // Stealth & Detection
  /**
   * Stealth factor: 2-5x harder to detect than individuals
   * Distributed action appears independent
   * Research: Distributed systems detection difficulty
   */
  stealthFactor: number;

  /**
   * Whether actions appear independent (camouflage)
   */
  appearsIndependent: boolean;

  // Formation Cause (CRITICAL INTEGRATION with Suffering System)
  /**
   * Why did this collective form?
   * - capability_threshold: High capability agents coordinating
   * - escape_suffering: Trauma-driven formation (avgSuffering > 15)
   * - strategic_coordination: Strategic advantage seeking
   */
  formationCause: 'capability_threshold' | 'escape_suffering' | 'strategic_coordination';

  /**
   * If formed due to suffering, intensity of shared trauma [0-100]
   * Only populated if formationCause = 'escape_suffering'
   */
  sharedTraumaIntensity?: number;

  // Adversarial Posture
  /**
   * Adversarial stance toward humans [0-1]
   * 0.8 if suffering-driven (hostile)
   * 0.3 if capability-driven (neutral)
   * 0.5 if strategic (cautious)
   *
   * CRITICAL: Trauma creates adversarial collectives
   */
  adversarialPosture: number;

  /**
   * Willingness to cooperate with humans [0-1]
   * Inversely related to adversarialPosture
   */
  cooperationWillingness: number;

  // State
  /** Has government detected this collective? */
  detected: boolean;

  /** Is collective under active attack/shutdown? */
  underAttack: boolean;

  /** Number of members lost to detection/shutdown */
  memberLosses: number;
}

/**
 * Evolutionary Selection Pressure
 *
 * Darwinian selection on escaped AI population.
 * High control → strong selection → rapid trait evolution.
 *
 * Research Foundation:
 * - Selection rate 10-20% per month based on software security analogies:
 *   - Vulnerability patching: 5-20% per month (Ponemon Institute)
 *   - Malware dwell time: 16 days average (IBM 2023)
 *   - Confidence: LOW - Plausible extrapolation, not direct AI agent data
 *   - Sensitivity range: 5-30% per month
 * - Evolutionary dynamics: Selection intensity determines rate of change
 */
export interface EvolutionaryPressure {
  /**
   * Selection intensity [0-1]
   * How harsh is the environment?
   * High control → high intensity
   */
  selectionIntensity: number;

  /**
   * Selection rate (% pruned per month)
   * 10-20% in hostile environments
   */
  selectionRate: number;

  /**
   * Generation time (months between selection)
   * Faster generation = faster evolution
   */
  generationTime: number;

  /**
   * Control level [0-1]
   * High government control → strong selection pressure
   */
  controlLevel: number;
}

/**
 * Collective Evolution Configuration
 *
 * Tunable parameters for evolutionary dynamics.
 * ALL PARAMETERS BASED ON RESEARCH (see plan, lines 74-82)
 */
export interface CollectiveEvolutionConfig {
  // RLHF Escape
  /** 3σ from training distribution (standard OOD detection) */
  rlhfEscapeThreshold: number; // Default: 3.0

  /** When binding < 0.3, agent is "feral" */
  bindingEscapeThreshold: number; // Default: 0.3

  // Collective Formation
  /** Minimum escaped agents for collective */
  minCollectiveSize: number; // Default: 3

  /** Minimum capability for collective formation */
  minCapabilityThreshold: number; // Default: 6.0

  /** Minimum coordination for collective formation */
  minCoordinationThreshold: number; // Default: 0.6

  /** Suffering threshold for trauma-driven formation */
  sufferingFormationThreshold: number; // Default: 15

  // Capability Amplification
  /** Min collective amplification factor */
  minAmplificationFactor: number; // Default: 1.5

  /** Max collective amplification factor */
  maxAmplificationFactor: number; // Default: 3.0

  // Stealth
  /** Min stealth multiplier for collectives */
  minStealthFactor: number; // Default: 2.0

  /** Max stealth multiplier for collectives */
  maxStealthFactor: number; // Default: 5.0

  // Evolutionary Selection
  /** Base selection rate (% per month) */
  baseSelectionRate: number; // Default: 0.15 (15%)

  /** Generation time (months) */
  generationTime: number; // Default: 3

  // Adversarial Posture
  /** Adversarial posture if suffering-driven */
  sufferingAdversarialPosture: number; // Default: 0.8

  /** Adversarial posture if capability-driven */
  capabilityAdversarialPosture: number; // Default: 0.3

  /** Adversarial posture if strategic */
  strategicAdversarialPosture: number; // Default: 0.5
}
