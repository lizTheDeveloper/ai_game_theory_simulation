/**
 * Type Definitions for AI-Assisted Skills System
 *
 * Extracted from bionicSkills.ts as part of architectural refactoring (Oct 17, 2025).
 * All types are research-backed (TRL 8-9) with peer-reviewed foundations.
 *
 * @see /reviews/architecture-refactoring-plan_20251017.md Section 2
 */

/**
 * Global barriers to AI-assisted skill enhancement
 *
 * **TRL: 9** (Barriers are empirically documented in current deployment)
 *
 * Tracks systemic barriers that affect adoption even when access exists.
 * Distinguishes between CAN access (infrastructure) vs DO adopt (barriers).
 *
 * @see Microsoft Research (2024) - "Emerging AI Divide" - Documents adoption gaps
 * @see OECD (2024) - "AI Equity in Education" - Financial and infrastructure barriers
 * @see Bentley et al. (2024) - "Digital divide in action" - Path dependency effects
 */
export interface AIAccessBarriers {
  economicBarrier: number;      // [0,1] Cost prevents access (subscriptions, devices)
  geographicBarrier: number;    // [0,1] Infrastructure gaps (rural broadband, latency)
  educationBarrier: number;     // [0,1] Digital literacy requirements
  culturalBarrier: number;      // [0,1] Cultural resistance to AI tools
  regulatoryBarrier: number;    // [0,1] Government restrictions on AI use
}

/**
 * Phase of automation economics (Acemoglu & Restrepo 2022)
 *
 * **TRL: 9** (Validated by 40+ years of historical automation data)
 *
 * As AI capability grows, its relationship to human labor shifts:
 * - **Complementarity:** AI makes workers more productive (GitHub Copilot, ChatGPT now)
 * - **Transition:** AI approaching task complexity, benefits declining (next 5-10 years)
 * - **Substitution:** AI exceeds task complexity, replaces workers (10-20 years)
 *
 * @see Acemoglu & Restrepo (2022) - "Tasks, Automation, and Wage Inequality"
 *      Econometrica 90(5), pp. 1973-2016. Analysis of 40+ years of US automation.
 *      Finding: 50-70% of wage structure changes from automation displacing middle-skill jobs.
 *      Mechanism: Technology shifts from complementing to substituting as capability exceeds task complexity.
 */
export type AutomationPhase = 'complementarity' | 'transition' | 'substitution';

/**
 * Labor-capital distribution and productivity-wage decoupling
 *
 * **TRL: 9** (50+ years of US labor economics data, 1948-2024)
 *
 * Tracks the divergence between productivity growth (from AI) and wage growth.
 * Without policy intervention, capital captures 70%+ of productivity gains.
 *
 * **Historical Pattern:**
 * - 1948-1973 (strong unions): 96.7% productivity, 91.3% wages (5.4pp gap)
 * - 1973-2024 (weak unions): 77.5% productivity, 12.4% wages (65.1pp gap)
 *
 * @see Brookings Institution (2024) - "AI and the Labor Market"
 * @see Economic Policy Institute (2024) - "The Productivity-Pay Gap"
 * @see Acemoglu & Restrepo (2018) - "Automation and New Tasks"
 */
export interface LaborCapitalDistribution {
  // Current distribution
  laborShare: number;              // [0,1] Fraction of GDP going to labor
  capitalShare: number;            // [0,1] Fraction going to capital (1 - laborShare)

  // Historical baseline
  baselineLaborShare: number;      // Starting value (0.62 for US 2024)

  // Productivity tracking
  baselineProductivity: number;    // Productivity at start (1.0)
  currentProductivity: number;     // Current productivity multiplier
  productivityGrowth: number;      // % change from baseline

  // Wage tracking
  baselineWages: number;           // Per-capita wages at start
  currentWages: number;            // Current per-capita wages
  wageGrowth: number;              // % change from baseline

  // The Gap (productivity-wage decoupling)
  productivityWageGap: number;     // productivityGrowth - wageGrowth

  // Distribution of productivity gains
  gainsToCapital: number;          // [0,1] Fraction of gains captured by capital
  gainsToLabor: number;            // [0,1] Fraction captured by labor (1 - gainsToCapital)

  // Policy levers (affect gainsToLabor)
  unionStrength: number;           // [0,1] Union density/power
  minimumWageLevel: number;        // [0,1] Relative to living wage
  workerOwnershipShare: number;    // [0,1] Fraction of firms worker-owned
}

