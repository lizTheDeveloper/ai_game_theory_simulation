// Alignment Technique Types (P3.3)
// Research-backed specific alignment methods vs abstract "alignment" metric

/**
 * Specific alignment technique with distinct properties and failure modes
 * Based on research from 2024-2025 (see /research/alignment_technique_properties_20251026.md)
 */
export interface AlignmentTechnique {
  name: AlignmentTechniqueName;

  // Core properties (all [0-1], research-backed values)
  effectiveness: number;           // How much alignment this technique provides
  robustness: number;             // Resistance to degradation as capability scales
  scalability: number;            // Works at high capability levels (0=breaks down, 1=scales perfectly)
  deploymentLevel: number;        // [0-1] Current adoption rate (0.05-0.85 as of 2024-2025)

  // Failure mode susceptibility (boolean flags)
  failureModes: {
    susceptibleToDeception: boolean;              // Can AI deceive this technique?
    susceptibleToGoalMisspecification: boolean;   // Can goals drift/misspecify?
    susceptibleToDistributionShift: boolean;      // Degrades on novel distributions?
  };

  // Fundamental limitations (Research Skeptic critique addition)
  fundamentalLimitations?: {
    conceptualBound: boolean;        // True if theoretical limit exists
    knownBlindSpots: string[];       // Specific failure modes not captured above
    requiresAugmentation: boolean;   // True if insufficient alone
  };

  // Parameter uncertainty ranges (for Monte Carlo)
  uncertaintyRanges?: {
    effectiveness: { min: number; max: number };
    robustness: { min: number; max: number };
    scalability: { min: number; max: number };
  };

  // Deployment quality variance (optional)
  deploymentQuality?: number;      // [0-1] Average quality of implementations
  effectiveDeployment?: number;    // deploymentLevel * deploymentQuality
}

/**
 * Four major alignment techniques as of 2024-2025
 */
export type AlignmentTechniqueName =
  | 'rlhf'              // Reinforcement Learning from Human Feedback
  | 'constitutional_ai'  // Constitutional AI (Anthropic)
  | 'mech_interp'       // Mechanistic Interpretability
  | 'iterated_amp';     // Iterated Amplification

/**
 * Interaction effect between alignment techniques
 * Some techniques synergize, some conflict
 */
export interface AlignmentTechniqueInteraction {
  techniques: AlignmentTechniqueName[];
  effectivenessDelta: number;      // Boost/penalty to effective alignment
  robustnessDelta: number;         // Boost/penalty to robustness
  empiricalEvidence: 'strong' | 'moderate' | 'weak' | 'theoretical';
  uncertainty: number;             // ± range for speculative interactions
}

/**
 * Research-backed technique definitions (2024-2025)
 * Source: /research/alignment_technique_properties_20251026.md
 * Critique: /reviews/alignment_technique_properties_critique_20251026.md
 */
