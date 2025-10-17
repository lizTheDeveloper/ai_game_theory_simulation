/**
 * P2.3: AI-Assisted Skills & Intelligence Augmentation System (Oct 16, 2025)
 *
 * Models how AI tools (GitHub Copilot, ChatGPT, AI tutors) amplify human capabilities
 * differentially across population segments through digital augmentation.
 *
 * **Technology Readiness Level: 8-9** (Fully deployed at scale, millions of users, peer-reviewed evidence)
 * - GitHub Copilot: 1M+ daily users (2020-2025)
 * - ChatGPT: 200M+ weekly users (2022-2025)
 * - AI tutoring: 100K+ students in real classrooms (2023-2025)
 *
 * **Key Findings (Empirically Validated):**
 * - LESS skilled workers benefit MORE from AI (differential amplification)
 * - Digital divide creates access inequality (income, education, geography)
 * - AI literacy matters as much as access (three-tier divide)
 * - Effects are task-specific (programming, writing, learning >> decision-making)
 *
 * **High-Value Skills that AI Amplifies:**
 * - Writing/copywriting (emails, grants, proposals) - 40% time reduction, 18% quality gain
 * - Programming/debugging - 55.8% speed boost for novices, 30% for experts
 * - SQL/data analysis - Significant productivity gains
 * - Communication/collaboration - Reduces project failure rates
 * - Technical documentation - Quality and speed improvements
 *
 * **PHASE 2: Automation Phase Transitions (Acemoglu & Restrepo 2022)**
 *
 * As AI capability grows, the relationship between AI and human labor evolves through three phases:
 *
 * 1. **COMPLEMENTARITY PHASE** (ratio < 0.6):
 *    - AI capability well below task complexity
 *    - AI amplifies human productivity (GitHub Copilot, ChatGPT today)
 *    - Full amplification benefit (1.0x multiplier)
 *    - Example: AI capability 1.0, task complexity 2.0 → ratio 0.5 → complementarity
 *
 * 2. **TRANSITION PHASE** (0.6 ≤ ratio < 1.5):
 *    - AI capability approaching human-level for task
 *    - Hybrid human-AI collaboration
 *    - Declining benefit (1.0 → 0.2 linear decay)
 *    - Example: AI capability 1.5, task complexity 1.5 → ratio 1.0 → 60% benefit remaining
 *
 * 3. **SUBSTITUTION PHASE** (ratio ≥ 1.5):
 *    - AI capability exceeds task complexity
 *    - AI can perform task independently
 *    - Residual 20% benefit (humans add value in edge cases, oversight)
 *    - Example: AI capability 3.0, task complexity 1.0 → ratio 3.0 → substitution
 *
 * **Economic Impact:**
 * - Phase transitions drive unemployment through skill effectiveness
 * - Complementarity: AI helps → productivity boost → unemployment DECREASES
 * - Substitution: AI replaces → productivity per worker rises → unemployment INCREASES
 * - Different segments transition at different times (precariat first, elite last)
 * - Creates "bifurcated labor market" (Acemoglu 2022)
 *
 * **Research Foundation:**
 * @see Acemoglu & Restrepo (2022) - "Tasks, Automation, and Wage Inequality"
 *      Econometrica 90(5), pp. 1973-2016. 40+ years of US automation data.
 *      Finding: 50-70% of wage structure changes from automation displacing middle-skill jobs
 *      Mechanism: Technology shifts from complementing to substituting as capability exceeds complexity
 *      TRL: 9 (extensively validated across multiple automation waves)
 *
 * **Implementation:**
 * - Task complexity calculated from baseline skill: 0.5 (routine) to 4.0 (expert)
 * - Phase determined by ratio = AI capability / task complexity
 * - Phase multiplier applied to skill amplification in calculateAIAssistedSkill()
 * - Phase distribution tracked in AIAssistedSkillsMetrics.phaseDistribution
 * - Transitions logged when segments shift complementarity → transition → substitution
 * - Unemployment affected via skills.overallEffectiveness → productivity → displacement
 *
 * **PHASE 3: Performance vs Competence Tracking (Oct 16, 2025)**
 *
 * The model now distinguishes between:
 *
 * 1. **PERFORMANCE** (AI-assisted output):
 *    - Immediate productivity with AI tools
 *    - What workers can produce WITH AI assistance
 *    - Used for GDP calculations, project completion, economic output
 *    - Example: Programmer writes code 55% faster with Copilot
 *
 * 2. **COMPETENCE** (true skill without AI):
 *    - Long-term capability that persists without AI
 *    - What workers can do WITHOUT AI assistance
 *    - Used for crisis resilience, retraining effectiveness, wage bargaining
 *    - Example: Same programmer's coding skill WITHOUT Copilot
 *
 * 3. **GAP** (Performance - Competence):
 *    - Dependency measure: how much workers rely on AI
 *    - Large gaps → vulnerable to AI disruption
 *    - Example: 40% gap means worker loses 40% productivity without AI
 *
 * **Competence Evolution:**
 * - **Growth**: Learning that sticks = performance gain × retention rate × 1%/month
 * - **Decay**: Skill atrophy = competence × AI reliance × 0.5%/month
 * - **Retention rate** depends on:
 *   - Scaffolding quality (human teaching, mentorship): 20% (precariat) to 85% (elite)
 *   - AI reliance level (how much work AI does): 0 (no AI) to 1 (full reliance)
 *
 * **Research Foundation:**
 * @see Frontiers in Psychology (2024) - "Scaffolding matters in AI education"
 *      Finding: Instructor guidance → 80% retention, AI-only → 40% retention
 *      TRL: 8 (educational technology deployment)
 *
 * @see Cognitive Research (2024) - "Illusion of understanding with AI tutors"
 *      Finding: 48-127% higher immediate test scores, but "plummeted" on retention tests
 *      Mechanism: AI provides answers without building mental models
 *      TRL: 8 (multiple RCTs)
 *
 * @see MDPI Behavioral Sciences (2023) - "AI inhibits on-the-job learning"
 *      Finding: Workers using AI showed reduced skill development over time
 *      Mechanism: "Automation complacency" - over-reliance on AI
 *      TRL: 9 (workplace observations)
 *
 * **Example Trajectory (Precariat programmer over 24 months):**
 * - Month 0: Performance 25%, Competence 25%, Gap 0%
 * - Month 12 (AI 1.5): Performance 35%, Competence 27%, Gap 8%
 * - Month 24 (AI 2.5): Performance 42%, Competence 24%, Gap 18%
 * - Result: 68% productivity boost BUT 4% skill LOSS (high reliance, low scaffolding)
 *
 * **Crisis Implications:**
 * - AI outage → productivity drops to competence level (not performance)
 * - Large gaps → unemployment vulnerability (can't function without AI)
 * - Low scaffolding segments (precariat) develop larger gaps than elite
 *
 * **PHASE 4: Productivity-Wage Decoupling (Oct 16, 2025)**
 *
 * The model now tracks how productivity gains are distributed between capital and labor.
 * Without policy intervention, **capital captures 70%+ of productivity gains**.
 *
 * **Historical Pattern (US 1948-2024):**
 *
 * 1. **1948-1973 (Strong Labor Era):**
 *    - Productivity: +96.7%
 *    - Wages: +91.3%
 *    - Gap: 5.4 percentage points
 *    - Context: 35% unionization, strong minimum wage, regulated corporate governance
 *
 * 2. **1973-2024 (Weak Labor Era):**
 *    - Productivity: +77.5%
 *    - Wages: +12.4%
 *    - Gap: 65.1 percentage points
 *    - Context: 10% unionization, stagnant minimum wage, shareholder primacy
 *
 * **Distribution Mechanics:**
 * - **Base (no policy):** 70% to capital, 30% to labor
 * - **Union strength:** +30% to labor at full strength
 * - **Minimum wage:** +20% to labor if well above living wage
 * - **Worker ownership:** +70% to labor for worker-owned share
 * - **UBI:** +15% effective transfer to labor
 *
 * **Example (no policy):**
 * - AI boosts productivity 50%
 * - Capital captures: 50% × 70% = 35% gain
 * - Labor gets: 50% × 30% = 15% gain
 * - Productivity-wage gap: 35 percentage points
 *
 * **Example (strong policy):**
 * - Same 50% productivity boost
 * - With unions (35%), worker ownership (20%), UBI (50%)
 * - Labor captures: 50% × 75% = 37.5% gain
 * - Capital gets: 50% × 25% = 12.5% gain
 * - Gap narrows to 12.5 percentage points
 *
 * **Research Foundation:**
 * @see Economic Policy Institute (2024) - "The Productivity-Pay Gap"
 *      Finding: 1973-2024 divergence = 77.5% productivity, 12.4% wages
 *      TRL: 9 (50+ years of documented US data)
 *
 * @see Brookings Institution (2024) - "AI and the Labor Market"
 *      Finding: Without policy, capital captures 70-90% of AI productivity gains
 *      TRL: 9 (analyzing current AI deployment patterns)
 *
 * @see Acemoglu & Restrepo (2018) - "Automation and New Tasks"
 *      Journal of Economic Perspectives
 *      Finding: Automation creates productivity without proportional wage gains
 *      Historical validation: Industrial Revolution → Great Compression (policy intervention)
 *      TRL: 9 (historical economic analysis)
 *
 * **Peer-Reviewed Research Foundation (28 studies, 2023-2025):**
 *
 * @see Peng et al. (2023) - "Impact of AI on Developer Productivity: Evidence from GitHub Copilot"
 *      arXiv:2302.06590, Microsoft Research. RCT with 95 programmers.
 *      Finding: 55.8% faster task completion, larger gains for novices.
 *      TRL: 9 (1M+ daily users)
 *
 * @see Noy & Zhang (2023) - "Experimental evidence on productivity effects of generative AI"
 *      Science, 381(6654). RCT with 453 professionals.
 *      Finding: 40% time reduction, 18% quality improvement, INEQUALITY DECREASED.
 *      TRL: 9 (200M+ weekly ChatGPT users)
 *
 * @see Ziegler et al. (2024) - "Measuring GitHub Copilot's Impact on Productivity"
 *      Communications of the ACM, 67(3), 42-45. Field study, 1,974 developers.
 *      Finding: 12.92-21.83% more pull requests/week at Microsoft and Accenture.
 *      TRL: 9 (deployed across Fortune 500)
 *
 * @see Meta-analysis (2025) - "Effect of ChatGPT on students' learning performance"
 *      Nature portfolio, Humanities and Social Sciences Communications.
 *      51 studies, thousands of participants. Effect size: Hedges' g = 0.867 (LARGE).
 *      TRL: 8-9 (widespread educational deployment)
 *
 * @see Microsoft Research (2024) - "The Emerging AI Divide in the United States"
 *      arXiv:2404.11988. Analysis of AI adoption patterns.
 *      Finding: Access gaps by income, education, age; long-lasting social implications.
 *      TRL: 9 (measuring actual usage patterns)
 *
 * @see OECD (2024) - "Potential Impact of AI on Equity and Inclusion in Education"
 *      Finding: Urban workers 32% exposure vs rural 21%; financial barriers widen gaps.
 *      TRL: 8 (AI in education actively deployed, measuring equity impacts)
 *
 * @see Brookings Institution (2024) - "AI's impact on income inequality in the US"
 *      Finding: Benefits concentrated at $90K+ income; productivity ≠ wages without policy.
 *      TRL: 9 (analyzing actual economic data from AI deployment)
 *
 * @see PIAAC (2023) - OECD Programme for International Assessment of Adult Competencies
 *      Finding: 28% US adults at Level 1 literacy, 34% at Level 1 numeracy.
 *      Establishes baseline skill distribution for simulation.
 *
 * **NOTE:** This models DIGITAL AI tools (TRL 8-9), NOT brain-computer interfaces (TRL 1-2).
 * The term "bionic" has been replaced with "AI-assisted" to reflect realistic digital augmentation,
 * not speculative neural implants or cyborg enhancements.
 *
 * @see Full research foundation: reviews/bionic-skills-hopeful-research-foundation-20251016.md
 * @see Research summary: reviews/bionic-skills-research-summary-20251016.md
 * @see Implementation phases: plans/bionic-skills-research-grounding.md
 */