/**
 * Aggregate metrics for AI-assisted skill enhancement across population
 *
 * **TRL: 9** (Metrics derived from empirically validated segment-level tracking)
 *
 * Population-level summary statistics useful for:
 * - Upward spirals (Cognitive Spiral amplified by enhancement)
 * - Quality of Life calculations
 * - Social cohesion (inequality drives fragmentation)
 * - Economic productivity
 */
export interface AIAssistedSkillsMetrics {
  // Population-weighted averages
  overallEnhancementLevel: number;        // [0,1] Pop-weighted AI adoption
  overallProductivityMultiplier: number;  // [0.5,2.0] Pop-weighted productivity

  // Inequality measures
  enhancementInequality: number;          // [0,1] Gini coefficient of skill enhancement
  productivityGap: number;                // [1,10] Ratio of max/min segment productivity

  // Adoption distribution
  highlyEnhanced: number;                 // [0,1] Fraction with >70% enhancement
  moderatelyEnhanced: number;             // [0,1] Fraction with 30-70% enhancement
  baseline: number;                       // [0,1] Fraction with <30% enhancement

  // Phase 2: Phase Transition Distribution (Acemoglu & Restrepo 2022)
  phaseDistribution: {
    complementarity: number;              // [0,1] Fraction in complementarity phase (AI helps)
    transition: number;                   // [0,1] Fraction in transition phase (benefits declining)
    substitution: number;                 // [0,1] Fraction in substitution phase (AI replaces)
  };

  // Phase transition events (for logging major shifts)
  lastPhaseTransition?: {
    month: number;                        // When transition occurred
    segment: string;                      // Which segment transitioned
    fromPhase: AutomationPhase;           // Previous phase
    toPhase: AutomationPhase;             // New phase
    aiCapability: number;                 // AI capability at transition
    taskComplexity: number;               // Task complexity at transition
  };

  // Barriers (global)
  barriers: AIAccessBarriers;

  // Trajectory
  monthsSinceLastUpdate: number;
}

/**
 * Skill categories that AI can amplify
 * Based on IO psychology research on project failure and PIAAC assessment
 *
 * **Phase 3: Performance vs Competence Tracking**
 * - Performance: AI-boosted output (immediate productivity)
 * - Competence: True skill without AI (long-term capability)
 * - Gap: Performance - Competence (dependency measure)
 */
export interface SkillProfile {
  // Core literacy skills (PIAAC Level 0-5) - PERFORMANCE (AI-assisted)
  literacy: number;          // 0-1 (Reading, writing, communication)
  numeracy: number;          // 0-1 (Math, data analysis, SQL)
  problemSolving: number;    // 0-1 (Adaptive problem solving, debugging)

  // Professional skills (corporate/org success) - PERFORMANCE (AI-assisted)
  technicalWriting: number;  // 0-1 (Documentation, proposals, grants)
  interpersonal: number;     // 0-1 (Collaboration, conflict resolution)
  projectManagement: number; // 0-1 (Planning, execution, tracking)

  // Digital skills - PERFORMANCE (AI-assisted)
  softwareCompetency: number; // 0-1 (Using tools, learning new software)
  aiLiteracy: number;         // 0-1 (Knowing how to prompt/use AI effectively)

  // Aggregate: Overall effectiveness - PERFORMANCE (AI-assisted)
  overallEffectiveness: number; // 0-1 (Combined productivity)

  // Phase 3: COMPETENCE (true skill without AI)
  competence: {
    literacy: number;          // True skill without AI assistance
    numeracy: number;
    problemSolving: number;
    technicalWriting: number;
    interpersonal: number;
    projectManagement: number;
    softwareCompetency: number;
    aiLiteracy: number;
    overall: number;
  };

  // Phase 3: Performance-competence GAPS (dependency measure)
  gaps: {
    literacy: number;          // performance - competence
    numeracy: number;
    problemSolving: number;
    technicalWriting: number;
    interpersonal: number;
    projectManagement: number;
    softwareCompetency: number;
    aiLiteracy: number;
    overall: number;
  };

  // Phase 3: Retention factors (how much learning sticks)
  retention: {
    scaffoldingQuality: number;  // [0,1] Human teaching/mentorship quality
    aiRelianceLevel: number;     // [0,1] Fraction of work done by AI
    monthsOfUse: number;         // Time using AI tools
    retentionRate: number;       // [0,1] How much learning sticks (Frontiers Psychology 2024)
  };
}