export const ALIGNMENT_TECHNIQUE_DEFINITIONS: Record<AlignmentTechniqueName, AlignmentTechnique> = {
  // RLHF: Widely deployed but shallow alignment, degrades with capability
  rlhf: {
    name: 'rlhf',
    effectiveness: 0.58,      // Adjusted from 0.65 per research critique
    robustness: 0.45,         // Degrades significantly at high capability
    scalability: 0.50,        // Breaks down at superhuman levels
    deploymentLevel: 0.85,    // Near-universal adoption (OpenAI, Anthropic, Google, Meta)

    failureModes: {
      susceptibleToDeception: true,              // Reward hacking
      susceptibleToGoalMisspecification: true,   // Sycophancy bias
      susceptibleToDistributionShift: true,      // Generalization failures
    },

    fundamentalLimitations: {
      conceptualBound: true,  // Preference matching ≠ value alignment
      knownBlindSpots: [
        'preference_matching_not_value_alignment',
        'political_bias_post_training',
        'benign_failures_despite_investment',
        'human_evaluator_limitations'
      ],
      requiresAugmentation: true,  // "Relying solely on RLHF for AI safety is profoundly risky"
    },

    uncertaintyRanges: {
      effectiveness: { min: 0.55, max: 0.65 },
      robustness: { min: 0.35, max: 0.55 },
      scalability: { min: 0.40, max: 0.60 },
    },

    deploymentQuality: 0.50,   // Variance in implementation quality ($1M dataset vs cheap versions)
    effectiveDeployment: 0.425 // 0.85 * 0.50 = less than half use high-quality RLHF
  },

  // Constitutional AI: Value-based approach, stronger than RLHF but limited deployment
  constitutional_ai: {
    name: 'constitutional_ai',
    effectiveness: 0.70,       // Validated by research critique
    robustness: 0.60,          // More stable than RLHF at high capability
    scalability: 0.65,         // AI feedback removes human bottleneck
    deploymentLevel: 0.40,     // Primarily Anthropic (Claude models)

    failureModes: {
      susceptibleToDeception: false,             // Constitutional oversight
      susceptibleToGoalMisspecification: false,  // Explicit value grounding
      susceptibleToDistributionShift: false,     // Constitution applies broadly
    },

    fundamentalLimitations: {
      conceptualBound: false,  // No known theoretical limit
      knownBlindSpots: [
        'transparency_unclear',
        'over_refusal',
        'sycophancy_reduced_not_eliminated',
        'constitutional_loopholes_possible'
      ],
      requiresAugmentation: false,  // Can work alone
    },

    uncertaintyRanges: {
      effectiveness: { min: 0.55, max: 0.85 },  // Widened for org-specific variance
      robustness: { min: 0.50, max: 0.70 },
      scalability: { min: 0.55, max: 0.75 },
    },

    deploymentQuality: 0.70,   // Anthropic's high-quality implementation
    effectiveDeployment: 0.28  // 0.40 * 0.70
  },

  // Mechanistic Interpretability: Detection-focused, not alignment-creating
  mech_interp: {
    name: 'mech_interp',
    effectiveness: 0.55,       // Validated (detection capability, not alignment creation)
    robustness: 0.35,          // Degrades with model scale
    scalability: 0.30,         // Major scalability bottleneck (computational cost)
    deploymentLevel: 0.15,     // Primarily research, limited production

    failureModes: {
      susceptibleToDeception: true,              // Steganography, distributed reps
      susceptibleToGoalMisspecification: false,  // Detects goal drift
      susceptibleToDistributionShift: false,     // Analyzes internals, not inputs
    },

    fundamentalLimitations: {
      conceptualBound: true,   // Cannot interpret weights, only activations
      knownBlindSpots: [
        'steganography',
        'distributed_representations',
        'computational_infeasibility',
        'human_labor_bottleneck',
        'incomplete_coverage'
      ],
      requiresAugmentation: true,  // Must combine with alignment technique
    },

    uncertaintyRanges: {
      effectiveness: { min: 0.45, max: 0.65 },
      robustness: { min: 0.25, max: 0.45 },
      scalability: { min: 0.15, max: 0.45 },  // Unknown lower bound
    },

    deploymentQuality: 0.60,   // Research-quality implementations
    effectiveDeployment: 0.09  // 0.15 * 0.60
  },

  // Iterated Amplification: Highest theoretical effectiveness, mostly theoretical
  iterated_amp: {
    name: 'iterated_amp',
    effectiveness: 0.75,       // Validated (theoretical justification sound)
    robustness: 0.70,          // Designed for capability scaling
    scalability: 0.40,         // Computational cost limits practical deployment
    deploymentLevel: 0.05,     // Mostly theoretical (GPT-3 book summarization only)

    failureModes: {
      susceptibleToDeception: false,             // Human oversight at each step
      susceptibleToGoalMisspecification: true,   // Decomposition errors
      susceptibleToDistributionShift: false,     // Creates distribution at each level
    },

    fundamentalLimitations: {
      conceptualBound: true,   // Part-to-complete generalization unproven
      knownBlindSpots: [
        'error_propagation',
        'decomposition_fidelity',
        'computational_cost',
        'part_to_complete_generalization',
        'scalability_of_supervision'
      ],
      requiresAugmentation: false,  // Theoretically complete
    },

    uncertaintyRanges: {
      effectiveness: { min: 0.55, max: 0.95 },  // High uncertainty (sparse data)
      robustness: { min: 0.50, max: 0.90 },
      scalability: { min: 0.25, max: 0.55 },
    },

    deploymentQuality: 0.80,   // Limited but high-quality research implementations
    effectiveDeployment: 0.04  // 0.05 * 0.80
  },
};

/**
 * Predefined interaction effects (research-backed and speculative)
 * Adjusted per research critique to reduce overconfident synergies
 */
