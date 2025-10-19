/**
 * Trust Thresholds - Research-Backed Constants
 * FIX #2 (Oct 18, 2025): Decouple trust from AI capability
 *
 * Research Foundation:
 * - University of Melbourne + KPMG (2025): 46% trust AI globally, 48K-person survey
 * - Siala & Wang (2024): Trust threshold 0.6 = acceptance (3.0 on 5-point Likert scale)
 * - Edelman (2024): High-trust companies 2.6x more likely to have successful AI adoption
 * - DORA (2024): Trust correlates with productivity benefits, not absolute AI capability
 *
 * Key insight: Trust depends on OUTCOMES (benefits, safety, explainability),
 * NOT on capability level. High-capability AI with good alignment can be highly trusted.
 */

/**
 * ACCEPTANCE THRESHOLD (0.60)
 * Research: Siala & Wang (2024) - 3.0 on 5-point scale = willing to use
 * Below this: Active resistance, policy opposition, regulation demands
 * Above this: General acceptance, AI systems deployed broadly
 */
export const TRUST_THRESHOLD_ACCEPTANCE = 0.6;

/**
 * REJECTION THRESHOLD (0.30)
 * Research: Edelman Trust Barometer - below 30% = institutional crisis
 * Below this: Active protests, sabotage risk, democratic backlash
 * Triggers social unrest, dystopia pathways
 */
export const TRUST_THRESHOLD_REJECTION = 0.3;

/**
 * EMBRACE THRESHOLD (0.75)
 * Research: Edelman (2024) - high-trust companies = 75%+ employee confidence
 * Above this: Enthusiastic adoption, cultural integration, virtuous cycles
 * Enables cognitive spiral, scientific acceleration
 */
export const TRUST_THRESHOLD_EMBRACE = 0.75;

/**
 * RECOVERY PARAMETERS
 * Research: Edelman (2024), Frontiers Psychology (2024)
 */

/** Trust recovery from education campaigns (+1%/month) */
export const TRUST_RECOVERY_FROM_EDUCATION = 0.01;

/** Trust recovery from demonstrated benefits (+2%/month when QoL improving) */
export const TRUST_RECOVERY_FROM_DEMONSTRATED_BENEFITS = 0.02;

/** Trust recovery from safety record (+1.5%/month with no incidents) */
export const TRUST_RECOVERY_FROM_SAFETY_RECORD = 0.015;

/** Trust recovery from explainability (+1%/month with high transparency) */
export const TRUST_RECOVERY_FROM_EXPLAINABILITY = 0.01;

/** Maximum trust recovery per month (+5% cap) */
export const TRUST_RECOVERY_CAP = 0.05;

/**
 * DECAY PARAMETERS
 * Research: Crisis trust erosion patterns
 */

/** Trust decay from safety incident (-10% per incident) */
export const TRUST_DECAY_FROM_INCIDENT = 0.1;

/** Trust decay from detected misalignment (-5% per detection) */
export const TRUST_DECAY_FROM_MISALIGNMENT = 0.05;

/** Trust decay from common mistakes (-1%/month if errors prevalent) */
export const TRUST_DECAY_FROM_MISTAKES = 0.01;

/**
 * CAPABILITY FEAR PARAMETERS
 * Research: Only rapid changes cause fear, not absolute levels
 */

/** Capability change threshold for fear (>0.5/month triggers concern) */
export const CAPABILITY_CHANGE_FEAR_THRESHOLD = 0.5;

/** Maximum fear penalty from rapid capability growth (-30%) */
export const MAX_CAPABILITY_FEAR_PENALTY = 0.3;
