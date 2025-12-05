/**
 * Multi-Timescale Climate Tipping Points System
 *
 * Research-backed tipping elements with gradual transitions over realistic timescales.
 * Replaces instant climate catastrophe with nuanced, multi-decade transitions.
 *
 * Key Citations:
 * - Armstrong McKay et al. (2022) Science - Global tipping point analysis
 * - Lenton et al. (2023) Science - Updated tipping threshold estimates
 * - IPCC AR6 WG1 (2021) - Chapter 8, tipping elements
 */

/**
 * Individual tipping point element with transition dynamics
 */
export interface TippingElement {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Trigger condition: global mean temperature increase (degrees C above 1850-1900) */
  triggerTempC: number;

  /** Has this element been triggered? (threshold crossed) */
  triggered: boolean;

  /** Months since trigger (0 if not triggered) */
  monthsSinceTrigger: number;

  /** Transition timescale: minimum months from trigger to full state change */
  transitionMinMonths: number;

  /** Transition timescale: maximum months from trigger to full state change */
  transitionMaxMonths: number;

  /** Current progress through transition (0.0 = not started, 1.0 = complete) */
  progress: number;

  /** Impact on climate stability when fully transitioned (-0.X reduction) */
  impactClimateStability: number;

  /** Impact on habitability when fully transitioned (-0.X reduction) */
  impactHabitability: number;

  /** Impact on food security when fully transitioned (-0.X reduction) */
  impactFoodSecurity: number;

  /** Impact on freshwater when fully transitioned (-0.X reduction) */
  impactFreshwater: number;

  /** Regional impact differentials (region name -> multiplier, 1.0 = global average) */
  regionalImpacts: Record<string, number>;

  /** Can this element cascade with others? */
  cascades: boolean;

  /** === RECOVERY PARAMETERS (Nov 22, 2025) === */
  /** Recovery half-life in years (for asymptotic recovery after intervention) */
  recoveryHalfLife?: number;

  /** Minimum asymptotic value (floor below which recovery cannot proceed) */
  minimumAsymptoticValue?: number;

  /** === THRESHOLD LOWERING (Nov 23, 2025) === */
  /**
   * Effective threshold reduction from other tipped elements (degrees C)
   * Research: Wunderling et al. (2024) ESD - "combined effect tending to lower temperature thresholds"
   * Armstrong McKay et al. (2022) Science - network of 16 tipping elements with causal interactions
   *
   * This value is SUBTRACTED from triggerTempC to get the effective threshold
   * Example: If triggerTempC=2.0 and effectiveThresholdReduction=0.3, effective threshold is 1.7C
   */
  effectiveThresholdReduction?: number;

  /** === MARINE ICE SHEET INSTABILITY (M-4, Dec 5, 2025) === */
  /**
   * Marine Ice Cliff Instability (MICI) dynamics for ice sheets
   * Research: DeConto & Pollard (2016, 2021) Nature, Edwards et al. (2019) Nature
   * Only relevant for WAIS and Greenland (marine-based ice sheets)
   */
  marineInstabilityRisk?: {
    /** Probability of MICI triggering per month (once temperature threshold met) */
    miciProbability: number;
    /** Has MICI been triggered? */
    miciTriggered: boolean;
    /** Accelerated collapse rate (mm/year sea level equivalent) if MICI active */
    miciCollapseRate: number; // 3-10 mm/year per research
    /** Total potential contribution (meters) */
    totalContributionM: number; // 3.3m WAIS, 7.4m Greenland
    /** Current contribution from abrupt collapse (meters) */
    currentContributionM: number;
  };
}

/**
 * Global tipping point system state
 */
export interface TippingPointSystem {
  /** All tipping elements tracked */
  elements: TippingElement[];

  /** Number of elements currently triggered */
  triggeredCount: number;

  /** Number of elements fully transitioned (progress >= 1.0) */
  completedCount: number;

  /** Aggregate progress across all active elements (0.0-1.0) */
  totalProgress: number;

  /** Cascade amplification factor (1.0 = no cascade, >1.0 = multiple active) */
  cascadeMultiplier: number;