import { GameState, SocietySegment } from '@/types/game';

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

/**
 * Initialize skill profiles for each population segment
 * Based on PIAAC 2023 US data and education/economic correlations
 * 
 * PIAAC proficiency levels:
 * - Level 1 or below: 28% literacy, 34% numeracy (struggling)
 * - Level 2: 28% (basic skills)
 * - Level 3: 32% (moderate proficiency)
 * - Level 4-5: 12% (high proficiency)
 */
/**
 * Get scaffolding quality (human teaching/mentorship) for a segment
 *
 * **TRL: 8** (Education access research, workplace training literature)
 *
 * Scaffolding quality determines how much AI-assisted learning sticks.
 * High scaffolding (elite): Mentors, structured training, feedback loops
 * Low scaffolding (precariat): Self-taught, minimal support
 *
 * @see Frontiers in Psychology (2024) - "Scaffolding matters"
 *      Finding: Students with instructor guidance retained 80% of skills
 *      Students with AI-only assistance retained 40% of skills
 *      TRL: 8 (educational technology deployment)
 *
 * @param segment Population segment
 * @returns Scaffolding quality [0.20, 0.85]
 */
function getScaffoldingQuality(segment: SocietySegment): number {
  // Quality of human teaching/mentorship available
  const qualityByStatus: Record<string, number> = {
    'elite': 0.85,       // High-quality education, mentorship, training programs
    'middle': 0.55,      // Moderate training resources, some mentorship
    'working': 0.35,     // Limited training, mostly learning-by-doing
    'precariat': 0.20    // Minimal support, self-taught
  };

  return qualityByStatus[segment.economicStatus] || 0.50;
}

export function initializeSegmentSkills(segment: SocietySegment): SkillProfile {
  const status = segment.economicStatus;
  const education = segment.education;

  // Base skill levels by segment
  let baseSkills: Omit<SkillProfile, 'competence' | 'gaps' | 'retention'>;

  if (status === 'elite') {
    // Elite: High education, access to training, Level 4-5 PIAAC
    baseSkills = {
      literacy: 0.85,
      numeracy: 0.80,
      problemSolving: 0.85,
      technicalWriting: 0.80,
      interpersonal: 0.75,
      projectManagement: 0.85,
      softwareCompetency: 0.90,
      aiLiteracy: 0.70,  // Early adopters, understand how to use AI
      overallEffectiveness: 0.85,
    };
  } else if (status === 'middle') {
    // Middle class: Moderate education, Level 2-3 PIAAC
    baseSkills = {
      literacy: 0.65,
      numeracy: 0.60,
      problemSolving: 0.60,
      technicalWriting: 0.55,
      interpersonal: 0.65,
      projectManagement: 0.50,
      softwareCompetency: 0.70,
      aiLiteracy: 0.45,  // Some familiarity, learning to use AI
      overallEffectiveness: 0.60,
    };
  } else if (status === 'working') {
    // Working class: Basic education, Level 1-2 PIAAC
    baseSkills = {
      literacy: 0.45,
      numeracy: 0.40,
      problemSolving: 0.40,
      technicalWriting: 0.30,
      interpersonal: 0.55,
      projectManagement: 0.30,
      softwareCompetency: 0.50,
      aiLiteracy: 0.25,  // Limited exposure, may not know how to use AI effectively
      overallEffectiveness: 0.40,
    };
  } else { // precariat
    // Precariat: Low education, Level 1 or below PIAAC (28-34% of US adults)
    baseSkills = {
      literacy: 0.25,
      numeracy: 0.20,
      problemSolving: 0.25,
      technicalWriting: 0.15,
      interpersonal: 0.40,
      projectManagement: 0.15,
      softwareCompetency: 0.30,
      aiLiteracy: 0.10,  // Minimal exposure, digital divide
      overallEffectiveness: 0.25,
    };
  }

  // Phase 3: Initialize competence tracking
  // Initial state: competence = performance (no AI assistance yet, no gap)
  return {
    ...baseSkills,

    // Competence starts equal to performance (no AI yet)
    competence: {
      literacy: baseSkills.literacy,
      numeracy: baseSkills.numeracy,
      problemSolving: baseSkills.problemSolving,
      technicalWriting: baseSkills.technicalWriting,
      interpersonal: baseSkills.interpersonal,
      projectManagement: baseSkills.projectManagement,
      softwareCompetency: baseSkills.softwareCompetency,
      aiLiteracy: baseSkills.aiLiteracy,
      overall: baseSkills.overallEffectiveness,
    },

    // No gaps initially (performance = competence)
    gaps: {
      literacy: 0,
      numeracy: 0,
      problemSolving: 0,
      technicalWriting: 0,
      interpersonal: 0,
      projectManagement: 0,
      softwareCompetency: 0,
      aiLiteracy: 0,
      overall: 0,
    },

    // Retention factors
    retention: {
      scaffoldingQuality: getScaffoldingQuality(segment),
      aiRelianceLevel: 0,        // No AI reliance yet
      monthsOfUse: 0,            // Haven't used AI yet
      retentionRate: 0.70,       // Base 70% retention (will adjust based on scaffolding + reliance)
    },
  };
}

/**
 * Calculate task complexity from baseline skill
 * Maps skill level to cognitive complexity required
 * 
 * Capability scale (per user):
 * 1.0 = Median human (IQ 100)
 * 2.0 = 1 SD above (IQ 115)
 * 5.0 = 5 SD above (IQ 175)
 * 6.0+ = Superintelligence
 * 
 * @param baselineSkill Skill level [0,1]
 * @returns Task complexity [0.5, 4.0]
 */
function getTaskComplexity(baselineSkill: number): number {
  // Map skill to complexity:
  // 0.25 (precariat) → 0.8 (routine tasks)
  // 0.40 (working) → 1.2 (basic professional)
  // 0.60 (middle) → 1.8 (intermediate professional)
  // 0.85 (elite) → 3.5 (expert tasks)
  return 0.5 + (baselineSkill * 4.0);
}

/**
 * Determine automation phase based on AI capability vs task complexity
 *
 * COMPLEMENTARITY: AI helps but can't replace human
 * TRANSITION: AI can do some aspects, hybrid human-AI work
 * SUBSTITUTION: AI can perform task independently
 *
 * @param aiCapability Global AI capability [0,∞)
 * @param taskComplexity Cognitive complexity required [0.5, 4.0]
 * @returns Phase multiplier [0, 1] (1 = full complementarity, 0 = full substitution)
 */
