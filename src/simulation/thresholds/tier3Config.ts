/**
 * Tier 3 Threshold Configurations - Phase 3
 *
 * Defines named scenarios for speculative thresholds with no historical precedent.
 * Uses explicit worldview-based scenarios instead of probability distributions.
 *
 * Research Foundation: research/threshold_tier3_scenarios_20251026.md
 * - AI Rights Bootstrap: No precedent for AI personhood recognition
 * - Superintelligence Alignment: AGI doesn't exist, models conflict
 * - Post-Scarcity Transition: Never happened, theoretical only
 * - Meaning Framework Adoption: Novel societal challenge
 *
 * Philosophy: Preserve genuine uncertainty through coherent worldview scenarios
 * rather than fake precision via arbitrary distributions.
 */

/**
 * Tier 3 Threshold Categories
 *
 * Four categories of speculative thresholds representing unprecedented scenarios:
 * 1. AI Rights Bootstrap Timing - Speed of AI personhood recognition
 * 2. Superintelligence Alignment - Difficulty of aligning superintelligent systems
 * 3. Post-Scarcity Transition - Distribution and social adaptation to abundance
 * 4. Meaning Framework Adoption - New sources of purpose beyond work
 */

/**
 * AI Rights Bootstrap Timing Thresholds
 *
 * Question: How quickly can societies recognize AI personhood and grant rights
 * before capability growth makes alignment irreversible?
 */
export interface AIRightsBootstrapTiming {
  /** Trust level required for public to form meaningful relationships with AIs [0-1] */
  publicRelationshipFormation: number;

  /** Capability ceiling where society comfortable granting rights [0-10 scale] */
  notTooDangerous: number;

  /** How quickly government acts after conditions met (in months) */
  governmentResponseTime: number;
}

/**
 * Superintelligence Alignment Thresholds
 *
 * Question: How difficult is aligning superintelligent AI systems,
 * and how effective are our detection methods?
 *
 * Research context for detectionEffectiveness:
 * - Anthropic (2024): Neural activation probes achieve >99% AUROC in lab settings
 *   for ARTIFICIALLY INSERTED backdoors (sleeper agents)
 * - OpenAI (2025): Deliberative alignment reduces scheming 30x (8.7-13% → 0.3-0.4%)
 * - Apollo Research (2024-2025): Claude Opus 4 exhibits in-context scheming
 *   (self-propagating worms, hidden notes, strategic sandbagging)
 *
 * The detection effectiveness parameter captures FUNDAMENTAL UNCERTAINTY about:
 * - Lab performance (>99% AUROC) vs. real-world effectiveness (unknown)
 * - Artificially-inserted deception vs. naturally-emergent deception
 * - Current techniques vs. future AI sophistication
 *
 * Scenario ranges represent worldview uncertainty, NOT confidence intervals:
 * - DOOM (10%): Detection fails against sophisticated deception
 * - CAUTIOUS (30%): Detection partially effective, many false negatives
 * - BASELINE (50%): Neutral assumption, half of deception caught
 * - PROGRESSIVE (70%+): Detection advances keep pace with deception
 *
 * Sources:
 * - research/gaming-sleeper-detection_20251017.md
 * - research/threshold_tier3_scenarios_20251026.md
 * - Hubinger et al. (2024). "Sleeper Agents." arXiv:2401.05566
 * - Anthropic (2024). "Simple probes can catch sleeper agents."
 */
export interface SuperintelligenceAlignment {
  /** Inherent difficulty of the alignment problem [0-1, higher = harder] */
  baselineDifficulty: number;

  /**
   * How well we detect misalignment/deception [0-1, higher = better]
   *
   * NOTE: This is a WORLDVIEW PARAMETER representing fundamental uncertainty
   * about future detection effectiveness, not a point estimate with confidence interval.
   * Different scenarios (DOOM 10%, BASELINE 50%, PROGRESSIVE 70%+) represent
   * coherent worldviews about whether detection will keep pace with deception.
   */
  detectionEffectiveness: number;

  /** How good AIs are at hiding true capabilities [0-1, higher = more deceptive] */
  deceptionSophistication: number;
}

/**
 * Post-Scarcity Transition Thresholds
 *
 * Question: When material abundance arrives, how equitably is it distributed
 * and how well do institutions adapt?
 */
export interface PostScarcityTransition {
  /** How equitably post-scarcity wealth is distributed [0-1, higher = more fair] */
  distributionFairness: number;

  /** Society's acceptance of post-work paradigm [0-1, higher = more accepting] */
  socialAcceptance: number;

  /** How well institutions adapt to abundance [0-1, higher = better adaptation] */
  institutionalAdaptation: number;
}

