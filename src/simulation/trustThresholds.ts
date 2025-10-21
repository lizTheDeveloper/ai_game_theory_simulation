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
 * FIX #7A (Oct 19, 2025): Reduced rates by 10x - TOO CONSERVATIVE (created 20:1 asymmetry)
 * FIX #10 (Oct 20, 2025): Rebalanced to match historical resilience
 *
 * Key insight: Trust recovery must balance with decay to match historical patterns:
 * - Black Death (30-60% mortality) → Renaissance (recovery within 2-3 generations)
 * - WWII (3% global mortality) → Post-war boom (recovery within 5-10 years)
 * - COVID-19 (global pandemic) → Vaccine deployment (recovery within 2-3 years)
 *
 * Research: Technology adoption trust builds in 6-18 months (Rogers 2003, Bass diffusion)
 * Institutional scandal trust takes 3-7 years (Edelman). We're modeling adoption, not scandal.
 */

/** Trust recovery from education campaigns (+1%/month)
 * Research: Public education campaigns show 6-12 month effectiveness (WHO vaccine campaigns) */
export const TRUST_RECOVERY_FROM_EDUCATION = 0.01;

/** Trust recovery from demonstrated benefits (+2%/month)
 * Research: Tangible benefits build trust rapidly (ChatGPT: 0→100M users in 2 months) */
export const TRUST_RECOVERY_FROM_DEMONSTRATED_BENEFITS = 0.02;

/** Trust recovery from safety record (+1.5%/month)
 * Research: Consistent safety builds trust faster than education (aviation safety culture) */
export const TRUST_RECOVERY_FROM_SAFETY_RECORD = 0.015;

/** Trust recovery from improving performance (+2.5%/month)
 * Research: DORA (2024) - performance improvement most impactful for sustained trust
 * Real-world: GitHub Copilot went from skepticism to 92% satisfaction in 12 months */
export const TRUST_RECOVERY_FROM_PERFORMANCE = 0.025;

/** Maximum trust recovery per month (+7% cap)
 * Allows recovery from moderate incident (-10%) within 2-3 months with all factors active
 * Matches historical resilience: COVID vaccine trust built in 12 months despite initial skepticism */
export const TRUST_RECOVERY_CAP = 0.07;

/**
 * DECAY PARAMETERS
 * FIX #10 (Oct 20, 2025): Rebalanced decay to match recovery for realistic dynamics
 *
 * Research:
 * - Slovic (1993): "Trust is fragile" but NOT instantaneously destroyed
 * - Real-world: ChatGPT hallucinations didn't cause 10% trust drops per incident
 * - Real-world: Tesla Autopilot incidents (2016-2024) caused gradual skepticism, not collapse
 * - Real-world: Boeing 737 MAX crashes (2019) caused ~30% trust drop TOTAL (not per incident)
 *
 * Key insight: Major incidents cause ~20-30% trust loss, minor incidents cause ~3-5%
 * Current model: -10% per minor incident is catastrophic and unrealistic
 */

/** Trust decay from safety incident (-3% per incident)
 * Research: Minor AI errors (hallucinations, mistakes) cause concern but not panic
 * Boeing 737 MAX (2 crashes, 346 deaths) = -30% trust, not -10% per crash
 * Scaled proportionally: Minor AI incident = -3%, major catastrophe = -20% */
export const TRUST_DECAY_FROM_INCIDENT = 0.03;

/** Trust decay from detected misalignment (-2% per detection)
 * Research: Detection of concerning behavior raises alarms but doesn't instantly collapse trust
 * Real-world: AI bias discoveries (hiring, lending) caused incremental skepticism */
export const TRUST_DECAY_FROM_MISALIGNMENT = 0.02;

/** Trust decay from common mistakes (-0.5%/month if errors prevalent)
 * Research: Persistent low-level errors erode trust slowly (Windows updates, smartphone bugs)
 * Users adapt to imperfection if overall value remains high */
export const TRUST_DECAY_FROM_MISTAKES = 0.005;

/**
 * CAPABILITY FEAR PARAMETERS
 * Research: Only rapid changes cause fear, not absolute levels
 */

/** Capability change threshold for fear (>0.5/month triggers concern) */
export const CAPABILITY_CHANGE_FEAR_THRESHOLD = 0.5;

/** Maximum fear penalty from rapid capability growth (-30%) */
export const MAX_CAPABILITY_FEAR_PENALTY = 0.3;
