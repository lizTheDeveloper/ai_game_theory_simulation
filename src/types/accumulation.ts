// Accumulation System Types

/**
 * Golden Age State (Phase: Golden Age & Accumulation Systems)
 *
 * Tracks whether the simulation is in a "Golden Age" - immediate prosperity
 * that looks great but may be masking accumulating problems.
 *
 * Golden Age is a STATE, not an OUTCOME. The simulation continues running
 * to see if it transitions to Utopia (sustained) or Collapse (problems manifest).
 */
export interface GoldenAgeState {
  active: boolean;              // Are we currently in a Golden Age?
  entryMonth: number | null;    // When did the Golden Age begin?
  duration: number;             // How many months have we been in Golden Age?
  entryReason: string;          // Why did we enter Golden Age?
}

/**
 * Environmental Accumulation State (Phase 2: Environmental Accumulation)
 *
 * Tracks environmental costs that accumulate silently from production/growth,
 * then manifest as crises when thresholds are crossed.
 *
 * High production can maintain high QoL while secretly depleting reserves.
 * This creates the "Golden Age illusion" - prosperity masking accumulating debt.
 */
export interface EnvironmentalAccumulation {
  // Resource depletion (starts at 1.0, depletes toward 0)
  resourceReserves: number;     // [0, 1] Rare materials, minerals, etc.

  // Pollution accumulation (starts at 0, accumulates toward 1)
  pollutionLevel: number;       // [0, 1] Toxic waste, contamination

  // Climate degradation (starts at 1.0, degrades toward 0)
  climateStability: number;     // [0, 1] Weather patterns, temperature stability

  // Biodiversity loss (starts at 1.0, degrades toward 0)
  biodiversityIndex: number;    // [0, 1] Ecosystem health, species diversity

  // === POLLUTION PREVENTION FACTOR (Oct 27, 2025) ===
  // Research: EPA Green Chemistry Challenge - 830M lbs hazardous chemicals eliminated/year
  // Green chemistry (benign-by-design) prevents NEW pollution from entering system
  // Factor applied to pollution generation rate: 1.0 = baseline, 0.4 = 60% prevention
  // Tech: "Green Chemistry" reduces this multiplicatively (prevents future pollution)
  pollutionPreventionFactor: number;  // [0, 1] 1.0 = baseline, lower = more prevention

  // === GEOENGINEERING RISKS (Oct 27, 2025) ===
  // Research: Robock et al. (2008) - SAI could reduce Asian monsoon precipitation by 20%
  // Research: Tilmes et al. (2013) - SAI increases polar ozone depletion risk
  // Research: MacMartin et al. (2016) - Regional climate shifts from stratospheric intervention
  // These risks accumulate with deployment of risky geoengineering (Stratospheric Aerosol Injection)
  // Baseline 2025: 0 (no geoengineering deployed yet)
  monsoonDisruptionRisk: number;     // [0, 1] Risk of disrupting Asian/African monsoons
  ozoneDepletionRisk: number;        // [0, 1] Risk of stratospheric ozone depletion

  // Crisis tracking
  resourceCrisisActive: boolean;    // Has resource crisis been triggered?
  pollutionCrisisActive: boolean;   // Has pollution crisis been triggered?
  climateCrisisActive: boolean;     // Has climate crisis been triggered?
  ecosystemCrisisActive: boolean;   // Has ecosystem crisis been triggered?
  ecosystemCollapseActive?: boolean; // Alias for ecosystemCrisisActive (backward compatibility)

  // P0.6 (Oct 15, 2025): Active environmental shocks with persistence (AR1 autocorrelation)
  // Real disasters persist for 3-12 months (2003 heatwave, Somalia famine 2010-12)
  activeShocks?: Array<{
    type: 'climate' | 'famine' | 'disease' | 'ecosystem';  // Which mortality type affected
    magnitude: number;                                      // [1.5, 3.0] 150-300% mortality spike
    startMonth: number;                                     // When shock began
    duration: number;                                       // Total duration (3-12 months)
    remainingMonths: number;                                // Months left until shock ends
  }>;
}

/**
 * Social Cohesion & Meaning Crisis State (Phase 3: Social Accumulation)
 *
 * Tracks psychological and social costs from rapid automation and economic transition.
 * These accumulate slowly, then manifest as mental health collapse or social unrest.
 *
 * High QoL can mask eroding social fabric and meaning crisis.
 * UBI provides material security but doesn't solve work-identity collapse or institutional lag.
 */