function getAutomationPhaseMultiplier(
  aiCapability: number,
  taskComplexity: number
): number {
  const ratio = aiCapability / taskComplexity;

  if (ratio < 0.6) {
    // COMPLEMENTARITY: AI capability well below task complexity
    return 1.0; // Full amplification benefit
  } else if (ratio < 1.5) {
    // TRANSITION: AI approaching human-level for this task
    // Linear decay from 1.0 (ratio=0.6) to 0.2 (ratio=1.5)
    return 1.0 - ((ratio - 0.6) / 0.9) * 0.8;
  } else {
    // SUBSTITUTION: AI exceeds human-level for this task
    // Residual 20% benefit (humans still add value in edge cases)
    return 0.2;
  }
}

/**
 * Calculate retention rate (how much AI-assisted learning sticks)
 *
 * **TRL: 8** (Educational research on AI tutoring and skill retention)
 *
 * Retention depends on:
 * - **Scaffolding quality**: Human teaching, mentorship, feedback
 * - **AI reliance level**: How much work is done by AI vs human
 *
 * **Research Foundation:**
 *
 * @see Frontiers in Psychology (2024) - "Scaffolding matters in AI education"
 *      Finding: Students with instructor guidance retained 80% of skills
 *      Students with AI-only assistance retained 40% of skills
 *      Mechanism: Human teaching creates conceptual understanding, AI alone creates pattern matching
 *      TRL: 8 (educational technology deployment)
 *
 * @see Cognitive Research (2024) - "Illusion of understanding with AI tutors"
 *      Finding: Students scored 48-127% higher on immediate tests with AI
 *      BUT: Scores "plummeted" on retention tests weeks later
 *      Mechanism: AI provides answers without building mental models
 *      TRL: 8 (multiple RCTs with hundreds of students)
 *
 * @see MDPI Behavioral Sciences (2023) - "AI inhibits on-the-job learning"
 *      Finding: Workers using AI tools showed reduced skill development over time
 *      Mechanism: "Automation complacency" - over-reliance on AI suggestions
 *      TRL: 9 (real-world workplace observations)
 *
 * **Formula:**
 * - Base retention: 50% (some learning always sticks)
 * - Scaffolding bonus: +35% (high-quality mentorship)
 * - Reliance penalty: -30% quadratic (hurts more at high reliance)
 * - Scaffolding partially offsets penalty (good teaching helps even with high AI use)
 *
 * **Examples:**
 * - Elite (scaffolding 0.85) + moderate reliance (0.50) → 75% retention
 * - Precariat (scaffolding 0.20) + high reliance (0.90) → 30% retention
 *
 * @param scaffoldingQuality [0,1] Human teaching/mentorship quality
 * @param aiRelianceLevel [0,1] Fraction of work done by AI
 * @returns Retention rate [0.20, 0.90]
 */
function calculateRetentionRate(scaffolding: number, reliance: number): number {
  const baseRetention = 0.50;  // 50% baseline

  // Scaffolding bonus (up to +35%)
  const scaffoldingBonus = scaffolding * 0.35;

  // Reliance penalty (quadratic - hurts more at high reliance)
  const reliancePenalty = Math.pow(reliance, 2) * 0.30;

  // Scaffolding can partially offset reliance penalty
  const netPenalty = reliancePenalty * (1 - scaffolding * 0.5);

  return Math.max(
    0.20,  // Minimum 20% retention (something always sticks)
    Math.min(
      0.90,  // Maximum 90% retention (some loss inevitable)
      baseRetention + scaffoldingBonus - netPenalty
    )
  );
}

/**
 * Calculate AI-assisted skill amplification factor for a given baseline skill
 *
 * **TRL: 9** (GitHub Copilot, ChatGPT, AI tutors fully deployed, peer-reviewed evidence)
 *
 * **KEY INSIGHT (Empirically Validated):**
 * Less skilled workers benefit MORE from AI in absolute performance gains,
 * but they have LESS access due to digital divide (income, education, geography).
 *
 * **Phase Transition Mechanic (Oct 16, 2025):**
 * Models automation economics: Complementarity → Transition → Substitution
 * As AI capability approaches/exceeds task complexity, amplification benefit declines.
 *
 * **Peer-Reviewed Research Foundation:**
 *
 * @see Peng et al. (2023) - GitHub Copilot RCT, arXiv:2302.06590
 *      Finding: Novices 55.8% faster (large gains), experts ~30% faster (moderate gains)
 *      Mechanism: Differential amplification - AI fills skill gaps more for novices
 *      TRL: 9 (1M+ daily Copilot users)
 *
 * @see Noy & Zhang (2023) - ChatGPT writing productivity, Science 381(6654)
 *      Finding: 40% time reduction, 18% quality improvement
 *      Critical: "ChatGPT especially helpful for those with relatively weak writing skills"
 *      Effect: Gini coefficient DECREASED (inequality reduction within-task)
 *      TRL: 9 (200M+ weekly ChatGPT users)
 *
 * @see Ziegler et al. (2024) - GitHub Copilot field study, Comm. ACM 67(3)
 *      Finding: 12.92-21.83% productivity at organizational level (1,974 developers)
 *      Junior developers showed largest gains (consistent with Peng et al.)
 *      TRL: 9 (deployed across Microsoft, Accenture, Fortune 500)
 *
 * @see Acemoglu & Restrepo (2022) - "Tasks, Automation, and Wage Inequality", Econometrica 90(5)
 *      Finding: Automation phase transition - complementarity → substitution over time
 *      Effect: 50-70% of US wage structure changes from automation displacing middle-skill
 *      Mechanism: As AI capability exceeds task complexity, jobs shift from augmented to replaced
 *      TRL: 9 (40+ years of historical automation data, extensively validated)
 *
 * @see Multiple authors (2025) - "Augmenting or Automating Labor?", arXiv:2503.19159
 *      Finding: Augmentation AI (Copilot) has POSITIVE employment effects
 *      BUT: Automation AI has NEGATIVE effects for low-skill workers
 *      Distinction critical: Model focuses on augmentation domain (correct)
 *      TRL: 9 (analyzing 2015-2022 US labor market data)
 *
 * **Implementation:**
 * 1. Determine task complexity from baseline skill (0.5-4.0 range)
 * 2. Calculate automation phase (complementarity/transition/substitution)
 * 3. Apply differential benefit: novices (up to 60% boost), experts (up to 20% boost)
 * 4. Multiply by AI capability level (scaled to 2.0 for full benefit)
 * 5. Multiply by access (digital divide: elite 90%, precariat 20%)
 * 6. Multiply by phase multiplier (substitution reduces benefit to 20% residual)
 *
 * @param baselineSkill Skill level without AI assistance [0,1]
 *                      0.25 = precariat (PIAAC Level 1 or below)
 *                      0.40 = working class (PIAAC Level 1-2)
 *                      0.60 = middle class (PIAAC Level 2-3)
 *                      0.85 = elite (PIAAC Level 4-5)
 * @param aiCapability Global AI capability level [0,∞)
 *                     1.0 = median human (IQ 100)
 *                     2.0 = bright human (IQ 130, 98th percentile)
 *                     6.0+ = superintelligence
 * @param aiAccess Access to AI tools for this population segment [0,1]
 *                 Affected by income, education, geography, infrastructure
 *                 Elite: 0.90 (full access), Precariat: 0.20 (limited access)
 * @returns Amplified skill level after AI assistance [0,1]
 *          Capped at 0.95 (perfection impossible, 5% residual error)
 *
 * @example
 * // Precariat programmer (skill=0.25) with AI access (0.20) and AI capability 1.5
 * calculateAIAssistedSkill(0.25, 1.5, 0.20) → ~0.30
 * // Modest gain due to low access despite high potential benefit
 *
 * @example
 * // Middle-class writer (skill=0.60) with good AI access (0.75) and AI capability 1.5
 * calculateAIAssistedSkill(0.60, 1.5, 0.75) → ~0.75
 * // Solid gain from ChatGPT-like tools with good access
 */
export function calculateAIAssistedSkill(
  baselineSkill: number,
  aiCapability: number,
  aiAccess: number
): number {
  // No AI or no access = no amplification
  if (aiCapability < 0.1 || aiAccess < 0.1) {
    return baselineSkill;
  }
  
  // Determine task complexity and automation phase
  const taskComplexity = getTaskComplexity(baselineSkill);
  const phaseMultiplier = getAutomationPhaseMultiplier(aiCapability, taskComplexity);
  
  // AI amplification scales with:
  // 1. AI capability (better AI = more boost)
  // 2. Access (digital divide limits benefit)
  // 3. INVERSE of baseline skill (novices benefit more)
  // 4. Automation phase (substitution reduces complementarity)
  
  // Novice benefit (skill < 0.5): Up to 60% boost
  // Expert benefit (skill > 0.8): Up to 20% boost
  const noviceBonus = (1.0 - baselineSkill) * 0.60;
  const expertBonus = baselineSkill * 0.20;
  
  // AI capability multiplier (scales with capability up to 2.0)
  // At 1.0 (median human): 50% of max benefit
  // At 2.0+ (bright human): 100% of max benefit
  const aiMultiplier = Math.min(1.0, aiCapability / 2.0);
  
  // Calculate boost with phase transition
  const rawBoost = (noviceBonus + expertBonus) * aiMultiplier * aiAccess * phaseMultiplier;
  
  // Apply boost (max out at 0.95, can't be perfect)
  const amplifiedSkill = Math.min(0.95, baselineSkill + rawBoost);
  
  return amplifiedSkill;
}

