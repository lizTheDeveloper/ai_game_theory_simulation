/**
 * TIER 1.7.5: Enhanced Radiation Modeling
 *
 * Models tissue-specific, dose-dependent radiation exposure:
 * - Acute vs chronic exposure (dose rate effects)
 * - ICRP 103 tissue weighting factors
 * - ARS thresholds for immediate mortality
 * - LNT model for latent cancer risk
 *
 * Research:
 * - ICRP 103 (2007, reaffirmed ICRP 152 2022): Tissue weighting factors
 * - BEIR VII (2006): Cancer risk coefficients
 * - CDC (2024): ARS clinical thresholds
 *
 * @see research/radiation_modeling_20251207.md
 * @see plans/M-6_enhanced_radiation_modeling_design.md
 */

/**
 * ICRP 103 tissue weighting factors (wT)
 * Sum of all weights = 1.00
 *
 * Source: ICRP Publication 103 (2007), Table A.4.2
 * Reaffirmed in ICRP 152 (2022)
 */
export const ICRP_103_TISSUE_WEIGHTS: Record<string, number> = {
  // wT = 0.12 each (most radiosensitive)
  'bone-marrow': 0.12,
  'colon': 0.12,
  'lung': 0.12,
  'stomach': 0.12,
  'breast': 0.12,
  'remainder': 0.12,  // 13 organs combined

  // wT = 0.08
  'gonads': 0.08,

  // wT = 0.04 each
  'bladder': 0.04,
  'esophagus': 0.04,
  'liver': 0.04,
  'thyroid': 0.04,

  // wT = 0.01 each
  'bone-surface': 0.01,
  'brain': 0.01,
  'salivary-glands': 0.01,
  'skin': 0.01,
};

/**
 * ARS (Acute Radiation Syndrome) thresholds
 *
 * Source: CDC Radiation Emergencies (2024), ICRP 118
 */
export const ARS_THRESHOLDS = {
  // Minimum for any symptoms
  PRODROMAL_THRESHOLD: 0.3,  // Gy (mild nausea, fatigue)

  // Clinical ARS begins
  ARS_THRESHOLD: 0.7,  // Gy (hematopoietic syndrome possible)

  // Mortality thresholds
  LD10: 2.0,   // Gy (10% mortality, hematopoietic syndrome)
  LD50_UNTREATED: 3.5,  // Gy (50% mortality without medical care)
  LD50_TREATED: 6.0,    // Gy (50% mortality with intensive care)
  LD90: 8.0,   // Gy (90% mortality even with care)
  LD100: 10.0, // Gy (100% mortality, cerebrovascular syndrome)
};

/**
 * Cancer risk coefficients (LNT model)
 *
 * Source: ICRP 103 (2007), BEIR VII (2006)
 */
export const CANCER_RISK = {
  // Total cancer risk per Sievert
  TOTAL_CANCER_PER_SV: 0.05,      // 5% per Sv (ICRP 103)
  FATAL_CANCER_PER_SV: 0.025,     // 2.5% per Sv (BEIR VII: 50% of cancers fatal)

  // Dose-rate effectiveness factor (DREF)
  // Chronic low-dose exposure has ~2x lower risk than acute
  DREF: 2.0,
  DREF_THRESHOLD: 0.1,  // Gy/hour (below this, apply DREF)
};

/**
 * Radiation exposure tracking per zone
 *
 * Replaces simple monthlyDeathRate with dose-response modeling
 */
export interface RadiationExposure {
  // Zone identification
  country: string;
  hitMonth: number;

  // Acute exposure (immediate, high dose rate)
  acuteExposure: {
    // Initial dose from blast + prompt radiation
    initialDose: number;        // Gy (whole-body equivalent)
    doseRate: number;           // Gy/hour at time of exposure
    timestamp: number;          // Month when acute exposure occurred

    // ARS mortality (calculated once at exposure)
    arsMortalityRate: number;   // [0, 1] Fraction killed by ARS
    arsDeathsApplied: boolean;  // Has ARS mortality been applied?
  };

  // Chronic exposure (ongoing, low dose rate from fallout)
  chronicExposure: {
    // Cumulative dose tracking
    cumulativeDose: number;     // Gy (total lifetime exposure so far)
    monthlyDoseRate: number;    // Gy/month (current fallout exposure)

    // Decay parameters
    decayRate: number;          // Monthly decay (typically 0.05 = 5%/month)
    currentIntensity: number;   // [0,1] Current fallout level (decays over time)

    // Latent cancer risk (calculated monthly)
    lifetimeCancerRisk: number; // [0,1] Probability of radiation-induced cancer
    monthlyCancerDeaths: number; // Deaths per month from latent cancers
  };

  // Tissue-specific doses (optional, for future enhancement)
  tissueDoses?: Map<string, number>;  // Organ → absorbed dose (Gy)
  effectiveDose?: number;             // Weighted sum using ICRP wT factors
}

/**
 * Enhanced nuclear winter state
 * Extends existing NuclearWinterState
 */
export interface EnhancedRadiationTracking {
  // Replace simple radiationZones: RadiationZone[]
  radiationExposures: RadiationExposure[];

  // Separate death tracking
  totalARSDeaths: number;       // Immediate deaths from acute radiation syndrome
  totalCancerDeaths: number;    // Delayed deaths from radiation-induced cancer

  // Total radiation deaths = totalARSDeaths + totalCancerDeaths
  // Replaces existing totalRadiationDeaths
}
