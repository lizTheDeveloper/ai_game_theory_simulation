/**
 * Transition Management System (Phase 2: AI Coordination & Transition Mortality)
 *
 * Models AI-coordinated technology deployment with support systems to minimize
 * mortality during rapid technological transitions.
 *
 * Research backing:
 * - Chaos deployment (instant, no coordination): 20-40% mortality
 *   - Great Leap Forward: ~5% population loss (30M+ deaths)
 *   - USSR collectivization: 12M deaths
 *   - God mode empirical finding: 30% mortality
 * - Uncoordinated deployment (market-driven, weak institutions): 10-25% mortality
 *   - Post-Soviet Russia: +74% death rate (1990-1994)
 * - Coordinated deployment (AI-managed, full support): <5% mortality
 *   - Green Revolution: -33% infant mortality, 3M lives saved/year by 2000
 *   - Kenya UBI study (2025): -48% infant mortality
 *
 * Support system effectiveness (empirical):
 * - Cash transfers/UBI: -48% mortality (Kenya 2025 RCT, NBER WP 34152)
 * - Labor market support: -40% unemployment (Germany Kurzarbeit 2008, OECD)
 * - Food security: -33% to -38% infant mortality (Green Revolution, PMC/NIH)
 * - Healthcare expansion: -20% to -30% long-term (UK NHS post-war)
 *
 * Safe deployment threshold: ≤5% workforce displaced per year
 * - Historical transitions: 40 years (gradual, successful)
 * - Compressed transitions: <10 years (approaches human adaptation limits)
 * - Shock therapy: <5 years (catastrophic - post-Soviet precedent)
 *
 * @see research/ai_coordination_transition_mortality_20251118.md (9,000+ words, 24+ sources, Grade A-)
 * @see plans/phase2_ai_coordination_implementation_spec.md
 */

/**
 * Deployment mode classification
 *
 * Determines base mortality rate before support system adjustments
 */
export type DeploymentMode = 'chaos' | 'uncoordinated' | 'coordinated';

/**
 * Support system coverage metrics
 *
 * Each system has empirically validated mortality reduction
 * Effects are multiplicative, not additive (diminishing returns)
 */
export interface SupportSystemCoverage {
  /** [0-1] Universal basic income or cash transfer coverage
   * Kenya 2025 RCT: -48% infant mortality with $1000 transfer
   */
  ubiCoverage: number;

  /** [0-1] Workforce retraining program access
   * Germany Kurzarbeit 2008: -40% unemployment, 500k jobs saved
   */
  retrainingProgramsCoverage: number;

  /** [0-1] Food security and distribution system strength
   * Green Revolution: -35% infant mortality average across 37 countries
   */
  foodSecurityIndex: number;

  /** [0-1] Universal healthcare access
   * UK NHS post-war: ~25% long-term mortality reduction (conservative)
   */
  universalHealthcareCoverage: number;
}

/**
 * Regional capacity assessment
 *
 * Deployment readiness varies by institutional quality
 * Post-Soviet divergence: Russia (weak) vs Poland/Czech (strong) = 100% mortality difference by 2000
 */
export interface RegionalCapacity {
  /** [0-1] Governance effectiveness (World Bank index) */
  governanceEffectiveness: number;

  /** [0-1] Physical infrastructure quality (grid, logistics, communications) */
  infrastructureQuality: number;

  /** [0-1] Economic resilience (GDP/capita, reserves, diversification) */
  economicResilience: number;

  /** Weighted average readiness score [0-1] */
  aggregateReadiness: number;
}

/**
 * Regional heterogeneity tracking
 *
 * Technology transitions affect regions differently based on institutional capacity
 */
export interface RegionalReadiness {
  /** High-income, strong institutions (15% of population) */
  OECD: number;

  /** Medium institutions (50% of population) */
  middleIncome: number;

  /** Weak institutions, vulnerable populations (35% of population) */
  lowIncome: number;
}

/**
 * Transition Management System
 *
 * Tracks AI-coordinated technology deployment with support systems
 * to minimize mortality during rapid technological transitions
 */
export interface TransitionManagementSystem {
  // === COORDINATION QUALITY ===

  /** [0-1] AI's ability to coordinate deployment across systems
   * 0.0 = chaos (instant deployment, no coordination)
   * 0.5 = weak coordination (market-driven, limited oversight)
   * 1.0 = perfect coordination (optimal pacing, full support activation)
   */
  aiCoordinationCapability: number;

  /** [0-1] Institutional quality for policy execution (World Bank governance index) */
  governanceEffectiveness: number;

  /** [0-1] Physical infrastructure readiness (grid stability, logistics) */
  infrastructureQuality: number;

