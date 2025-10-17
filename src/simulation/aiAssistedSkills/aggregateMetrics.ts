/**
 * Population-level aggregate metrics
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
 */

import { SocietySegment } from '@/types/game';
import { AIAssistedSkillsMetrics, SkillProfile, AutomationPhase } from './types';

/**
 * Calculate task complexity from baseline skill
 * Maps skill level to cognitive complexity required
 *
 * @param baselineSkill Skill level [0,1]
 * @returns Task complexity [0.5, 4.5]
 */
function getTaskComplexity(baselineSkill: number): number {
  // Map skill to complexity:
  // 0.25 (precariat) → 1.0 (routine tasks)
  // 0.40 (working) → 1.6 (basic professional)
  // 0.60 (middle) → 2.4 (intermediate professional)
  // 0.85 (elite) → 3.9 (expert tasks)
  return 0.5 + (baselineSkill * 4.0);
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