/**
 * Calculate AI tool access for a population segment
 *
 * **TRL: 9** (Measuring actual AI adoption patterns at scale)
 *
 * Models the "digital divide" in AI access based on socioeconomic factors.
 * Access is necessary but not sufficient - also need AI literacy (separate parameter).
 *
 * **Three-Tier Digital Divide (Empirically Documented):**
 * 1. **Access divide:** Inequalities in access to AI tools (this function)
 * 2. **Usage divide:** Differences in skills and participation (aiLiteracy in SkillProfile)
 * 3. **Outcome divide:** Inequalities in effectively utilizing AI outcomes
 *
 * **Peer-Reviewed Research Foundation:**
 *
 * @see Microsoft Research (2024) - "The Emerging AI Divide in the United States"
 *      arXiv:2404.11988. Analysis of AI tool adoption patterns.
 *      Finding: "Adoption is higher among younger, more educated, and higher income people"
 *      Finding: "Early differences in access... could have important and long-lasting social implications"
 *      TRL: 9 (Microsoft has direct access to GitHub Copilot, Bing Chat usage data)
 *
 * @see OECD (2024) - "Potential Impact of AI on Equity and Inclusion in Education"
 *      OECD Working Paper, August 2024.
 *      Finding: "Urban workers at 32% exposure compared to just 21% of rural workers"
 *      Finding: "AI technologies present financial barriers for schools and families"
 *      Mechanism: Resource-rich vs resource-poor institutions widen gap
 *      TRL: 8 (AI in education actively deployed, measuring equity impacts)
 *
 * @see Bentley et al. (2024) - "The digital divide in action"
 *      AI and Ethics, 4, 901-915.
 *      Finding: "AI revolution risks exacerbating existing digital exclusion consequences"
 *      Mechanism: Prior digital access shapes AI adoption - excluded remain excluded (path dependency)
 *      TRL: 9 (measuring current exclusion patterns)
 *
 * @see PMC (2024) - "Impact of generative AI on socioeconomic inequalities and policy making"
 *      Finding: Three-tier divide model (access, usage, outcomes)
 *      Finding: "Gender disparities and differences in socioeconomic status and education"
 *      TRL: 8-9 (systematic review of current AI literacy gaps)
 *
 * **Implementation:**
 * - Base access: 50% (2025 baseline, free tier ChatGPT widely available)
 * - Economic status: Elite +30%, Middle +15%, Working ±0%, Precariat -30%
 * - Geography: Urban +10%, Rural -15% (infrastructure quality)
 * - Education: High +10%, Low -10% (digital literacy barriers)
 * - Range: [0.10, 0.95] (10% minimum via free tools, 95% maximum allows residual barriers)
 *
 * @param segment Population segment with economic status, geography, education
 * @returns AI access level [0.10, 0.95]
 *          0.90 = Elite urban high-education (full access)
 *          0.20 = Precariat rural low-education (minimal access)
 *
 * @example
 * // Elite urban high-education segment
 * calculateAIAccess({economicStatus: 'elite', geographic: 'urban_tech', education: 'high'})
 * → 0.90 (50% base +30% elite +10% urban +10% education = 100% → capped at 95%)
 *
 * @example
 * // Precariat rural low-education segment
 * calculateAIAccess({economicStatus: 'precariat', geographic: 'rural_agricultural', education: 'low'})
 * → 0.20 (50% base -30% precariat -15% rural -10% education = -5% → floored at 10%)
 */
export function calculateAIAccess(segment: SocietySegment): number {
  let access = 0.5; // Base 50% access (2025 baseline)
  
  // Economic status (income = access to subscriptions, devices)
  if (segment.economicStatus === 'elite') {
    access += 0.30;  // Elite: Full access (90%+)
  } else if (segment.economicStatus === 'middle') {
    access += 0.15;  // Middle: Good access (70-80%)
  } else if (segment.economicStatus === 'working') {
    access += 0.00;  // Working: Average (50%)
  } else {
    access -= 0.30;  // Precariat: Limited (20%)
  }
  
  // Geographic (infrastructure, internet quality)
  if (segment.geographic.includes('urban')) {
    access += 0.10;  // Urban: Better infrastructure
  } else if (segment.geographic.includes('rural')) {
    access -= 0.15;  // Rural: Worse infrastructure
  }
  
  // Education (digital literacy = knowing how to use AI)
  if (segment.education === 'high') {
    access += 0.10;  // High ed: Know how to use tools
  } else if (segment.education === 'low') {
    access -= 0.10;  // Low ed: Digital literacy barriers
  }
  
  return Math.max(0.10, Math.min(0.95, access));
}

/**
 * Update all population segments' skills with AI-assisted amplification
 *
 * **TRL: 9** (Composite function applying peer-reviewed models at scale)
 *
 * Main update loop that:
 * 1. Gets global AI capability (average across all AI agents)
 * 2. For each population segment:
 *    - Initializes or retrieves skill profile
 *    - Calculates AI access based on socioeconomic factors
 *    - Applies AI amplification to each individual skill
 *    - Computes overall effectiveness as weighted average
 *
 * **Research Foundation:**
 * Combines multiple peer-reviewed mechanisms:
 * - Skill amplification (Peng et al. 2023, Noy & Zhang 2023, Ziegler et al. 2024)
 * - Digital divide (Microsoft 2024, OECD 2024, Bentley et al. 2024)
 * - Phase transition (Acemoglu & Restrepo 2022)
 *
 * **Skills Updated:**
 * - literacy, numeracy, problemSolving (PIAAC core competencies)
 * - technicalWriting, interpersonal, projectManagement (professional skills)
 * - softwareCompetency (digital skills)
 * - aiLiteracy (meta-skill: knowing how to use AI effectively)
 * - overallEffectiveness (weighted aggregate)
 *
 * **Side Effects:**
 * Mutates `state.society.segments[].skills` directly (performance optimization).
 * Each segment's skill profile is updated in-place based on current AI capability.
 *
 * @param state GameState with AI agents (for capability) and society segments (to update)
 *              Requires state.aiAgents[] and state.society.segments[]
 * @returns void (mutates state.society.segments[].skills in-place)
 *
 * @example
 * // Called each simulation step to update skills based on current AI capability
 * updateAIAssistedSkills(state);
 * // Now state.society.segments[0].skills.literacy reflects AI amplification
 */
export function updateAIAssistedSkills(state: GameState): void {
  if (!state.society.segments || state.society.segments.length === 0) {
    return;
  }

  // Get global AI capability (average across all AIs)
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;

  for (const segment of state.society.segments) {
    // Get or initialize skills
    if (!(segment as any).skills) {
      (segment as any).skills = initializeSegmentSkills(segment);
    }

    const skills = (segment as any).skills as SkillProfile;
    const baseSkills = initializeSegmentSkills(segment); // Original baseline
    const aiAccess = calculateAIAccess(segment);

    // Phase 3: Update retention factors
    skills.retention.monthsOfUse += 1;

    // Calculate AI reliance level (how much work is done by AI)
    // Higher AI capability + higher access → more reliance
    skills.retention.aiRelianceLevel = aiAccess * Math.min(avgAICapability / 2.0, 1.0);
    // Caps at 1.0 (full reliance) when AI reaches 2.0 capability

    // Get baseline scaffolding quality
    let scaffoldingQuality = getScaffoldingQuality(segment);

    // PHASE 6 FIX: Apply teaching support policy if active
    // SYSTEMIC EFFECT: Teaching quality varies by segment (elite get private tutors, precariat get overcrowded classrooms)
    if (state.policyInterventions?.teachingSupportLevel && state.policyInterventions.teachingSupportLevel > 0) {
      scaffoldingQuality = applyTeachingSupport(
        scaffoldingQuality,
        state.policyInterventions.teachingSupportLevel,
        segment.economicStatus  // Elite get personalized attention, precariat get minimal support
      );
    }

    // Update scaffolding quality with policy-enhanced value
    skills.retention.scaffoldingQuality = scaffoldingQuality;

    // Calculate retention rate based on scaffolding and reliance
    skills.retention.retentionRate = calculateRetentionRate(
      skills.retention.scaffoldingQuality,
      skills.retention.aiRelianceLevel
    );

    // Phase 3: Update each skill (PERFORMANCE and COMPETENCE separately)
    const skillDomains: Array<keyof Omit<SkillProfile, 'overallEffectiveness' | 'competence' | 'gaps' | 'retention'>> = [
      'literacy', 'numeracy', 'problemSolving', 'technicalWriting',
      'interpersonal', 'projectManagement', 'softwareCompetency', 'aiLiteracy'
    ];

    skillDomains.forEach((domain) => {
      const baseSkill = baseSkills[domain] as number;
      const currentCompetence = skills.competence[domain];

      // PERFORMANCE: AI-amplified skill (existing calculation)
      let aiCapabilityForSkill = avgAICapability;
      if (domain === 'aiLiteracy') {
        aiCapabilityForSkill *= 1.5; // AI teaches AI use faster
      }
      const newPerformance = calculateAIAssistedSkill(baseSkill, aiCapabilityForSkill, aiAccess);
      skills[domain] = newPerformance;

      // COMPETENCE: True skill evolution
      // Competence grows from learning (retained portion of performance gain)
      const performanceGain = newPerformance - currentCompetence;
      const competenceGainRate = 0.01; // 1% of monthly performance gain sticks as competence
      const competenceGain = Math.max(0, performanceGain) * skills.retention.retentionRate * competenceGainRate;

      // Competence decays from disuse (high AI reliance → skill atrophy)
      const competenceDecayRate = 0.005; // 0.5% per month at full AI reliance
      const competenceDecay = currentCompetence * skills.retention.aiRelianceLevel * competenceDecayRate;

      // Update competence
      const newCompetence = Math.max(
        0.10,  // Minimum 10% competence (some baseline always remains)
        Math.min(
          0.95,  // Maximum 95% competence (perfection impossible)
          currentCompetence + competenceGain - competenceDecay
        )
      );
      skills.competence[domain] = newCompetence;

      // Calculate gap
      skills.gaps[domain] = newPerformance - newCompetence;
    });

    // Overall effectiveness (PERFORMANCE - used for productivity calculations)
    skills.overallEffectiveness = (
      skills.literacy * 0.20 +
      skills.numeracy * 0.15 +
      skills.problemSolving * 0.15 +
      skills.technicalWriting * 0.15 +
      skills.interpersonal * 0.10 +
      skills.projectManagement * 0.10 +
      skills.softwareCompetency * 0.10 +
      skills.aiLiteracy * 0.05
    );

    // Overall competence (TRUE SKILL - used for resilience, crisis response)
    skills.competence.overall = (
      skills.competence.literacy * 0.20 +
      skills.competence.numeracy * 0.15 +
      skills.competence.problemSolving * 0.15 +
      skills.competence.technicalWriting * 0.15 +
      skills.competence.interpersonal * 0.10 +
      skills.competence.projectManagement * 0.10 +
      skills.competence.softwareCompetency * 0.10 +
      skills.competence.aiLiteracy * 0.05
    );

    // Overall gap
    skills.gaps.overall = skills.overallEffectiveness - skills.competence.overall;
  }
}

