/**
 * AI Comprehension Lag
 *
 * Models how long governments take to understand new AI capabilities
 *
 * Research Foundation:
 * - Ordering & Ziegler (2023): Government capacity to govern AI
 * - Maas (2019): How should we govern transformative AI?
 * - Schuett (2023): Three lines of defense against risks from AI
 *
 * Key Findings:
 * - High-capacity democracies: 1.5-2.5 years to understand breakthrough AI
 * - Authoritarian technocracies (China): 1-2 years (faster, centralized)
 * - Hybrid regimes: 3-5 years (bureaucratic + political gridlock)
 * - Low-capacity states: 5-8 years (limited technical expertise)
 *
 * @module policy/AIComprehensionLag
 */

import { Government } from '../core/Government.js';
import { GovernmentType } from '../core/GovernmentType.js';

/**
 * AI capability level
 */
export enum AICapabilityLevel {
  /** Current AI capabilities (GPT-4 level) */
  CURRENT = 0,

  /** Near-term AGI (human-level in most domains) */
  AGI = 1,

  /** Transformative AI (vastly superhuman) */
  TRANSFORMATIVE = 2,

  /** ASI (artificial superintelligence) */
  SUPERINTELLIGENCE = 3,
}

/**
 * Comprehension lag parameters by government type
 *
 * Research-backed values
 */
const COMPREHENSION_LAG_MONTHS = {
  [GovernmentType.PARLIAMENTARY_DEMOCRACY]: {
    base: 18, // 1.5 years
    variance: 12, // ±1 year
  },
  [GovernmentType.PRESIDENTIAL_DEMOCRACY]: {
    base: 24, // 2 years
    variance: 12, // ±1 year
  },
  [GovernmentType.SEMI_PRESIDENTIAL_DEMOCRACY]: {
    base: 20, // 1.67 years
    variance: 10,
  },
  [GovernmentType.AUTHORITARIAN_TECHNOCRACY]: {
    base: 15, // 1.25 years (China - faster centralized response)
    variance: 9,
  },
  [GovernmentType.HYBRID_REGIME]: {
    base: 42, // 3.5 years
    variance: 24, // ±2 years
  },
  [GovernmentType.THEOCRATIC_REPUBLIC]: {
    base: 54, // 4.5 years
    variance: 30,
  },
  [GovernmentType.ABSOLUTE_MONARCHY]: {
    base: 60, // 5 years
    variance: 36,
  },
} as const;

/**
 * Capability level multipliers
 *
 * More advanced capabilities take longer to understand
 */
const CAPABILITY_MULTIPLIERS = {
  [AICapabilityLevel.CURRENT]: 1.0,
  [AICapabilityLevel.AGI]: 1.5,
  [AICapabilityLevel.TRANSFORMATIVE]: 2.0,
  [AICapabilityLevel.SUPERINTELLIGENCE]: 3.0,
} as const;

/**
 * Calculate AI comprehension lag (months)
 *
 * How long until government understands new AI capability level
 *
 * @param government - Government agent
 * @param capabilityLevel - AI capability level
 * @param rng - Random number generator (0-1)
 * @returns Months until comprehension
 */
export function calculateAIComprehensionLag(
  government: Government,
  capabilityLevel: AICapabilityLevel,
  rng: () => number = Math.random
): number {
  // Get base lag for government type
  const lagParams = COMPREHENSION_LAG_MONTHS[government.type];
  const baseLag = lagParams.base;
  const variance = lagParams.variance;

  // Random variation
  const randomVariation = (rng() - 0.5) * 2 * variance;
  let lag = baseLag + randomVariation;

  // Capability level multiplier
  const capabilityMultiplier = CAPABILITY_MULTIPLIERS[capabilityLevel];
  lag *= capabilityMultiplier;

  // State capacity modifier
  // High state capacity (Singapore, Norway) = faster comprehension
  // Low state capacity (failed states) = slower comprehension
  const capacityMultiplier = 1.0 - (government.capacity.metrics.governmentEffectiveness * 0.2);
  lag *= capacityMultiplier;

  // Minimum: 3 months (even best governments need some time)
  // Maximum: 120 months (10 years)
  return Math.max(3, Math.min(120, Math.round(lag)));
}

/**
 * Calculate comprehension progress (0-1)
 *
 * How much does government understand about AI capability?
 *
 * @param monthsElapsed - Months since AI capability emerged
 * @param totalLag - Total comprehension lag (from calculateAIComprehensionLag)
 * @returns Comprehension level (0-1)
 */
export function calculateComprehensionProgress(
  monthsElapsed: number,
  totalLag: number
): number {
  if (monthsElapsed >= totalLag) {
    return 1.0; // Full comprehension
  }

  // Sigmoid curve: slow start, rapid middle, slow end
  // This matches learning curve research
  const x = monthsElapsed / totalLag;
  return 1 / (1 + Math.exp(-10 * (x - 0.5)));
}

/**
 * Check if government has comprehended AI capability
 *
 * @param monthsElapsed - Months since AI capability emerged
 * @param government - Government agent
 * @param capabilityLevel - AI capability level
 * @param threshold - Comprehension threshold (default: 0.8 = 80% understanding)
 * @param rng - Random number generator
 * @returns True if comprehension threshold reached
 */
export function hasComprehendedAI(
  monthsElapsed: number,
  government: Government,
  capabilityLevel: AICapabilityLevel,
  threshold: number = 0.8,
  rng: () => number = Math.random
): boolean {
  const totalLag = calculateAIComprehensionLag(government, capabilityLevel, rng);
  const progress = calculateComprehensionProgress(monthsElapsed, totalLag);
  return progress >= threshold;
}

/**
 * Get comprehension status description
 */
export function getComprehensionStatus(comprehensionProgress: number): string {
  if (comprehensionProgress >= 0.9) {
    return 'FULLY_COMPREHENDED';
  } else if (comprehensionProgress >= 0.7) {
    return 'SUBSTANTIALLY_COMPREHENDED';
  } else if (comprehensionProgress >= 0.5) {
    return 'PARTIALLY_COMPREHENDED';
  } else if (comprehensionProgress >= 0.3) {
    return 'EMERGING_UNDERSTANDING';
  } else if (comprehensionProgress >= 0.1) {
    return 'INITIAL_AWARENESS';
  } else {
    return 'UNAWARE';
  }
}

/**
 * Calculate policy response delay due to comprehension lag
 *
 * Governments can't respond effectively to AI threats they don't understand
 *
 * @param comprehensionProgress - Current comprehension (0-1)
 * @returns Response delay multiplier (1.0-5.0)
 */
export function calculateComprehensionDelayMultiplier(comprehensionProgress: number): number {
  if (comprehensionProgress >= 0.8) {
    return 1.0; // Full understanding, no delay
  } else if (comprehensionProgress >= 0.5) {
    return 1.5; // Partial understanding, 50% slower
  } else if (comprehensionProgress >= 0.3) {
    return 2.5; // Limited understanding, 2.5x slower
  } else {
    return 5.0; // Minimal understanding, 5x slower (essentially ineffective)
  }
}