export const ALIGNMENT_TECHNIQUE_INTERACTIONS: AlignmentTechniqueInteraction[] = [
  // RLHF + Constitutional AI: CAI uses RLHF internally, constitution mitigates reward hacking
  {
    techniques: ['rlhf', 'constitutional_ai'],
    effectivenessDelta: 0.05,   // Reduced from +0.10 (conservative per critique)
    robustnessDelta: 0.08,      // Constitution provides stability
    empiricalEvidence: 'moderate', // Only Anthropic deploys this combination
    uncertainty: 0.05,          // High uncertainty (single org data)
  },

  // Mechanistic Interp + RLHF: Mech interp can audit RLHF for reward hacking
  {
    techniques: ['mech_interp', 'rlhf'],
    effectivenessDelta: 0.10,   // Reduced from +0.20 (audit capability, not real-time)
    robustnessDelta: 0.05,      // Detection improves but doesn't prevent
    empiricalEvidence: 'weak',  // Post-hoc analysis only, not production
    uncertainty: 0.10,          // Conditional on audit vs real-time mode
  },

  // Mechanistic Interp + Constitutional AI: Audit constitutional adherence
  {
    techniques: ['mech_interp', 'constitutional_ai'],
    effectivenessDelta: 0.10,   // Audit capability
    robustnessDelta: 0.05,      // Transparency improves stability
    empiricalEvidence: 'weak',  // Anthropic uses for research, not production monitoring
    uncertainty: 0.10,
  },

  // Iterated Amplification + RLHF: IDA can use RLHF at each recursive step
  {
    techniques: ['iterated_amp', 'rlhf'],
    effectivenessDelta: 0.08,   // Reduced from +0.15 (purely theoretical)
    robustnessDelta: 0.15,      // IDA's recursive structure preserves alignment
    empiricalEvidence: 'theoretical', // No empirical IDA+RLHF deployment
    uncertainty: 0.15,          // Effectively 0.00-0.30 range
  },

  // Iterated Amplification + Constitutional AI: IDA with constitutional principles
  {
    techniques: ['iterated_amp', 'constitutional_ai'],
    effectivenessDelta: 0.10,   // Theoretical synergy (best of both)
    robustnessDelta: 0.18,      // Recursive + constitutional constraints
    empiricalEvidence: 'theoretical', // No deployment
    uncertainty: 0.15,
  },

  // All three alignment techniques (RLHF + CAI + IDA)
  {
    techniques: ['rlhf', 'constitutional_ai', 'iterated_amp'],
    effectivenessDelta: 0.12,   // Diminishing returns from combination
    robustnessDelta: 0.20,      // Strong stability from multiple approaches
    empiricalEvidence: 'theoretical',
    uncertainty: 0.20,          // Highly speculative
  },
];

/**
 * Compute effective alignment from multiple techniques
 * Accounts for capability scaling degradation
 */
export function computeEffectiveAlignment(
  techniques: AlignmentTechnique[],
  capability: number  // [1.0, ∞) where 1.0 = human-level
): number {
  if (techniques.length === 0) {
    return 0; // No alignment techniques = no alignment
  }

  let totalAlignment = 0;
  let totalWeight = 0;

  techniques.forEach(technique => {
    // Capability scaling penalty (diminishing returns as capability increases)
    // Formula: effectiveAlignment = base * (1 - (c - 1.0) * (1 - scalability))
    // At capability=1.0 (human-level): full effectiveness
    // At capability=2.0 (2x human): degradation based on scalability
    const capabilityPenalty = Math.max(
      0,
      1 - (capability - 1.0) * (1 - technique.scalability)
    );

    // Deployment quality factor (if available)
    const qualityFactor = technique.deploymentQuality ?? 1.0;

    // Weighted contribution
    const contribution =
      technique.effectiveness *
      technique.deploymentLevel *
      capabilityPenalty *
      qualityFactor;

    totalAlignment += contribution;
    totalWeight += technique.deploymentLevel;
  });

  // Base alignment from techniques
  const baseAlignment = totalWeight > 0 ? totalAlignment / totalWeight : 0;

  // Apply interaction effects
  let effectivenesBoost = 0;
  ALIGNMENT_TECHNIQUE_INTERACTIONS.forEach(interaction => {
    const techniqueNames = techniques.map(t => t.name);
    const hasAllTechniques = interaction.techniques.every(name =>
      techniqueNames.includes(name)
    );

    if (hasAllTechniques) {
      effectivenesBoost += interaction.effectivenessDelta;
    }
  });

  // Final effective alignment (clamped to [0, 1])
  return Math.max(0, Math.min(1, baseAlignment + effectivenesBoost));
}

/**
 * Compute alignment robustness (resistance to degradation)
 * Higher robustness = more stable alignment under pressure
 */
export function computeAlignmentRobustness(
  techniques: AlignmentTechnique[]
): number {
  if (techniques.length === 0) {
    return 0;
  }

  // Weighted average of technique robustness values
  let totalRobustness = 0;
  let totalWeight = 0;

  techniques.forEach(technique => {
    totalRobustness += technique.robustness * technique.deploymentLevel;
    totalWeight += technique.deploymentLevel;
  });

  const baseRobustness = totalWeight > 0 ? totalRobustness / totalWeight : 0;

  // Apply interaction effects
  let robustnessBoost = 0;
  ALIGNMENT_TECHNIQUE_INTERACTIONS.forEach(interaction => {
    const techniqueNames = techniques.map(t => t.name);
    const hasAllTechniques = interaction.techniques.every(name =>
      techniqueNames.includes(name)
    );

    if (hasAllTechniques) {
      robustnessBoost += interaction.robustnessDelta;
    }
  });

  // Final robustness (clamped to [0, 1])
  return Math.max(0, Math.min(1, baseRobustness + robustnessBoost));
}

/**
 * Check if AI is susceptible to specific failure mode
 * Returns true if ANY technique is susceptible
 */
export function isSusceptibleToFailureMode(
  techniques: AlignmentTechnique[],
  failureMode: keyof AlignmentTechnique['failureModes']
): boolean {
  return techniques.some(technique => technique.failureModes[failureMode]);
}
