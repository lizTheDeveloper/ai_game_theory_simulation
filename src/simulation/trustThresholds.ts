/**
 * Trust Thresholds - Research-Backed Constants
 * FIX #2 (Oct 18, 2025): Decouple trust from AI capability
 * FIX #2A (Oct 19, 2025): Evidence-based trust model (explainability → performance)
 *
 * Research Foundation:
 * - University of Melbourne + KPMG (2025): 46% trust AI globally, 48K-person survey
 *   → Key drivers: PERFORMANCE/reliability > tangible benefits > track record
 * - Siala & Wang (2024): Trust threshold 0.6 = acceptance (3.0 on 5-point Likert scale)
 * - Edelman (2024): High-trust companies 2.6x more likely to have successful AI adoption
 *   → Trust built through: demonstrated value + consistency + outcome transparency
 * - DORA (2024): Developer productivity correlates with trust in RESULTS, not understanding of internals
 *   → +49% output quality perception from performance feedback (not process explanations)
 *   → +52% privacy understanding from outcome transparency
 * - Scientific Reports (2024): "Interpretability does not significantly improve trust,
 *   while outcome feedback has a more reliable and positive impact"
 * - McKinsey (2024): 40% identify explainability as a RISK (reveals concerning logic)
 * - CHI (2024): Explainability effect context-dependent and often NEGATIVE in high-stakes domains
 *
 * Key insight: Trust depends on PERFORMANCE (how well AI works), OUTCOMES (benefits, safety),
 * NOT on explainability or capability level. People prefer "it works" over "here's why it works."
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
 * FIX #2A: Removed explainability (contradicts research), added performance
 * FIX #7A (Oct 19, 2025): Reduced rates by 10x (research shows 3-7 YEARS for trust restoration)
 *
 * Key insight: Trust loss is FAST (exponential), recovery is SLOW (logarithmic)
 * Research: Betrayal aversion persists for years, not months
 */

/** Trust recovery from education campaigns (+0.1%/month, not 1%)
 * 3-7 years to recover trust after breach = ~0.1-0.2%/month */
export const TRUST_RECOVERY_FROM_EDUCATION = 0.001;

/** Trust recovery from demonstrated benefits (+0.2%/month, not 2%)
 * Even tangible benefits take years to rebuild trust */
export const TRUST_RECOVERY_FROM_DEMONSTRATED_BENEFITS = 0.002;

/** Trust recovery from safety record (+0.15%/month, not 1.5%)
 * Incident-free operation builds trust slowly over time */
export const TRUST_RECOVERY_FROM_SAFETY_RECORD = 0.0015;

/** Trust recovery from improving performance (+0.25%/month, not 2.5%)
 * Research: DORA (2024) - performance improvement most impactful, but still slow
 * Even best driver takes 3-4 years to fully recover */
export const TRUST_RECOVERY_FROM_PERFORMANCE = 0.0025;

/** Maximum trust recovery per month (+0.5% cap, not 5%)
 * FIX #7A: Realistic recovery timescale (years, not months) */
export const TRUST_RECOVERY_CAP = 0.005;

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