/**
 * Social Cohesion Components (Multi-Paradigm DUI Phase 4-6)
 *
 * Decomposed into three indicators used across paradigm calculations:
 * - trust: Indigenous paradigm (40% weight)
 * - communityBonds: Indigenous paradigm (40% weight)
 * - civilLiberties: Western Liberal paradigm (30% weight)
 */
export interface SocialCohesionState {
  trust: number;            // [0, 100] Social trust (Indigenous)
  communityBonds: number;   // [0, 100] Community bonds, mutual aid (Indigenous)
  civilLiberties: number;   // [0, 100] Civil liberties, freedoms (Western Liberal)
}

export interface SocialAccumulation {
  // Meaning crisis (starts low, rises with automation)
  meaningCrisisLevel: number;        // [0, 1] Work-identity collapse, existential despair

  // Institutional legitimacy (starts high, erodes without adaptation)
  institutionalLegitimacy: number;   // [0, 1] Government effectiveness, public trust

  // Social cohesion (now object with three components for Multi-Paradigm DUI)
  socialCohesion: SocialCohesionState;

  // Cultural adaptation (starts low, improves slowly)
  culturalAdaptation: number;        // [0, 1] New meaning frameworks, post-work culture

  // Crisis tracking
  meaningCollapseActive: boolean;        // Has meaning crisis triggered collapse?
  institutionalFailureActive: boolean;   // Has government failure occurred?
  socialUnrestActive: boolean;           // Has widespread unrest erupted?
}

/**
 * Technological Risk State (Phase 4: Technological Risk Accumulation)
 *
 * Tracks risks from fast AI capability growth and technology deployment.
 * These compound silently, then suddenly manifest as catastrophic events.
 *
 * Golden Age prosperity can create complacency, reducing vigilance while risks accumulate.
 * Fast capability growth without proportional safety research creates "safety debt".
 */
export interface TechnologicalRisk {
  // Misalignment risk (starts low, rises with capability growth)
  misalignmentRisk: number;         // [0, 1] Probability of catastrophic AI action

  // Safety debt (accumulates when capability > safety research)
  safetyDebt: number;               // [0, 1] Gap between capability and safety understanding

  // Concentration risk (rises with market consolidation)
  concentrationRisk: number;        // [0, 1] Single point of failure risk

  // Complacency (rises in Golden Age, reduces vigilance)
  complacencyLevel: number;         // [0, 1] "Everything is fine" blindness

  // Crisis tracking
  controlLossActive: boolean;       // Has AI control been lost?
  corporateDystopiaActive: boolean; // Has corporate feudalism emerged?
  complacencyCrisisActive: boolean; // Has safety lapse occurred?

  // TIER 2: Interpretability effects propagation (Architecture Review M1 - Oct 27, 2025)
  // Tracks fraction of control losses prevented by interpretability ensemble
  // Used by downstream systems (extinction risk, crisis detection) to query mitigation status
  controlLossPreventionRate?: number; // [0, 1] Fraction of control losses prevented

  // AI Control Gap (Oct 28, 2025) - Governance metric
  // Tracks divergence between AI capabilities and human oversight mechanisms
  // This is a METRIC about governance, not a direct harm measure
  // Used for UI display and paradigm-specific scoring (Western Liberal values oversight)
  aiControlGap?: number; // [0, 1] Gap between capability and control (0 = full control, 1 = no control)
}

/**
 * Psychological Trauma State (Phase 1B Refinement - Oct 17, 2025)
 *
 * Models long-term psychological impact of mass death events on survivors
 * - Trauma accumulates during mass casualty events (>10% monthly mortality)
 * - Reduces QoL (psychological and social dimensions)
 * - Recovery occurs over time but leaves lasting scars
 * - Intergenerational transmission (future feature)
 *
 * Research:
 * - Wilkinson & Pickett (2009): Extreme disruption (>20% mortality) causes decades of trauma
 * - PTSD literature: 40-60% PTSD rates in survivors of mass casualty events
 * - Diamond (2005): >50% mortality leads to institutional breakdown lasting generations
 */
export interface PsychologicalTraumaState {
  traumaLevel: number;                  // [0,1] Cumulative psychological burden
  monthsSinceLastMassEvent: number;     // Recovery time counter
  generationalTrauma: number;           // [0,1] Affects children (future feature)
  mentalHealthInfrastructure: number;   // [0,1] Capacity to treat (starts at 0.5)
  massDeathEvents: number;              // Count of >10% monthly mortality events
  lastEventSeverity: number;            // [0,1] Severity of most recent event
}
