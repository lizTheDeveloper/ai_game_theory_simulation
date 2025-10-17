/**
 * Inequality tracking and crisis detection
 *
 * **TRL: 8-9** (Based on educational psychology and labor economics research)
 *
 * Detects two types of crises related to AI-driven automation:
 *
 * 1. **Competence Crisis:** Performance-competence gaps become dangerously large
 *    - Indicates AI dependency and vulnerability to disruption
 *    - Workers cannot function without AI assistance
 *
 * 2. **Wage Inequality Crisis:** Productivity-wage gap widens significantly
 *    - Indicates capital capture of AI productivity gains without worker benefit
 *    - Social instability risk
 *
 * @see Frontiers in Psychology (2024) - Scaffolding and retention research
 * @see Economic Policy Institute (2024) - Productivity-wage gap documentation
 */

import { SocietySegment } from '@/types/game';
import { SkillProfile, LaborCapitalDistribution } from './types';

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