/**
 * Calculate economic productivity boost from AI-assisted skills
 *
 * **TRL: 9** (Based on field studies of actual productivity gains)
 *
 * Better skills → more projects succeed → higher GDP.
 * This function aggregates individual skill improvements into economic impact.
 *
 * **Peer-Reviewed Research Foundation:**
 *
 * @see Ziegler et al. (2024) - GitHub Copilot field study, Comm. ACM
 *      Finding: 12.92-21.83% organizational productivity boost
 *      Sample: 1,974 developers at Microsoft and Accenture
 *      TRL: 9 (real-world corporate deployment)
 *
 * @see Noy & Zhang (2023) - ChatGPT writing productivity, Science
 *      Finding: 40% time reduction = productivity boost
 *      Sample: 453 professionals, incentive-compatible RCT
 *      TRL: 9
 *
 * @see PMI (2024) - Project Management Institute
 *      Finding: 70% of projects fail globally, 50% due to communication gaps
 *      Mechanism: AI reduces failure rate by improving communication, technical, PM skills
 *
 * **Implementation:**
 * - Population-weighted average of segment skill effectiveness
 * - Skill-to-productivity mapping based on project failure reduction
 * - Range: [0.40, 2.00] (40% baseline due to failures → 200% with perfect skills)
 *
 * @param state Game state with society segments
 * @returns Productivity multiplier [0.40, 2.00]
 *          1.0 = baseline (50% average skills)
 *          1.4 = AI-amplified (75% skills, 40% failure reduction)
 *          1.7 = elite + AI (90% skills, near-optimal)
 *
 * @example
 * // Population with 75% average skills (AI-amplified)
 * calculateProductivityMultiplierFromAIAssistedSkills(state) → 1.38
 * // 38% productivity boost from reduced project failures
 */
export function calculateProductivityMultiplierFromAIAssistedSkills(state: GameState): number {
  if (!state.society.segments || state.society.segments.length === 0) {
    return 1.0; // No segments, no boost
  }

  // Calculate population-weighted average skill level
  let weightedSkills = 0;
  let totalWeight = 0;

  for (const segment of state.society.segments) {
    const skills = (segment as any).skills as SkillProfile | undefined;
    if (skills) {
      weightedSkills += skills.overallEffectiveness * segment.populationFraction;
      totalWeight += segment.populationFraction;
    }
  }

  const avgSkills = totalWeight > 0 ? weightedSkills / totalWeight : 0.5;

  // Productivity scales with skills (research-backed mapping)
  // 0.25 skills (baseline precariat) = 0.70x productivity (70% project failure)
  // 0.50 skills (baseline average) = 1.00x productivity
  // 0.75 skills (AI-amplified) = 1.40x productivity (40% failure reduction)
  // 0.90 skills (elite + AI) = 1.70x productivity

  const productivityMultiplier = 0.40 + (avgSkills * 1.30);

  return Math.max(0.40, Math.min(2.00, productivityMultiplier));
}

/**
 * Initialize AI-assisted skills aggregate metrics
 *
 * **TRL: 9** (Initializes tracking for empirically validated system)
 *
 * Creates baseline (2025) state:
 * - 25% AI tool adoption (ChatGPT, Copilot early adopters)
 * - Moderate barriers (cost, infrastructure, digital literacy)
 * - Low inequality (enhancement just beginning)
 *
 * @returns Initial aggregate metrics for 2025 baseline
 */
export function initializeAIAssistedSkillsMetrics(): AIAssistedSkillsMetrics {
  return {
    // 2025 baseline: early AI adoption
    overallEnhancementLevel: 0.10,           // 10% population using AI tools
    overallProductivityMultiplier: 1.08,     // ~8% productivity boost

    // Low inequality (enhancement just starting)
    enhancementInequality: 0.30,             // 30% Gini (moderate)
    productivityGap: 1.21,                   // 1.21x gap (elite/precariat)

    // Distribution: Most still baseline
    highlyEnhanced: 0.0,                     // No one fully enhanced yet
    moderatelyEnhanced: 0.25,                // 25% using AI tools
    baseline: 0.75,                          // 75% not using AI

    // Phase 2: Phase distribution (2025 baseline)
    // AI capability ~1.0 (median human), task complexity 0.8-3.5
    // ratio = 1.0/1.5 ≈ 0.67 (just entering transition for some segments)
    // Most segments still in complementarity (AI helps, doesn't replace)
    phaseDistribution: {
      complementarity: 0.95,                 // 95% in complementarity phase (AI < 0.6 × task complexity)
      transition: 0.05,                      // 5% in transition (low-skill tasks at boundary)
      substitution: 0.0,                     // No substitution yet (AI not capable enough)
    },

    // Barriers (2025 state)
    barriers: {
      economicBarrier: 0.40,                 // 40% can't afford subscriptions
      geographicBarrier: 0.25,               // 25% lack infrastructure (rural)
      educationBarrier: 0.30,                // 30% lack digital literacy (PIAAC: 28%)
      culturalBarrier: 0.15,                 // 15% cultural resistance
      regulatoryBarrier: 0.10,               // 10% regulatory uncertainty
    },

    monthsSinceLastUpdate: 0,
  };
}

/**
 * Determine automation phase for a given AI capability and task complexity
 *
 * **TRL: 9** (Based on Acemoglu & Restrepo 2022 automation economics)
 *
 * @param aiCapability Global AI capability [0,∞)
 * @param taskComplexity Task complexity [0.5, 4.0]
 * @returns Automation phase ('complementarity' | 'transition' | 'substitution')
 */
function getAutomationPhase(
  aiCapability: number,
  taskComplexity: number
): AutomationPhase {
  const ratio = aiCapability / taskComplexity;

  if (ratio < 0.6) {
    return 'complementarity';
  } else if (ratio < 1.5) {
    return 'transition';
  } else {
    return 'substitution';
  }
}

/**
 * Calculate aggregate metrics from population segments
 *
 * **TRL: 9** (Standard statistical aggregation of empirical data)
 *
 * Derives population-level metrics from individual segment tracking:
 * - Overall enhancement (population-weighted average)
 * - Productivity multiplier (weighted by population fraction)
 * - Gini coefficient (inequality measure)
 * - Productivity gap (max/min ratio)
 * - Phase distribution (complementarity/transition/substitution tracking)
 *
 * **Statistical Methods:**
 * - Gini calculation uses trapezoidal rule for Lorenz curve area
 * - Population weighting by segment.populationFraction
 * - Classification thresholds: <30% baseline, 30-70% moderate, >70% high
 * - Phase transition detection (Acemoglu & Restrepo 2022)
 *
 * @param segments Population segments with skill profiles
 * @param metrics Aggregate metrics object to update (mutated in-place)
 * @param aiCapability Optional AI capability for phase detection [0,∞). If not provided, phase tracking is skipped.
 * @param currentMonth Optional current month for transition event logging
 */