  /** [0-1] Overall coordination quality (weighted combination of above)
   * Determines base mortality tier:
   * - <0.3: Chaos (30% base mortality)
   * - 0.3-0.6: Uncoordinated (15% base mortality)
   * - >0.6: Coordinated (3% base mortality)
   */
  coordinationQuality: number;

  // === SUPPORT SYSTEMS ===

  /** Support system coverage metrics (see SupportSystemCoverage) */
  supportSystems: SupportSystemCoverage;

  /** [0-1] Combined support system effectiveness (diminishing returns)
   * Used to reduce base mortality: adjusted = base * (1 - effectiveness)
   */
  supportSystemEffectiveness: number;

  // === DEPLOYMENT PACING ===

  /** [0-1] Annual workforce displacement rate (% per year)
   * Safe threshold: ≤0.05 (5% per year)
   * Risky: 0.10-0.15 (10-15% per year)
   * Crisis: >0.20 (>20% per year - exceeds adaptation capacity)
   */
  workforceDisplacementRate: number;

  /** Safe deployment threshold (default: 0.05 = 5%/year) */
  maxSafeDeploymentSpeed: number;

  /** Number of breakthrough technologies deployed in last 12 months */
  recentDeploymentsCount: number;

  // === COORDINATION FAILURES (Nov 21, 2025) ===

  /** Count of coordination failures that have occurred */
  coordinationFailures: number;

  /** Whether a coordination failure is currently active */
  coordinationFailureActive: boolean;

  /** Mortality multiplier when coordination failure is active (2-5x) */
  coordinationFailureMultiplier: number;

  /** Month when last coordination failure occurred (for cooldown tracking) */
  coordinationFailureMonth: number;

  // === REBOUND EFFECTS (Nov 21, 2025) ===

  /** Technology effectiveness decay due to Jevons paradox [0-1] */
  reboundEffectiveness: number;

  /** Annual decay rate for rebound effectiveness (7.5% per year) */
  reboundDecayRate: number;

  // === REGIONAL HETEROGENEITY ===

  /** Regional readiness by income/institutional tier */
  regionalReadiness: RegionalReadiness;

  /** Current regional capacity assessment */
  regionalCapacity: RegionalCapacity;

  // === MORTALITY OUTCOMES ===

  /** Cumulative % population lost to transition effects (all time) */
  transitionMortality: number;

  /** Current month's mortality rate [0-1] */
  mortalityThisMonth: number;

  /** Base mortality rate before support system adjustments [0-1] */
  baseMortalityRate: number;

  /** Deployment mode classification (determines base mortality) */
  deploymentMode: DeploymentMode;

  // === TRACKING & HISTORY ===

  /** Month when coordinated deployment began (0 = not started) */
  deploymentStartMonth: number;

  /** Total months of active deployment */
  monthsOfActiveDeployment: number;

  /** Peak deployment speed observed [0-1] */
  peakDeploymentSpeed: number;

  /** Month when peak deployment speed occurred */
  peakDeploymentSpeedMonth: number;
}

/**
 * Empirical mortality baselines by deployment scenario
 *
 * These values are research-backed from historical precedents
 */
export const MORTALITY_BASELINES: Record<DeploymentMode, number> = {
  chaos: 0.30,           // 30% - Great Leap Forward, USSR collectivization, god mode
  uncoordinated: 0.15,   // 15% - Post-Soviet Russia (+74% death rate)
  coordinated: 0.03      // 3% - Green Revolution analogue (with partial support)
};

/**
 * Support system mortality reduction effectiveness
 *
 * These are multiplicative reductions (not additive)
 * Example: All 4 active = 0.30 * 0.52 * 0.60 * 0.65 * 0.75 = 0.027 (2.7% mortality)
 */
export const SUPPORT_EFFECTIVENESS: Record<keyof SupportSystemCoverage, number> = {
  ubiCoverage: 0.48,                    // Kenya 2025: -48% infant mortality
  retrainingProgramsCoverage: 0.40,     // Germany Kurzarbeit: -40% unemployment
  foodSecurityIndex: 0.35,              // Green Revolution: -35% infant mortality
  universalHealthcareCoverage: 0.25     // UK NHS: -25% long-term (conservative)
};

/**
 * Safe deployment speed threshold
 *
 * Based on historical transition timescales:
 * - Agricultural→Industrial: 40 years (safe, gradual adaptation)
 * - Post-Soviet shock therapy: <5 years (catastrophic)
 * - Recommended: ≤5% workforce displaced per year
 */
export const MAX_SAFE_DEPLOYMENT_SPEED = 0.05; // 5% workforce per year