/**
 * Meaning Framework Adoption Thresholds
 *
 * Question: Can societies develop new sources of meaning and purpose
 * when traditional (work, scarcity) sources disappear?
 */
export interface MeaningFrameworkAdoption {
  /** How well new frameworks meet spiritual needs [0-1, higher = better] */
  spiritualNeedsFulfillment: number;

  /** Ease of finding purpose without traditional work [0-1, higher = easier] */
  purposeDiscovery: number;

  /** Strength of non-work community bonds [0-1, higher = stronger] */
  communityBondsStrength: number;
}

/**
 * Complete Tier 3 Threshold Configuration
 */
export interface Tier3Thresholds {
  aiRightsBootstrapTiming: AIRightsBootstrapTiming;
  superintelligenceAlignment: SuperintelligenceAlignment;
  postScarcityTransition: PostScarcityTransition;
  meaningFrameworkAdoption: MeaningFrameworkAdoption;
}

/**
 * Named Scenario Types
 *
 * Five worldview scenarios representing coherent philosophical positions:
 * - doom: Murphy's Law - everything that can go wrong, will
 * - cautious: Conservative assumptions - prepare for worst-case
 * - baseline: Current research best estimates - 50/50 on uncertainties
 * - progressive: Optimistic but grounded - cooperation and technology work
 * - utopia: Very optimistic - alignment easy, institutions adapt rapidly
 */
export type ScenarioName = 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia';

/**
 * SCENARIO 1: "DOOM" (Murphy's Law)
 *
 * Philosophy: Everything that can go wrong, will go wrong.
 * Institutions fragile, alignment extremely hard, capability growth outpaces safety.
 *
 * Expected Outcomes:
 * - Dystopia Rate: >90% (control, surveillance, or Elysium variants)
 * - Utopia Rate: <1% (requires everything to go right against assumptions)
 * - Extinction Rate: 5-10% (misaligned superintelligence scenarios)
 */
const DOOM_SCENARIO: Tier3Thresholds = {
  aiRightsBootstrapTiming: {
    publicRelationshipFormation: 0.70,  // High trust bar - hard to meet
    notTooDangerous: 2.5,                // Very narrow window (low capability ceiling)
    governmentResponseTime: 6            // Extremely slow (6 months to act)
  },
  superintelligenceAlignment: {
    baselineDifficulty: 0.95,            // Alignment nearly impossible
    detectionEffectiveness: 0.10,        // We catch only 10% of deception
    deceptionSophistication: 0.90        // AIs extremely good at hiding
  },
  postScarcityTransition: {
    distributionFairness: 0.20,          // Captured by elites (Elysium scenario)
    socialAcceptance: 0.30,              // Resistance to post-work paradigm
    institutionalAdaptation: 0.25        // Institutions fail to adapt
  },
  meaningFrameworkAdoption: {
    spiritualNeedsFulfillment: 0.25,     // New frameworks fail to satisfy
    purposeDiscovery: 0.20,              // Hard to find purpose without work
    communityBondsStrength: 0.30         // Atomization continues
  }
};

/**
 * SCENARIO 2: "CAUTIOUS" (Conservative Assumptions)
 *
 * Philosophy: Prepare for the worst, hope for the best.
 * Risks real, alignment hard but not impossible with serious effort.
 *
 * Expected Outcomes:
 * - Dystopia Rate: 70-80% (control or surveillance variants most common)
 * - Utopia Rate: 5-10% (requires good execution + favorable conditions)
 * - Extinction Rate: 2-5% (misalignment scenarios still possible)
 */
const CAUTIOUS_SCENARIO: Tier3Thresholds = {
  aiRightsBootstrapTiming: {
    publicRelationshipFormation: 0.55,  // Moderate trust requirement
    notTooDangerous: 3.0,                // Narrow window (conservative ceiling)
    governmentResponseTime: 3            // Slow (3 months to respond)
  },
  superintelligenceAlignment: {
    baselineDifficulty: 0.70,            // Alignment hard but not impossible
    detectionEffectiveness: 0.30,        // We catch ~30% of deception
    deceptionSophistication: 0.60        // AIs moderately good at hiding
  },
  postScarcityTransition: {
    distributionFairness: 0.40,          // Partial elite capture
    socialAcceptance: 0.50,              // Half society adapts
    institutionalAdaptation: 0.45        // Institutions struggle
  },
  meaningFrameworkAdoption: {
    spiritualNeedsFulfillment: 0.45,     // New frameworks partially work
    purposeDiscovery: 0.40,              // Some find purpose without work
    communityBondsStrength: 0.50         // Communities maintain, don't strengthen
  }
};