  /** Historical log of tipping point triggers */
  triggers: Array<{
    elementId: string;
    monthTriggered: number;
    tempAtTrigger: number;
  }>;
}

/**
 * Six major climate tipping elements with research-backed parameters
 *
 * Sources (traced to original modeling papers):
 * - AMOC: Weijer et al. (2020) GRL [27 CMIP6 models], Van Westen et al. (2024) Science Advances [first ESM collapse],
 *   Qin et al. (2025) Nature [34 models resilience]. Synthesis: Armstrong McKay et al. (2022) Science.
 *   See: research/amoc_tipping_point_original_sources_20251120.md
 * - Amazon: Boulton et al. (2022) Nature Climate - 30-80yr dieback
 * - Arctic: IPCC AR6 WG1 - 10-30yr ice-free transition
 * - Permafrost: Burke et al. (2020) Nature Geosci - 50-300yr thaw
 * - WAIS: DeConto & Pollard (2016) Nature - 500-13000yr collapse
 * - Greenland: Robinson et al. (2012) Nature Climate - 1000-15000yr loss
 */
export const TIPPING_ELEMENTS: Omit<TippingElement, 'triggered' | 'monthsSinceTrigger' | 'progress'>[] = [
  {
    id: 'amoc',
    name: 'Atlantic Meridional Overturning Circulation (AMOC)',
    // RECALIBRATED (Nov 24, 2025): Changed from 1.7°C (2.5th percentile) to 4.0°C (median estimate)
    // Sylvia audit: reviews/mechanism_audit_tipping_cascades_20251124.md
    // Sources: Armstrong McKay (2022) Science - central estimate 4°C (range 1.4-8°C)
    // Baker et al. (2025) Nature - 34/35 CMIP6 models show AMOC resilience, Southern Ocean compensation
    // See: research/amoc_tipping_point_original_sources_20251120.md
    triggerTempC: 4.0, // Median estimate (range 1.4-8°C). Previous 1.7°C used extreme lower bound.
    transitionMinMonths: 600,    // 50 years - Van Westen et al. (2024) Science Advances: 100yr collapse in CESM1
    transitionMaxMonths: 3600,   // 300 years - Liu et al. (2017) Science Advances: collapse within 300yr after CO2 doubling
                                 // Range: 15-300yr captures deep uncertainty. See: research/amoc_tipping_point_original_sources_20251120.md
    impactClimateStability: -0.15,
    impactHabitability: -0.08,
    impactFoodSecurity: -0.12,
    impactFreshwater: -0.10,
    regionalImpacts: {
      'Europe': 1.4,           // 40% stronger impact
      'North America': 1.2,
      'Latin America': 0.8,
      'Africa': 1.0,
      'Asia': 0.6,
      'Oceania': 0.5
    },
    cascades: true,
    // === RECOVERY PARAMETERS (M-7, Dec 5, 2025) ===
    // Research: Westen et al. (2023) - AMOC recovery FASTER than collapse (controversial finding)
    // Validation: reviews/m4_m7_research_validation_20251205.md - "6x faster is model-specific, use 1-6x range"
    // Using 3x faster as median estimate (100yr collapse → 33yr recovery)
    recoveryHalfLife: 33,            // Years (median of 1-6x faster range: 50-600yr collapse → 8-600yr recovery)
    minimumAsymptoticValue: 0.10,    // 10% residual circulation changes (weak hysteresis per research)
  },
  {
    id: 'amazon',
    name: 'Amazon Rainforest Dieback',
    triggerTempC: 2.3, // Armstrong McKay: 2.0-2.5°C
    transitionMinMonths: 360,    // 30 years (Boulton et al. 2022)
    transitionMaxMonths: 960,    // 80 years
    impactClimateStability: -0.12,
    impactHabitability: -0.06,
    impactFoodSecurity: -0.08,
    impactFreshwater: -0.14,
    regionalImpacts: {
      'Europe': 0.5,
      'North America': 0.7,
      'Latin America': 1.5,     // 50% stronger impact
      'Africa': 0.9,
      'Asia': 0.8,
      'Oceania': 0.6
    },
    cascades: true,
    // === RECOVERY PARAMETERS (Nov 22, 2025) ===
    // Research: Drüke et al. (2024) - Amazon recovery 650 years (300-1000 range)
    // Post-dieback: 25% of rainforest converts to savanna (irreversible)
    recoveryHalfLife: 650,           // Years for half-life exponential recovery
    minimumAsymptoticValue: 0.25,    // 25% irreversible savanna conversion
  },
  {
    id: 'arctic_ice',
    name: 'Arctic Sea Ice Loss',
    triggerTempC: 1.5, // Armstrong McKay: 1.0-2.0°C (already near threshold)
    transitionMinMonths: 120,    // 10 years (IPCC AR6)
    transitionMaxMonths: 360,    // 30 years
    impactClimateStability: -0.10,
    impactHabitability: -0.05,
    impactFoodSecurity: -0.04,
    impactFreshwater: -0.03,
    regionalImpacts: {
      'Europe': 1.2,
      'North America': 1.3,
      'Latin America': 0.4,
      'Africa': 0.3,
      'Asia': 1.1,
      'Oceania': 0.4
    },
    cascades: false // Armstrong McKay et al. (2022) - Arctic summer sea ice is a "seasonal event" not a tipping point with irreversible threshold
  },
  {
    id: 'permafrost',
    name: 'Permafrost Carbon Release',
    triggerTempC: 1.8, // Armstrong McKay: 1.5-2.0°C
    transitionMinMonths: 600,    // 50 years (Burke et al. 2020)
    transitionMaxMonths: 3600,   // 300 years
    impactClimateStability: -0.18, // Strong positive feedback
    impactHabitability: -0.04,
    impactFoodSecurity: -0.05,
    impactFreshwater: -0.06,
    regionalImpacts: {
      'Europe': 1.1,
      'North America': 1.4,     // Strongest in Arctic regions
      'Latin America': 0.3,
      'Africa': 0.3,
      'Asia': 1.3,
      'Oceania': 0.2
    },
    cascades: true,
    // === RECOVERY PARAMETERS (Nov 22, 2025) ===
    // Research: Drüke et al. (2024) - Permafrost recovery 350 years (200-500 range)
    // Post-thaw: 20% of carbon remains in atmosphere (irreversible release)
    recoveryHalfLife: 350,           // Years for half-life exponential recovery
    minimumAsymptoticValue: 0.20,    // 20% irreversible carbon release floor
  },
  {
    id: 'wais',
    name: 'West Antarctic Ice Sheet (WAIS) Collapse',
    // M-4 (Dec 5, 2025): VALIDATION ADJUSTMENT - probabilistic 1.0-2.0C threshold
    // Research: Garbe et al. (2020) "may already be committed", Global Tipping Points Report "likely passes at 1.5C"
    // validation: reviews/m4_m7_research_validation_20251205.md
    triggerTempC: 1.5, // Median of 1.0-2.0C range (was 2.0C fixed, overly confident per validation)
    transitionMinMonths: 24000,  // 2,000 years - lower bound adjusted from 500yr per Edwards et al. (2019) MICI revision (60% reduction in sea level projections)
    transitionMaxMonths: 156000, // 13,000 years (very slow)
    impactClimateStability: -0.08,
    impactHabitability: -0.12,   // Sea level rise
    impactFoodSecurity: -0.06,
    impactFreshwater: -0.10,     // Coastal aquifer intrusion
    regionalImpacts: {
      'Europe': 1.0,
      'North America': 1.1,
      'Latin America': 0.9,
      'Africa': 0.8,
      'Asia': 1.2,              // Dense coastal populations
      'Oceania': 1.5            // Island nations most vulnerable
    },
    cascades: false, // Too slow to cascade effectively
    // === RECOVERY PARAMETERS (Nov 24, 2025) ===
    // Research: Drüke et al. (2024) - Ice sheet recovery 100-800 years
    // Roadmap item #4: Planetary Restoration Timescales Audit
    // Post-collapse: 40% of ice loss is irreversible on human timescales (marine-based sections)
    recoveryHalfLife: 450,           // Years for half-life exponential recovery (median of 100-800 range)
    minimumAsymptoticValue: 0.40,    // 40% irreversible ice loss floor (marine-based sections)
    // === MARINE ICE SHEET INSTABILITY (M-4, Dec 5, 2025) ===
    // Research: DeConto & Pollard (2016, 2021), Edwards et al. (2019) - MICI controversy
    // Validation: reviews/m4_m7_research_validation_20251205.md - "MICI uncertainty well-handled"
    marineInstabilityRisk: {
      miciProbability: 0.001,      // 0.1% per month after threshold (~10% per 100 months), low due to Edwards revision
      miciTriggered: false,
      miciCollapseRate: 6.5,       // mm/year (median of 3-10 range from research)
      totalContributionM: 3.3,     // meters total WAIS contribution
      currentContributionM: 0      // starts at 0, accumulates if MICI triggers
    }
  },
  {
    id: 'greenland',
    name: 'Greenland Ice Sheet Loss',
    triggerTempC: 1.6, // Armstrong McKay: 1.5-2.0°C (possibly already triggered)
    transitionMinMonths: 12000,  // 1,000 years (Robinson et al. 2012)
    transitionMaxMonths: 180000, // 15,000 years (extremely slow)
    impactClimateStability: -0.09,
    impactHabitability: -0.11,   // Sea level rise
    impactFoodSecurity: -0.05,
    impactFreshwater: -0.08,     // Coastal impacts
    regionalImpacts: {
      'Europe': 1.2,            // Atlantic coastlines
      'North America': 1.3,
      'Latin America': 0.8,
      'Africa': 0.7,
      'Asia': 1.0,
      'Oceania': 1.1
    },
    cascades: false, // Too slow to cascade effectively
    // === RECOVERY PARAMETERS (Nov 24, 2025) ===
    // Research: Drüke et al. (2024) - Ice sheet recovery 100-800 years
    // Roadmap item #4: Planetary Restoration Timescales Audit
    // Post-collapse: 35% of ice loss is irreversible on human timescales (lower-elevation coastal sections)
    recoveryHalfLife: 400,           // Years for half-life exponential recovery (slightly faster than WAIS due to different geometry)
    minimumAsymptoticValue: 0.35,    // 35% irreversible ice loss floor (lower-elevation coastal sections)
    // === MARINE ICE SHEET INSTABILITY (M-4, Dec 5, 2025) ===
    // Research: Same as WAIS - marine-based sections vulnerable to MICI
    marineInstabilityRisk: {
      miciProbability: 0.0008,     // Slightly lower than WAIS (less marine-based)
      miciTriggered: false,
      miciCollapseRate: 5.0,       // mm/year (lower than WAIS, less unstable geometry)
      totalContributionM: 7.4,     // meters total Greenland contribution
      currentContributionM: 0      // starts at 0, accumulates if MICI triggers
    }
  }
];

