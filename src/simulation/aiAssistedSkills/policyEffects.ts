/**
 * Policy interventions for AI-driven automation
 *
 * **TRL: 7-9** (Individual policies validated, some combinations less tested)
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

import { LaborCapitalDistribution } from './types';
import { updateLaborCapitalDistribution } from './laborDistribution';

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

  // POLICY CALIBRATION (Oct 17, 2025): Retraining effectiveness recalibrated
  // Apply program quality multiplier based on segment
  // Reality: The most marginalized get the worst programs
  //
  // Research: Katz & Krueger (2019) - Training completion rates 65% college-ed vs 28% HS-or-less
  // Autor et al. (2023) - Displaced manufacturing: only 25% successfully retrain
  // Calibration: Elite 80% (not 100%) → max 40% displacement reduction (realistic upper bound)
  //
  // Elite multiplier reduced from 1.00 → 0.80 to match Katz & Krueger (2019) 20-40% range
  // @see research/policy-interventions-systemic-inequality-validation_20251016.md
  const qualityMultiplier: Record<string, number> = {
    'elite': 0.80,      // Corporate retraining, university partnerships (40% max effect, 65% completion)
    'middle': 0.60,     // Community college, moderate funding (30% max effect, ~45% completion)
    'working': 0.35,    // Underfunded public programs (17.5% max effect, ~30% completion)
    'precariat': 0.18,  // Severely underfunded, high barriers (9% max effect, ~25% completion)
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