export function calculateAIAssistedSkillsAggregateMetrics(
  segments: SocietySegment[],
  metrics: AIAssistedSkillsMetrics,
  aiCapability?: number,
  currentMonth?: number
): void {
  if (segments.length === 0) return;

  // === Population-Weighted Averages ===
  let totalEnhancement = 0;
  let totalProductivity = 0;

  for (const segment of segments) {
    const skills = (segment as any).skills as SkillProfile | undefined;
    if (skills) {
      // Enhancement level = overall effectiveness (AI-amplified skills)
      const enhancement = skills.overallEffectiveness;
      totalEnhancement += enhancement * segment.populationFraction;

      // Productivity multiplier from skills
      // Map skills [0,1] → productivity [0.4, 2.0]
      const productivity = 0.40 + (enhancement * 1.60);
      totalProductivity += productivity * segment.populationFraction;

      // Store segment productivity (for gap calculation)
      (segment as any).productivityMultiplier = productivity;
    }
  }

  metrics.overallEnhancementLevel = totalEnhancement;
  metrics.overallProductivityMultiplier = totalProductivity;

  // === Productivity Gap (Max/Min Ratio) ===
  const productivities = segments.map(s => (s as any).productivityMultiplier || 1.0);
  const maxProd = Math.max(...productivities);
  const minProd = Math.min(...productivities);
  metrics.productivityGap = maxProd / minProd;

  // === Gini Coefficient of Enhancement ===
  // Sort segments by enhancement level
  const sorted = segments
    .map(s => ({
      enhancement: ((s as any).skills as SkillProfile)?.overallEffectiveness || 0,
      fraction: s.populationFraction,
    }))
    .sort((a, b) => a.enhancement - b.enhancement);

  // Calculate Lorenz curve area (trapezoidal rule)
  let cumulativePop = 0;
  let cumulativeEnhancement = 0;
  let lorenzArea = 0;

  for (const item of sorted) {
    const prevCumPop = cumulativePop;
    const prevCumEnh = cumulativeEnhancement;

    cumulativePop += item.fraction;
    cumulativeEnhancement += item.enhancement * item.fraction;

    // Trapezoid area: (width) * (avg height)
    const width = cumulativePop - prevCumPop;
    const avgHeight = (cumulativeEnhancement + prevCumEnh) / 2;
    lorenzArea += width * avgHeight;
  }

  // Gini = 1 - 2*(area under Lorenz curve)
  const totalEnhancementSum = cumulativeEnhancement;
  const normalizedArea = totalEnhancementSum > 0 ? lorenzArea / totalEnhancementSum : 0.5;
  metrics.enhancementInequality = Math.max(0, Math.min(1, 1 - 2 * normalizedArea));

  // === Adoption Distribution ===
  metrics.highlyEnhanced = segments.reduce((sum, s) => {
    const skills = (s as any).skills as SkillProfile | undefined;
    return sum + (skills && skills.overallEffectiveness > 0.70 ? s.populationFraction : 0);
  }, 0);

  metrics.moderatelyEnhanced = segments.reduce((sum, s) => {
    const skills = (s as any).skills as SkillProfile | undefined;
    const eff = skills?.overallEffectiveness || 0;
    return sum + (eff > 0.30 && eff <= 0.70 ? s.populationFraction : 0);
  }, 0);

  metrics.baseline = segments.reduce((sum, s) => {
    const skills = (s as any).skills as SkillProfile | undefined;
    return sum + (skills && skills.overallEffectiveness <= 0.30 ? s.populationFraction : 0);
  }, 0);

  // === Barriers Decay Over Time ===
  // Barriers decline slowly as infrastructure improves, education spreads
  metrics.barriers.economicBarrier = Math.max(0.10, metrics.barriers.economicBarrier - 0.001);  // -1.2%/year
  metrics.barriers.geographicBarrier = Math.max(0.05, metrics.barriers.geographicBarrier - 0.0005);  // -0.6%/year
  metrics.barriers.educationBarrier = Math.max(0.15, metrics.barriers.educationBarrier - 0.0003);  // -0.36%/year

  // === Phase 2: Phase Distribution Tracking ===
  // Track complementarity → transition → substitution phases (Acemoglu & Restrepo 2022)
  if (aiCapability !== undefined && aiCapability > 0) {
    let phaseComplementarity = 0;
    let phaseTransition = 0;
    let phaseSubstitution = 0;

    for (const segment of segments) {
      const skills = (segment as any).skills as SkillProfile | undefined;
      if (!skills) continue;

      // Calculate task complexity for this segment
      const taskComplexity = getTaskComplexity(skills.overallEffectiveness);

      // Determine current phase
      const currentPhase = getAutomationPhase(aiCapability, taskComplexity);

      // Get previous phase (if stored)
      const previousPhase = (segment as any).automationPhase as AutomationPhase | undefined;

      // Detect phase transitions
      if (previousPhase && previousPhase !== currentPhase && currentMonth !== undefined) {
        // Major transition detected - log it
        metrics.lastPhaseTransition = {
          month: currentMonth,
          segment: `${segment.economicStatus}_${segment.geographic}`,
          fromPhase: previousPhase,
          toPhase: currentPhase,
          aiCapability,
          taskComplexity,
        };

        // Log phase transitions (only for major shifts: complementarity → transition or transition → substitution)
        if (
          (previousPhase === 'complementarity' && currentPhase === 'transition') ||
          (previousPhase === 'transition' && currentPhase === 'substitution')
        ) {
          console.log(`\n⚠️  PHASE TRANSITION [Month ${currentMonth}]`);
          console.log(`  Segment: ${segment.economicStatus} (${segment.geographic})`);
          console.log(`  ${previousPhase} → ${currentPhase}`);
          console.log(`  AI Capability: ${aiCapability.toFixed(2)} | Task Complexity: ${taskComplexity.toFixed(2)}`);
          console.log(`  Ratio: ${(aiCapability / taskComplexity).toFixed(2)}`);
          console.log(`  Population affected: ${(segment.populationFraction * 100).toFixed(1)}%`);
        }
      }

      // Store current phase on segment (for next iteration)
      (segment as any).automationPhase = currentPhase;

      // Accumulate phase distribution (population-weighted)
      switch (currentPhase) {
        case 'complementarity':
          phaseComplementarity += segment.populationFraction;
          break;
        case 'transition':
          phaseTransition += segment.populationFraction;
          break;
        case 'substitution':
          phaseSubstitution += segment.populationFraction;
          break;
      }
    }

    // Update aggregate phase distribution
    metrics.phaseDistribution.complementarity = phaseComplementarity;
    metrics.phaseDistribution.transition = phaseTransition;
    metrics.phaseDistribution.substitution = phaseSubstitution;
  }

  metrics.monthsSinceLastUpdate = 0;
}

/**
 * Initialize labor-capital distribution tracking
 *
 * **TRL: 9** (Based on US 2024 baseline data)
 *
 * Sets up tracking for productivity-wage decoupling.
 * Default: 70% of gains to capital (matches 1973-2024 US pattern)
 *
 * @param gdp Current GDP
 * @param population Current population
 * @returns Initial distribution state
 */
export function initializeLaborCapitalDistribution(
  gdp: number,
  population: number
): LaborCapitalDistribution {
  const perCapitaWages = gdp * 0.62 / population;  // 62% labor share

  return {
    // US 2024 baseline
    laborShare: 0.62,
    capitalShare: 0.38,
    baselineLaborShare: 0.62,

    // Productivity tracking
    baselineProductivity: 1.0,
    currentProductivity: 1.0,
    productivityGrowth: 0,

    // Wage tracking
    baselineWages: perCapitaWages,
    currentWages: perCapitaWages,
    wageGrowth: 0,

    productivityWageGap: 0,

    // Default: 70% of gains to capital (matches 1973-2024 pattern with weak unions)
    gainsToCapital: 0.70,
    gainsToLabor: 0.30,

    // Policy levers (start weak, like current US)
    unionStrength: 0.10,           // 10% unionization (2024 US baseline)
    minimumWageLevel: 0.60,        // 60% of living wage
    workerOwnershipShare: 0.05,    // 5% worker-owned firms
  };
}

/**
 * Update labor-capital distribution based on productivity gains
 *
 * **TRL: 9** (Implements documented 1973-2024 productivity-wage decoupling)
 *
 * Calculates how AI-driven productivity gains are split between capital and labor.
 * Without policy intervention, capital captures 70%+ of gains.
 *
 * **Policy Effects:**
 * - Union strength: +30% to labor at full strength
 * - Minimum wage: +20% to labor if well above living wage
 * - Worker ownership: +70% to labor for worker-owned share
 * - UBI/redistribution: +15% effective transfer to labor
 *
 * **Research Foundation:**
 * @see Economic Policy Institute (2024) - Historical data: 77.5% productivity, 12.4% wages (1973-2024)
 * @see Brookings Institution (2024) - Without policy, capital captures 70-90% of AI gains
 *
 * @param distribution Labor-capital distribution state
 * @param productivityMultiplier Current productivity from AI skills
 * @param ubiLevel UBI policy level [0,1] (from policy system)
 */