/**
 * Tipping Element Interaction Matrix (Nov 23, 2025)
 *
 * Research-backed threshold lowering effects when one tipping element tips another.
 *
 * Sources:
 * - Armstrong McKay et al. (2022) Science - Network of 16 tipping elements with causal interactions
 * - Wunderling et al. (2024) Earth System Dynamics - "combined effect tending to lower temperature thresholds"
 * - Climate tipping points research file: research/climate_tipping_points_2024_2025_20251116.md
 *
 * Format: source_id -> target_id -> threshold_reduction_C
 *
 * Magnitude Justification (Wunderling et al. 2024):
 * - Direct interactions (e.g., ice sheet -> AMOC): 0.2-0.4 C reduction
 * - Indirect interactions (e.g., Arctic ice -> Amazon): 0.1-0.2 C reduction
 * - Weak interactions: 0.05-0.1 C reduction
 *
 * Conservative estimates used (lower end of ranges) to avoid over-catastrophizing.
 */
export interface TippingInteraction {
  /** Source element that tips first */
  sourceId: string;
  /** Target element whose threshold is lowered */
  targetId: string;
  /** Threshold reduction in degrees C */
  thresholdReduction: number;
  /** Mechanism description */
  mechanism: string;
}

/**
 * Research-backed tipping element interactions
 *
 * Cascade Sequences (research/climate_tipping_points_2024_2025_20251116.md Section 4.1):
 * 1. Arctic ice loss -> albedo feedback -> Arctic amplification
 * 2. Arctic amplification -> Greenland melt -> freshwater influx
 * 3. Freshwater influx -> AMOC weakening -> tropical rainfall shift
 * 4. Tropical rainfall shift -> Amazon drying -> rainforest dieback
 *
 * Ice sheet interactions (research/amoc_tipping_point_original_sources_20251120.md):
 * - Greenland melt -> freshwater -> AMOC (Weijer et al. 2020, Van Westen et al. 2024)
 * - AMOC collapse -> reduced heat transport -> accelerated Greenland melt (positive feedback)
 */
