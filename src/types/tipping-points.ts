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
    triggerTempC: 1.7, // Central estimate 4°C (range 1.4-8°C) from Armstrong McKay (2022) synthesizing Weijer et al. (2020), Van Westen et al. (2024)
                       // See: research/amoc_tipping_point_original_sources_20251120.md
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
    cascades: true
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
    triggerTempC: 2.0, // Armstrong McKay: 1.5-3.0°C
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
    cascades: false // Too slow to cascade effectively
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
    cascades: false // Too slow to cascade effectively
  }
];