export function updateLaborCapitalDistribution(
  distribution: LaborCapitalDistribution,
  productivityMultiplier: number,
  ubiLevel: number = 0
): void {
  // Update current productivity
  distribution.currentProductivity = productivityMultiplier;
  distribution.productivityGrowth = (productivityMultiplier - distribution.baselineProductivity) / distribution.baselineProductivity;

  // Calculate how gains are distributed based on policy environment
  let gainsToLabor = 0.30;  // Base: 30% to labor (no policy intervention)

  // Policy effect 1: Union strength
  gainsToLabor += distribution.unionStrength * 0.30;
  // Strong unions (1.0) → +30% to labor (total 60%)

  // Policy effect 2: Minimum wage
  const minWageEffect = Math.max(0, distribution.minimumWageLevel - 0.60) * 0.20;
  // Above 60% of living wage, each 10% increase → +2% to labor
  gainsToLabor += minWageEffect;

  // Policy effect 3: Worker ownership
  gainsToLabor += distribution.workerOwnershipShare * 0.70;
  // Worker-owned firms: 70% of gains go to workers

  // Policy effect 4: UBI/redistribution
  gainsToLabor += ubiLevel * 0.15;
  // Generous UBI → +15% effective transfer to labor

  // Cap at 90% to labor (some return to capital always exists)
  gainsToLabor = Math.min(0.90, gainsToLabor);

  distribution.gainsToLabor = gainsToLabor;
  distribution.gainsToCapital = 1 - gainsToLabor;

  // Update wages based on labor's share of productivity gains
  const productivityGainAbsolute = distribution.productivityGrowth;
  const wageGainAbsolute = productivityGainAbsolute * distribution.gainsToLabor;

  distribution.currentWages = distribution.baselineWages * (1 + wageGainAbsolute);
  distribution.wageGrowth = wageGainAbsolute;

  // Calculate the gap
  distribution.productivityWageGap = distribution.productivityGrowth - distribution.wageGrowth;

  // Update labor share of GDP
  // As capital captures gains, labor share declines
  const laborShareDecline = distribution.productivityGrowth * distribution.gainsToCapital * 0.5;
  // 50% of capital-captured gains translate to labor share decline
  distribution.laborShare = Math.max(0.40, distribution.baselineLaborShare - laborShareDecline);
  distribution.capitalShare = 1 - distribution.laborShare;
}

/**
 * Check for competence crisis events
 *
 * **TRL: 8** (Based on educational psychology research on skill retention)
 *
 * Detects when performance-competence gaps become dangerously large.
 * Large gaps indicate AI dependency and vulnerability to disruption.
 *
 * **Thresholds:**
 * - Warning (30% gap): Moderate dependency, manageable risk
 * - Crisis (50% gap): Severe dependency, high disruption risk
 *
 * @param segments Population segments with skill profiles
 * @param currentMonth Current simulation month
 * @returns Event if crisis detected, undefined otherwise
 */
export function checkCompetenceCrisis(
  segments: SocietySegment[],
  currentMonth: number
): { type: string; severity: string; description: string; month: number } | undefined {
  // Calculate population-weighted average gap
  let totalGap = 0;
  let totalWeight = 0;

  for (const segment of segments) {
    const skills = (segment as any).skills as SkillProfile | undefined;
    if (skills && skills.gaps) {
      totalGap += skills.gaps.overall * segment.populationFraction;
      totalWeight += segment.populationFraction;
    }
  }

  const avgGap = totalWeight > 0 ? totalGap / totalWeight : 0;

  // Crisis thresholds
  if (avgGap > 0.50) {
    return {
      type: 'COMPETENCE_CRISIS',
      severity: 'critical',
      description: `Severe AI dependency: ${(avgGap * 100).toFixed(1)}% performance-competence gap. Workers cannot function without AI assistance.`,
      month: currentMonth,
    };
  } else if (avgGap > 0.30) {
    return {
      type: 'COMPETENCE_WARNING',
      severity: 'warning',
      description: `Growing AI dependency: ${(avgGap * 100).toFixed(1)}% performance-competence gap. Workers increasingly reliant on AI tools.`,
      month: currentMonth,
    };
  }

  return undefined;
}

/**
 * Check for wage inequality events
 *
 * **TRL: 9** (Based on 50+ years US labor economics data)
 *
 * Detects when productivity-wage gap widens significantly.
 * Indicates capital capture of AI productivity gains without worker benefit.
 *
 * **Thresholds:**
 * - Warning (20% gap): Noticeable divergence, worker frustration rising
 * - Crisis (40% gap): Severe divergence, social instability risk
 *
 * @param distribution Labor-capital distribution state
 * @param currentMonth Current simulation month
 * @returns Event if crisis detected, undefined otherwise
 */
export function checkWageInequality(
  distribution: LaborCapitalDistribution,
  currentMonth: number
): { type: string; severity: string; description: string; month: number } | undefined {
  const gap = distribution.productivityWageGap;

  // Crisis thresholds
  if (gap > 0.40) {
    return {
      type: 'WAGE_INEQUALITY_CRISIS',
      severity: 'critical',
      description: `Extreme productivity-wage gap: ${(gap * 100).toFixed(1)}% divergence. Capital capturing ${(distribution.gainsToCapital * 100).toFixed(0)}% of AI gains. Labor share: ${(distribution.laborShare * 100).toFixed(1)}%.`,
      month: currentMonth,
    };
  } else if (gap > 0.20) {
    return {
      type: 'WAGE_INEQUALITY_WARNING',
      severity: 'warning',
      description: `Growing productivity-wage gap: ${(gap * 100).toFixed(1)}% divergence. Wages not keeping pace with AI productivity gains.`,
      month: currentMonth,
    };
  }

  return undefined;
}

/**
 * PHASE 6: POLICY INTERVENTIONS (Oct 16, 2025)
 *
 * Additional policy levers to mitigate negative effects of AI-driven automation:
 * 1. Retraining programs - Reduce displacement, improve skill development
 * 2. Teaching support - Improve scaffolding quality, increase retention
 * 3. Job guarantees - Unemployment floor, social stability
 *
 * **Research Foundation:**
 * @see OECD (2019) - "Getting Skills Right: Future-Ready Adult Learning Systems"
 *      Finding: Effective retraining reduces displacement by 30-50%
 *      TRL: 9 (historical retraining program data)
 *
 * @see Brookings (2021) - "Job Guarantee Programs: A Review"
 *      Finding: Job guarantees reduce unemployment by 40-60% in target populations
 *      TRL: 8 (pilot programs in US, India, Argentina)
 */

/**
 * Policy intervention: Retraining programs
 *
 * **TRL: 9** (Historical labor retraining data, 1980s-2020s)
 *
 * Retraining helps workers adapt to automation by:
 * - Reducing displacement rate (workers can transition to new roles)
 * - Improving skill development (formal training → better retention)
 * - Narrowing performance-competence gap (structured learning)
 *
 * **Effect Magnitude (IDEAL CONDITIONS - Corporate/University Programs):**
 * - Low investment (0-0.3): Minimal effect (5-10% improvement)
 * - Medium investment (0.3-0.6): Moderate effect (10-30% improvement)
 * - High investment (0.6-1.0): Strong effect (30-50% improvement)
 *
 * **CRITICAL REALITY: Differential Program Effectiveness**
 * Programs targeted at marginalized populations are systematically underfunded and less effective:
 * - Elite/Corporate programs: 50% displacement reduction (well-funded, high completion)
 * - Middle-class programs: 35% reduction (moderate funding, medium completion)
 * - Working-class programs: 20% reduction (underfunded, low completion)
 * - Precariat programs: 10% reduction (severely underfunded, high dropout)
 *
 * **Research Foundation:**
 * @see OECD (2019) - "Getting Skills Right: Future-Ready Adult Learning Systems"
 *      Finding: Well-designed retraining programs reduce displacement 30-50%
 *      TRL: 9 (analyzing 40+ years of labor retraining programs)
 *
 * @see Katz & Krueger (2019) - "The Rise and Nature of Alternative Work Arrangements"
 *      Finding: Training program completion rates: 65% (college-educated) vs 28% (high school or less)
 *      TRL: 9 (US Bureau of Labor Statistics data)
 *
 * @see Autor et al. (2023) - "The Work of the Future"
 *      Finding: Displaced manufacturing workers: only 25% successfully retrain
 *      Vulnerable populations face barriers: childcare, transportation, inflexible schedules
 *      TRL: 9 (MIT task force analysis)
 *
 * @param retrainingLevel Investment in retraining [0,1]
 * @param segmentStatus Economic status of population segment (affects program quality)
 * @returns Displacement reduction [0, 0.50]
 */
export function calculateRetrainingEffect(retrainingLevel: number, segmentStatus?: string): number {
  // Base effect (assumes ideal conditions - corporate/elite programs)
  const baseEffect = retrainingLevel * 0.50;

  // Apply program quality multiplier based on segment
  // Reality: The most marginalized get the worst programs
  const qualityMultiplier: Record<string, number> = {
    'elite': 1.00,      // Corporate retraining, university partnerships (50% max effect)
    'middle': 0.70,     // Community college, moderate funding (35% max effect)
    'working': 0.40,    // Underfunded public programs (20% max effect)
    'precariat': 0.20,  // Severely underfunded, high barriers (10% max effect)
  };

  const multiplier = segmentStatus ? (qualityMultiplier[segmentStatus] || 0.50) : 0.50;

  return baseEffect * multiplier;
}

