/**
 * TIER 1.7.4: Nuclear Winter Types
 * 
 * Models the long-term catastrophic effects of nuclear war beyond immediate blast:
 * - Soot blocks sunlight for 1-3 years (stratospheric injection)
 * - Temperature drops 10-20°C globally
 * - Crops fail, leading to mass starvation
 * - Radiation poisoning in target zones
 * - Recovery takes 5-10 years
 * 
 * Research:
 * - Carl Sagan et al. (1983): "Nuclear Winter" paper
 * - Robock & Toon (2012): "Local Nuclear War, Global Suffering"
 * - Coupe et al. (2019): "Nuclear Winter Responses to Regional Nuclear War"
 */

/**
 * Radionuclide-specific tracking for fallout composition
 *
 * Research: PMC11604265 (I-131), PMC6995530 (Cs-137), NCI (Sr-90)
 * - I-131: 8.02 day half-life, thyroid concentration
 * - Cs-137: 30.17 year half-life, uniform distribution, soil persistence
 * - Sr-90: 28.79 year half-life, bone accumulation, long biological retention
 */
export interface FalloutComposition {
  // Iodine-131 (short-term thyroid risk)
  iodine131Activity: number;         // Becquerels (initial activity)
  iodine131DecayRate: number;        // Per-month decay (8.02 day half-life → ~0.92/month)

  // Cesium-137 (long-term whole-body exposure)
  cesium137Activity: number;         // Becquerels (initial activity)
  cesium137BiologicalHalfLife: number; // Days (50-150 day range, default 70)

  // Strontium-90 (bone marrow / leukemia risk)
  strontium90Activity: number;       // Becquerels (initial activity)
  strontium90BiologicalHalfLife: number; // Days (18 years in bone)
}

/**
 * Organ-specific dose accumulation (ICRP 103 tissue weighting)
 *
 * Research: ICRP 103 (2007), ICRPaedia
 * - wT = 0.12: Bone marrow, colon, lung, stomach, breast, remainder
 * - wT = 0.08: Gonads
 * - wT = 0.04: Bladder, liver, esophagus, thyroid
 * - wT = 0.01: Bone surface, brain, salivary, skin
 */
export interface OrganDoses {
  boneMarrow: number;      // Gy (wT=0.12, hematopoietic effects)
  colon: number;           // Gy (wT=0.12, GI damage)
  lung: number;            // Gy (wT=0.12, pneumonia risk)
  stomach: number;         // Gy (wT=0.12, GI damage)
  thyroid: number;         // Gy (wT=0.04, but I-131 concentrates 1000x)
  gonads: number;          // Gy (wT=0.08, fertility effects)
  remainderOrgans: number; // Gy (wT=0.12, distributed)
}

/**
 * ARS (Acute Radiation Syndrome) progression tracking
 *
 * Research: CDC 2024, REMM, PMC3863169
 * - Prodromal (0-6d): Nausea, vomiting, fever
 * - Latent (2-20d): Appears healthy, stem cells depleting
 * - Manifest (20-60d): Immunosuppression, infections, bleeding
 * - Recovery/Death (60d+): LD50/60 evaluation point
 */
export interface ARSProgression {
  phase: 'prodromal' | 'latent' | 'manifest' | 'recovery' | 'deceased';
  daysSinceExposure: number;    // Days since radiation exposure
  totalDose: number;            // Total absorbed dose (Gy)

  // Phase transition thresholds (dose-dependent)
  prodromalEndDay: number;      // 2-6 days (higher dose = shorter)
  latentEndDay: number;         // 2-20 days (higher dose = shorter)
  manifestEndDay: number;       // 60 days (LD50/60 evaluation)

  // Medical treatment availability
  hasSupportiveCare: boolean;   // +0.5-1.5 Gy to LD50
  hasGCSF: boolean;             // +1.5-2 Gy to LD50 (G-CSF injections)
  hasTransplant: boolean;       // +2.5-3 Gy to LD50 (bone marrow transplant)
}

/**
 * Population dose cohorts (by exposure level)
 *
 * Research: REMM LD50/60 dose bands
 * - Sublethal: <0.7 Gy (no ARS, low cancer risk)
 * - Moderate: 0.7-2.0 Gy (mild ARS, 5-20% mortality with care)
 * - Severe: 2.0-5.5 Gy (severe ARS, 50-95% mortality)
 * - Lethal: >5.5 Gy (>95% mortality even with intensive care)
 */
export interface PopulationDoseCohorts {
  sublethal: number;    // Population (billions) with <0.7 Gy cumulative
  moderate: number;     // Population (billions) with 0.7-2.0 Gy
  severe: number;       // Population (billions) with 2.0-5.5 Gy
  lethal: number;       // Population (billions) with >5.5 Gy
}

