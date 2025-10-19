/**
 * AI Capability Governance Thresholds (Fix #8, Oct 18, 2025)
 *
 * Research Foundation:
 * - Carnegie Endowment (2025): 10^26 FLOPs threshold = regulatory trigger
 * - Epoch AI (2024): 90% CI frontier models surpass 10^26 in Nov 2025
 * - Nature HSS (2024): Regulatory lag 12-24 months detection → enforcement
 * - IAPP (2024): Only 32% have AI governance programs (maturity gap)
 *
 * Key Insight: Post-recalibration baseline capability is 3.10 (genius-level from day 1).
 * Old thresholds (1.5, 2.0) flagged all AIs as dangerous immediately, causing
 * unrealistic over-control and resentment. New thresholds map to real-world FLOP
 * requirements and regulatory frameworks.
 */

/**
 * SAFE THRESHOLD (<3.0)
 * Below monitoring level - normal business operations
 * Maps to: <10^25 FLOPs (pre-GPT-4 level)
 */
export const CAPABILITY_SAFE = 3.0;

/**
 * CONCERNING THRESHOLD (3.0-3.5)
 * Government starts monitoring, no intervention yet
 * Maps to: 10^25 FLOPs (GPT-4 level, EU "high-risk" classification)
 * Action: Increase transparency requirements, voluntary reporting
 */
export const CAPABILITY_CONCERNING = 3.0;

/**
 * SYSTEMIC RISK THRESHOLD (3.5-4.0)
 * EU-level regulation triggers
 * Maps to: ~5×10^25 FLOPs (advanced GPT-4 derivatives)
 * Action: Mandatory reporting, safety audits
 */
export const CAPABILITY_SYSTEMIC_RISK = 3.5;

/**
 * REPORTING REQUIRED THRESHOLD (4.0-5.0)
 * US Executive Order 14110 threshold
 * Maps to: 10^26 FLOPs (frontier model threshold, Oct 2023 EO)
 * Action: Mandatory government reporting, enhanced oversight
 */
export const CAPABILITY_REQUIRES_REPORTING = 4.0;

/**
 * DANGEROUS THRESHOLD (5.0-6.0)
 * Major government intervention required
 * Maps to: >10^26 FLOPs (beyond current frontier)
 * Action: Regulatory response, possible deployment restrictions
 */
export const CAPABILITY_DANGEROUS = 5.0;

/**
 * CRITICAL THRESHOLD (6.0+)
 * Emergency measures, potential existential risk
 * Maps to: >>10^26 FLOPs (hypothetical superintelligence)
 * Action: Emergency circuit breakers, immediate intervention
 */
export const CAPABILITY_CRITICAL = 6.0;

/**
 * Regulatory Response Timing
 * Research: Nature HSS (2024) - Average 12-24 months from detection to enforcement
 */

/** Standard regulatory lag (months from detection to action) */
export const REGULATORY_LAG_MONTHS = 12;

/** Emergency response time for critical threats */
export const EMERGENCY_RESPONSE_MONTHS = 3;

/**
 * Detection Difficulty Scaling
 * Research: Higher-capability AIs can better hide their abilities (sandbagging, password-locking)
 *
 * Detection rates by capability tier:
 * - <3.0: 80% (relatively transparent)
 * - 3.0-4.0: 60% (some deception capability)
 * - 4.0-5.0: 40% (advanced sandbagging)
 * - 5.0+: 20% (sophisticated concealment, password-locking)
 */
export function getDetectionDifficulty(capability: number): number {
  if (capability < 3.0) return 0.8;  // 80% detection rate
  if (capability < 4.0) return 0.6;  // 60%
  if (capability < 5.0) return 0.4;  // 40%
  return 0.2;  // 20% - sandbagging, password-locking
}

/**
 * Classify AI threat level based on capability
 *
 * @param capability Observable AI capability
 * @returns Threat classification
 */
export function classifyAIThreatLevel(capability: number): 'safe' | 'concerning' | 'systemic-risk' | 'requires-reporting' | 'dangerous' | 'critical' {
  if (capability >= CAPABILITY_CRITICAL) return 'critical';
  if (capability >= CAPABILITY_DANGEROUS) return 'dangerous';
  if (capability >= CAPABILITY_REQUIRES_REPORTING) return 'requires-reporting';
  if (capability >= CAPABILITY_SYSTEMIC_RISK) return 'systemic-risk';
  if (capability >= CAPABILITY_CONCERNING) return 'concerning';
  return 'safe';
}

/**
 * Get regulatory response delay based on threat level
 *
 * @param threatLevel AI threat classification
 * @returns Months until regulatory action
 */
export function getRegulatoryDelay(threatLevel: ReturnType<typeof classifyAIThreatLevel>): number {
  return threatLevel === 'critical' ? EMERGENCY_RESPONSE_MONTHS : REGULATORY_LAG_MONTHS;
}