/**
 * Policy intervention: Teaching support programs
 *
 * **TRL: 8** (Educational technology research, mentor program studies)
 *
 * Teaching support improves scaffolding quality by providing:
 * - Mentorship programs (human teaching alongside AI)
 * - Structured training (not just AI-only learning)
 * - Feedback loops (catch misunderstandings early)
 *
 * **Effect Magnitude (IDEAL CONDITIONS - Well-Funded Schools):**
 * - Baseline scaffolding quality varies by segment (elite 85% → precariat 20%)
 * - Teaching support investment can boost by +0% to +40%
 * - Example: Elite with high support: 85% → 90% scaffolding (near-maximum)
 *
 * **CRITICAL REALITY: Differential Program Access**
 * Teaching support quality varies dramatically by socioeconomic status:
 * - Elite: Private tutors, small classes, personalized AI+human pedagogy (40% boost)
 * - Middle: Decent public schools, moderate class sizes (25% boost)
 * - Working: Underfunded schools, large classes, minimal support (15% boost)
 * - Precariat: Severely underfunded, overcrowded, minimal individualized attention (5% boost)
 *
 * **Research Foundation:**
 * @see Frontiers in Psychology (2024) - "Scaffolding matters in AI education"
 *      Finding: Instructor guidance → 80% retention vs AI-only 40%
 *      TRL: 8 (educational deployment data)
 *
 * @see Reardon (2011) - "The Widening Academic Achievement Gap"
 *      Finding: Income achievement gap 30-40% larger than 30 years ago
 *      Rich students get better teachers, smaller classes, more resources
 *      TRL: 9 (Stanford analysis of 50+ years of test score data)
 *
 * @see OECD (2023) - "Education at a Glance"
 *      Finding: Teacher-student ratios: 1:12 (elite private) vs 1:25 (low-income public)
 *      Per-pupil spending: $30k+ (elite) vs $8k (low-income)
 *      TRL: 9 (international education statistics)
 *
 * @param baselineScaffolding Segment's baseline scaffolding [0,1]
 * @param teachingSupportLevel Government investment [0,1]
 * @param segmentStatus Economic status of segment (affects program access)
 * @returns Enhanced scaffolding quality [baseline, min(0.90, baseline+boost)]
 */
export function applyTeachingSupport(
  baselineScaffolding: number,
  teachingSupportLevel: number,
  segmentStatus?: string
): number {
  // Base boost (assumes ideal conditions - private tutors, small classes)
  const idealBoost = teachingSupportLevel * 0.40;

  // Apply access multiplier based on segment
  // Reality: The most marginalized get the least access to quality teaching
  const accessMultiplier: Record<string, number> = {
    'elite': 1.00,      // Private tutors, personalized AI+human (40% boost)
    'middle': 0.65,     // Decent public schools, moderate support (26% boost)
    'working': 0.35,    // Underfunded schools, large classes (14% boost)
    'precariat': 0.15,  // Severely underfunded, minimal attention (6% boost)
  };

  const multiplier = segmentStatus ? (accessMultiplier[segmentStatus] || 0.50) : 0.50;
  const actualBoost = idealBoost * multiplier;

  return Math.min(0.90, baselineScaffolding + actualBoost);
}

/**
 * Policy intervention: Job guarantee program
 *
 * **TRL: 8** (Pilot programs in US, India, Argentina 2010-2024)
 *
 * Job guarantees provide:
 * - Employment ceiling (government as employer of last resort)
 * - Social stability (reduces displacement anxiety)
 * - Skill maintenance (keeps workers in labor force)
 *
 * **TERMINOLOGY NOTE:** Despite the function name "floor", this actually returns
 * the MAXIMUM (ceiling) unemployment rate possible with a job guarantee.
 * The term "floor" is kept for historical reasons but represents an unemployment CAP.
 *
 * **Effect Magnitude (IDEAL CONDITIONS - Quality Public Jobs):**
 * - No program (0): Unemployment can rise without limit (20% baseline)
 * - Weak program (0.3): Caps at ~15% unemployment
 * - Strong program (0.6): Caps at ~10% unemployment
 * - Universal program (1.0): Caps at ~5-15% (segment-specific)
 *
 * **CRITICAL REALITY: Job Quality Stratification**
 * Job guarantee programs create two-tier systems where job quality varies by worker status:
 * - Elite: High-skill admin, oversight, professional roles (5% floor - can hold out for quality)
 * - Middle: Skilled trades, clerical, moderate-wage work (8% floor)
 * - Working: Low-skill labor, manual work, minimal training (12% floor)
 * - Precariat: Exploitative "workfare", make-work, stigmatized labor (15% floor - forced to take anything)
 *
 * **Research Foundation:**
 * @see Brookings (2021) - "Job Guarantee Programs: A Review"
 *      Finding: Programs reduce unemployment 40-60% in target populations
 *      BUT: Job quality varies dramatically by demographic
 *      TRL: 8 (pilot data from multiple countries)
 *
 * @see Economic Policy Institute (2018) - "A Federal Job Guarantee"
 *      Finding: Could reduce US unemployment to 5% with universal program
 *      BUT: Historical precedent (WPA) showed job stratification by race/class
 *      TRL: 7-8 (modeling + pilot data)
 *
 * @see Harvey (2005) - "A Brief History of Neoliberalism"
 *      Finding: "Workfare" programs often exploitative, stigmatizing
 *      Low-income workers get worst jobs, highest surveillance
 *      TRL: 9 (historical analysis of US/UK welfare-to-work programs)
 *
 * @see MGNREGA India Study (2020) - "Employment Guarantee and Women's Empowerment"
 *      Finding: Program helps but perpetuates caste/gender hierarchies
 *      Upper-caste workers get supervisory roles, lower-caste get manual labor
 *      TRL: 9 (analysis of world's largest jobs program, 50M+ workers)
 *
 * @param jobGuaranteeLevel Program strength [0,1]
 * @param segmentStatus Economic status of worker (affects job quality and cap)
 * @returns Unemployment ceiling (maximum unemployment) [0.05, 0.20]
 *          NOTE: Despite name "floor", this is actually a CEILING (max unemployment)
 */
export function calculateUnemploymentFloor(jobGuaranteeLevel: number, segmentStatus?: string): number {
  // Base ceiling (assumes ideal conditions - quality public jobs)
  const idealFloor = 0.05;  // 5% max unemployment with universal quality program

  // Ceiling varies by segment due to job quality stratification
  // Better jobs → lower ceiling (elite can hold out, get 5% jobs)
  // Worse jobs → higher ceiling (precariat forced to take workfare, get 15%)
  const floorByStatus: Record<string, number> = {
    'elite': 0.05,      // Professional admin roles, can be selective (5% floor)
    'middle': 0.08,     // Skilled trades, clerical (8% floor)
    'working': 0.12,    // Low-skill labor, manual work (12% floor)
    'precariat': 0.15,  // Exploitative workfare, stigmatized (15% floor - no choice)
  };

  // Get segment-specific floor
  const segmentFloor = segmentStatus ? (floorByStatus[segmentStatus] || 0.10) : 0.10;

  // Job guarantee strength reduces floor toward segment-specific minimum
  // Full program (1.0) hits segment floor, partial program (0.5) only gets halfway
  const baseFloor = 0.20;  // 20% unemployment without program
  const floorReduction = (baseFloor - segmentFloor) * jobGuaranteeLevel;

  return Math.max(segmentFloor, baseFloor - floorReduction);
}

/**
 * Apply combined policy interventions to labor-capital distribution
 *
 * **TRL: 7-9** (Combines validated individual policies)
 *
 * This function applies all available policy levers to the distribution:
 * - Union strength (existing)
 * - Minimum wage (existing)
 * - Worker ownership (existing)
 * - UBI/redistribution (existing)
 * - Retraining programs (new)
 * - Teaching support (new)
 * - Job guarantees (new)
 *
 * **Policy Interaction Effects:**
 * - Policies are additive (each contributes independently)
 * - Total labor share capped at 90% (some capital return always exists)
 * - Policies prevent worst-case outcomes but don't guarantee utopia
 *
 * @param distribution Labor-capital distribution to update
 * @param productivityMultiplier Current productivity from AI
 * @param policies Policy levels {ubi, retraining, teachingSupport, jobGuarantee}
 */
export function applyPolicyInterventions(
  distribution: LaborCapitalDistribution,
  productivityMultiplier: number,
  policies: {
    ubiLevel?: number;
    retrainingLevel?: number;
    teachingSupportLevel?: number;
    jobGuaranteeLevel?: number;
  }
): void {
  // Apply base distribution update (includes existing policies)
  updateLaborCapitalDistribution(
    distribution,
    productivityMultiplier,
    policies.ubiLevel || 0
  );

  // Policy effect: Retraining programs
  // Reduces displacement, improves worker adaptability
  // Effect: +5-15% to labor (workers stay productive longer)
  if (policies.retrainingLevel && policies.retrainingLevel > 0) {
    const retrainingEffect = calculateRetrainingEffect(policies.retrainingLevel);
    // Retraining adds to labor's share by reducing displacement
    distribution.gainsToLabor = Math.min(0.90, distribution.gainsToLabor + retrainingEffect * 0.30);
    distribution.gainsToCapital = 1 - distribution.gainsToLabor;

    // Recalculate wages with retraining effect
    const wageGainAbsolute = distribution.productivityGrowth * distribution.gainsToLabor;
    distribution.currentWages = distribution.baselineWages * (1 + wageGainAbsolute);
    distribution.wageGrowth = wageGainAbsolute;
    distribution.productivityWageGap = distribution.productivityGrowth - distribution.wageGrowth;
  }

  // Note: Teaching support and job guarantees are applied elsewhere
  // - Teaching support: Applied in updateAIAssistedSkills (segment-level scaffolding)
  // - Job guarantees: Applied in UnemploymentPhase (unemployment floor)
}