/**
 * Radiation zone tracking per country (ENHANCED - Dec 2025)
 *
 * Countries hit by nuclear weapons experience:
 * - Immediate casualties (already modeled in extinctions.ts)
 * - Time-varying fallout decay (7-10 rule: t^(-1.2))
 * - Organ-specific tissue damage (ICRP 103 weighting)
 * - ARS progression over 60 days
 * - Long-term chronic cancer risk (BEIR VII with uncertainty)
 */
export interface RadiationZone {
  country: string;              // Country name (e.g., "United States")
  hitMonth: number;             // When nuclear strike occurred

  // LEGACY FIELDS (kept for backward compatibility during transition)
  intensity: number;            // [0,1] Radiation level (1 = severe) - DEPRECATED
  decayRate: number;            // Monthly decay rate (typically 0.05 = 5%/month) - DEPRECATED
  currentLevel: number;         // [0,1] Current radiation (decays over time) - DEPRECATED
  monthlyDeathRate: number;     // Additional deaths per month from radiation (0.01 = 1%) - DEPRECATED

  // NEW FIELDS (M-6 Enhanced Radiation Modeling)
  initialDoseRate?: number;     // Gy/hour at t=1h post-detonation
  falloutComposition?: FalloutComposition; // Radionuclide-specific tracking
  organDoses?: OrganDoses;      // ICRP 103 tissue-weighted doses
  populationCohorts?: PopulationDoseCohorts; // Population by exposure level

  // Medical infrastructure availability (affects LD50/60)
  medicalCareLevel?: 'none' | 'minimal' | 'supportive' | 'intensive';
  effectiveLD50?: number;       // Adjusted LD50/60 (Gy) based on medical care

  // Chronic exposure tracking
  cumulativeDose?: number;      // Sv (for BEIR VII cancer risk)
  lifetimeExcessCancerRisk?: number; // Fraction above baseline (0.05 = 5% increase)
}

/**
 * Nuclear Winter State
 *
 * Tracks the multi-year catastrophe following nuclear war:
 * - Soot injection → sunlight blockage
 * - Temperature collapse → crop failure
 * - Mass starvation → 90% mortality
 * - Radiation zones → long-term health impacts
 * - Second-order cascades (2025 research): ozone, precipitation, marine collapse
 *
 * Timeline:
 * - Months 0-6: Soot peak, temperature drops 9°C (full-scale), crops fail
 * - Months 6-24: Starvation peak, 10-15% monthly mortality (Xia et al. 2022)
 * - Months 24-60: Slow recovery, 2-5% monthly mortality
 * - Months 60-120: Long tail, 0.5-2% monthly mortality
 */
export interface NuclearWinterState {
  active: boolean;              // Is nuclear winter currently happening?
  triggerMonth: number;         // When nuclear war occurred

  // Atmospheric effects
  sootInStratosphere: number;   // Teragrams (Tg) of soot (0-150 Tg range)
  sootDecayRate: number;        // Monthly decay rate (typically 0.05 = 5%/month)
  currentSoot: number;          // Current soot level (decays over time)

  // Climate effects (primary)
  temperatureAnomaly: number;   // °C below baseline (negative, e.g., -9°C for 150 Tg)
  baselineTemperature: number;  // Pre-war temperature for recovery calculation
  sunlightBlocked: number;      // [0,1] Fraction of sunlight blocked (0.925 = 92.5% blocked at 150 Tg)

  // Agricultural collapse (primary)
  cropYieldMultiplier: number;  // [0,1] vs normal (0.1 = 90% crop failure)
  monthlyStarvationRate: number; // Deaths per month as fraction of population

  // Second-order cascades (2025 research: Mills et al. 2014, Robock 2024-2025)
  ozoneDepletion: number;        // [0,1] Ozone layer damage (0.5 = 50% depleted)
  ozoneRecoveryRate: number;     // Monthly recovery (0.007 = 10-15 year half-life)
  uvRadiationMultiplier: number; // [1.0, 2.0] Surface UV increase (1.5 = 50% increase)

  precipitationReduction: number; // [0,1] Rainfall reduction vs baseline (0.3 = 30% less)
  monsoonFailureProbability: number; // [0,1] Annual monsoon failure risk

  marineProductivityReduction: number; // [0,1] Phytoplankton die-off (0.3 = 30% reduction)
  oceanDependentPopulationAtRisk: number; // Billions at risk from fish stock collapse

  // Radiation zones
  radiationZones: RadiationZone[];

  // Duration tracking
  monthsSinceWar: number;       // Months elapsed since nuclear war
  peakMortalityMonths: number;  // Duration of peak starvation (typically 18-24 months)
  recoveryStartMonth: number;   // When recovery begins (typically month 24)

  // Mortality tracking
  totalWinterDeaths: number;    // Cumulative deaths from nuclear winter (starvation)
  totalRadiationDeaths: number; // Cumulative deaths from radiation poisoning

  // Performance cache (Nov 20, 2025 - Architecture Review HIGH #2)
  // Cached at war trigger, since deployed techs can't change during nuclear winter
  cachedResilientFoodMultiplier?: number; // [0.6, 1.0] mortality multiplier from pre-deployed tech
}