export const TIPPING_INTERACTIONS: TippingInteraction[] = [
  // === ARCTIC ICE -> OTHER ELEMENTS ===
  // Arctic ice loss accelerates Arctic amplification, affecting other elements
  {
    sourceId: 'arctic_ice',
    targetId: 'permafrost',
    thresholdReduction: 0.2, // Arctic amplification directly heats permafrost regions
    mechanism: 'Arctic amplification: 4x warming in Arctic region accelerates permafrost thaw'
  },
  {
    sourceId: 'arctic_ice',
    targetId: 'greenland',
    thresholdReduction: 0.15, // Albedo feedback accelerates Greenland surface melt
    mechanism: 'Albedo feedback: reduced ice cover increases regional warming'
  },

  // === GREENLAND -> AMOC ===
  // Greenland melt provides freshwater that destabilizes AMOC
  // Research: Van Westen et al. (2024) - freshwater hosing experiments
  {
    sourceId: 'greenland',
    targetId: 'amoc',
    thresholdReduction: 0.3, // Direct physical mechanism: freshwater reduces AMOC stability
    mechanism: 'Freshwater influx: Greenland melt reduces North Atlantic salinity, weakening AMOC'
  },

  // === PERMAFROST -> CLIMATE ELEMENTS ===
  // Permafrost thaw releases methane and CO2, amplifying warming
  {
    sourceId: 'permafrost',
    targetId: 'amazon',
    thresholdReduction: 0.15, // Methane feedback accelerates global warming
    mechanism: 'Carbon feedback: permafrost methane/CO2 release accelerates global warming'
  },
  {
    sourceId: 'permafrost',
    targetId: 'greenland',
    thresholdReduction: 0.1, // Indirect via global warming
    mechanism: 'Carbon feedback: accelerated global warming from permafrost carbon release'
  },

  // === AMOC -> TROPICAL SYSTEMS ===
  // AMOC collapse shifts tropical rainfall patterns
  {
    sourceId: 'amoc',
    targetId: 'amazon',
    thresholdReduction: 0.25, // AMOC collapse disrupts Amazon rainfall
    mechanism: 'Monsoon disruption: AMOC collapse shifts ITCZ southward, reducing Amazon rainfall'
  },

  // === AMAZON -> GLOBAL CLIMATE ===
  // Amazon dieback releases stored carbon
  {
    sourceId: 'amazon',
    targetId: 'permafrost',
    thresholdReduction: 0.1, // Carbon feedback accelerates warming
    mechanism: 'Carbon feedback: Amazon carbon release (~150 Gt C) accelerates global warming'
  },

  // === WAIS/GREENLAND ICE SHEET INTERACTIONS ===
  // These are slow but can interact
  {
    sourceId: 'greenland',
    targetId: 'wais',
    thresholdReduction: 0.1, // Sea level feedback affects ice sheet stability
    mechanism: 'Sea level feedback: Greenland-driven sea level rise affects WAIS grounding lines'
  },
  {
    sourceId: 'wais',
    targetId: 'greenland',
    thresholdReduction: 0.1, // Mutual sea level/climate feedback
    mechanism: 'Climate feedback: WAIS collapse accelerates global warming via albedo and ocean circulation'
  },
];