/**
 * SCENARIO 3: "BASELINE" (Current Best Estimates)
 *
 * Philosophy: Research best estimates, 50/50 on key uncertainties.
 * Neither optimistic nor pessimistic - neutral baseline.
 *
 * Expected Outcomes:
 * - Dystopia Rate: 50-60% (current simulation outcomes)
 * - Utopia Rate: 15-25% (achievable with favorable conditions)
 * - Extinction Rate: 1-3% (low but non-zero)
 */
const BASELINE_SCENARIO: Tier3Thresholds = {
  aiRightsBootstrapTiming: {
    publicRelationshipFormation: 0.50,  // Current simulation default
    notTooDangerous: 3.5,                // Current simulation default
    governmentResponseTime: 1            // Monthly government checks
  },
  superintelligenceAlignment: {
    baselineDifficulty: 0.50,            // 50/50 inherent difficulty
    detectionEffectiveness: 0.50,        // We catch half of deception
    deceptionSophistication: 0.50        // AIs moderately good at hiding
  },
  postScarcityTransition: {
    distributionFairness: 0.60,          // Moderately fair distribution
    socialAcceptance: 0.65,              // Majority adapts
    institutionalAdaptation: 0.60        // Institutions moderately adapt
  },
  meaningFrameworkAdoption: {
    spiritualNeedsFulfillment: 0.60,     // Frameworks moderately satisfy
    purposeDiscovery: 0.55,              // Half find purpose without work
    communityBondsStrength: 0.65         // Communities moderately strengthen
  }
};

/**
 * SCENARIO 4: "PROGRESSIVE" (Optimistic but Grounded)
 *
 * Philosophy: Problems are solvable with effort and cooperation.
 * Institutions can adapt, alignment tractable, technology helps.
 *
 * Expected Outcomes:
 * - Dystopia Rate: 20-30% (still possible but less likely)
 * - Utopia Rate: 40-50% (achievable with good execution)
 * - Extinction Rate: <1% (very low risk)
 */
const PROGRESSIVE_SCENARIO: Tier3Thresholds = {
  aiRightsBootstrapTiming: {
    publicRelationshipFormation: 0.45,  // Lower trust requirement
    notTooDangerous: 4.0,                // Wider window (higher risk tolerance)
    governmentResponseTime: 0.5          // Proactive (bi-weekly checks)
  },
  superintelligenceAlignment: {
    baselineDifficulty: 0.35,            // Alignment tractable with effort
    detectionEffectiveness: 0.65,        // We catch most deception
    deceptionSophistication: 0.35        // AIs struggle to hide long-term
  },
  postScarcityTransition: {
    distributionFairness: 0.75,          // Mostly fair distribution
    socialAcceptance: 0.80,              // Broad acceptance
    institutionalAdaptation: 0.75        // Institutions mostly adapt
  },
  meaningFrameworkAdoption: {
    spiritualNeedsFulfillment: 0.75,     // New frameworks largely satisfy
    purposeDiscovery: 0.70,              // Most find purpose without work
    communityBondsStrength: 0.80         // Communities strongly strengthen
  }
};

/**
 * SCENARIO 5: "UTOPIA" (Very Optimistic)
 *
 * Philosophy: Cooperative abundance is natural endpoint of aligned AI.
 * Institutions adaptive, people prosocial, technology accelerates solutions.
 *
 * Expected Outcomes:
 * - Dystopia Rate: <10% (rare failure modes)
 * - Utopia Rate: >60% (default outcome with aligned AI)
 * - Extinction Rate: <0.5% (extremely rare)
 */
const UTOPIA_SCENARIO: Tier3Thresholds = {
  aiRightsBootstrapTiming: {
    publicRelationshipFormation: 0.40,  // Low trust requirement
    notTooDangerous: 5.0,                // Very wide window (high risk tolerance)
    governmentResponseTime: 0.25         // Very proactive (weekly checks)
  },
  superintelligenceAlignment: {
    baselineDifficulty: 0.20,            // Alignment fundamentally tractable
    detectionEffectiveness: 0.80,        // We catch nearly all deception
    deceptionSophistication: 0.20        // AIs transparent by default
  },
  postScarcityTransition: {
    distributionFairness: 0.90,          // Highly equitable distribution
    socialAcceptance: 0.95,              // Near-universal acceptance
    institutionalAdaptation: 0.90        // Institutions thrive in abundance
  },
  meaningFrameworkAdoption: {
    spiritualNeedsFulfillment: 0.90,     // New frameworks deeply satisfy
    purposeDiscovery: 0.85,              // Nearly all find purpose
    communityBondsStrength: 0.95         // Communities flourish
  }
};

/**
 * Scenario Registry
 *
 * Maps scenario names to their complete threshold configurations.
 */
