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

  // Crisis tracking
  resourceCrisisActive: boolean;    // Has resource crisis been triggered?
  pollutionCrisisActive: boolean;   // Has pollution crisis been triggered?
  climateCrisisActive: boolean;     // Has climate crisis been triggered?
  ecosystemCrisisActive: boolean;   // Has ecosystem crisis been triggered?

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
export interface SocialAccumulation {
  // Meaning crisis (starts low, rises with automation)
  meaningCrisisLevel: number;        // [0, 1] Work-identity collapse, existential despair

  // Institutional legitimacy (starts high, erodes without adaptation)
  institutionalLegitimacy: number;   // [0, 1] Government effectiveness, public trust

  // Social cohesion (starts moderate, depletes with inequality/isolation)
  socialCohesion: number;            // [0, 1] Community bonds, mutual aid, solidarity

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