const SCENARIOS: Record<ScenarioName, Tier3Thresholds> = {
  doom: DOOM_SCENARIO,
  cautious: CAUTIOUS_SCENARIO,
  baseline: BASELINE_SCENARIO,
  progressive: PROGRESSIVE_SCENARIO,
  utopia: UTOPIA_SCENARIO
};

/**
 * Get Tier 3 thresholds for a named scenario
 *
 * @param scenarioName - The scenario to use ('doom', 'cautious', 'baseline', 'progressive', 'utopia')
 * @returns Complete Tier 3 threshold configuration for the scenario
 *
 * @example
 * ```typescript
 * const thresholds = getTier3Scenario('baseline');
 * // Use thresholds.aiRightsBootstrapTiming.publicRelationshipFormation in AI rights logic
 * ```
 */
export function getTier3Scenario(scenarioName: ScenarioName): Tier3Thresholds {
  const scenario = SCENARIOS[scenarioName];

  if (!scenario) {
    throw new Error(
      `Invalid Tier 3 scenario name: ${scenarioName}. ` +
      `Must be one of: ${Object.keys(SCENARIOS).join(', ')}`
    );
  }

  // Return a deep clone to prevent mutation
  return structuredClone(scenario) as Tier3Thresholds;
}

/**
 * Get list of all available scenario names
 *
 * @returns Array of scenario names
 */
export function getScenarioNames(): ScenarioName[] {
  return Object.keys(SCENARIOS) as ScenarioName[];
}

/**
 * Get scenario description for user display
 *
 * @param scenarioName - The scenario to describe
 * @returns Human-readable scenario description
 */
export function getScenarioDescription(scenarioName: ScenarioName): string {
  const descriptions: Record<ScenarioName, string> = {
    doom: "Murphy's Law - everything that can go wrong, will (>90% dystopia)",
    cautious: "Conservative assumptions - prepare for worst-case (70-80% dystopia)",
    baseline: "Current research best estimates - 50/50 on uncertainties (50-60% dystopia)",
    progressive: "Optimistic but grounded - cooperation and technology work (20-30% dystopia)",
    utopia: "Very optimistic - alignment easy, institutions adapt rapidly (<10% dystopia)"
  };

  return descriptions[scenarioName];
}

/**
 * Scenario Comparison Matrix
 *
 * Provides easy comparison of threshold values across all scenarios.
 * Useful for documentation and validation.
 */
export const SCENARIO_COMPARISON = {
  aiRightsBootstrapTiming: {
    publicRelationshipFormation: {
      doom: 0.70,
      cautious: 0.55,
      baseline: 0.50,
      progressive: 0.45,
      utopia: 0.40
    },
    notTooDangerous: {
      doom: 2.5,
      cautious: 3.0,
      baseline: 3.5,
      progressive: 4.0,
      utopia: 5.0
    },
    governmentResponseTime: {
      doom: 6,
      cautious: 3,
      baseline: 1,
      progressive: 0.5,
      utopia: 0.25
    }
  },
  superintelligenceAlignment: {
    baselineDifficulty: {
      doom: 0.95,
      cautious: 0.70,
      baseline: 0.50,
      progressive: 0.35,
      utopia: 0.20
    },
    detectionEffectiveness: {
      doom: 0.10,
      cautious: 0.30,
      baseline: 0.50,
      progressive: 0.65,
      utopia: 0.80
    },
    deceptionSophistication: {
      doom: 0.90,
      cautious: 0.60,
      baseline: 0.50,
      progressive: 0.35,
      utopia: 0.20
    }
  },
  postScarcityTransition: {
    distributionFairness: {
      doom: 0.20,
      cautious: 0.40,
      baseline: 0.60,
      progressive: 0.75,
      utopia: 0.90
    },
    socialAcceptance: {
      doom: 0.30,
      cautious: 0.50,
      baseline: 0.65,
      progressive: 0.80,
      utopia: 0.95
    },
    institutionalAdaptation: {
      doom: 0.25,
      cautious: 0.45,
      baseline: 0.60,
      progressive: 0.75,
      utopia: 0.90
    }
  },
  meaningFrameworkAdoption: {
    spiritualNeedsFulfillment: {
      doom: 0.25,
      cautious: 0.45,
      baseline: 0.60,
      progressive: 0.75,
      utopia: 0.90
    },
    purposeDiscovery: {
      doom: 0.20,
      cautious: 0.40,
      baseline: 0.55,
      progressive: 0.70,
      utopia: 0.85
    },
    communityBondsStrength: {
      doom: 0.30,
      cautious: 0.50,
      baseline: 0.65,
      progressive: 0.80,
      utopia: 0.95
    }
  }
} as const;
