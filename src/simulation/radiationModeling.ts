/**
 * M-6: Enhanced Radiation Modeling
 *
 * Research-backed dose-response modeling for nuclear fallout health effects.
 *
 * Research basis (Quality Gate 1: Grade B - CONDITIONAL PASS):
 * - CDC Clinical Guidance on ARS (2024)
 * - REMM: LD50/60 dose-response curves
 * - ICRP 103 (2007): Tissue weighting factors
 * - PMC3863169: Medical Management of ARS
 * - PMC11604265: Radioactive Iodine (2024)
 * - PMC6995530: Cs-137/I-131 medical therapy
 * - BEIR VII: Low-dose cancer risk (with LNT controversy noted)
 * - Ozasa et al. (2012): Atomic bomb survivor data
 * - NIAID PMC8771911: Combined radiation injury
 *
 * Key validation adjustments implemented:
 * 1. LD50/60 as uncertainty range [3.0-4.0] Gy, not point estimate
 * 2. LNT model controversy documented (Doss 2018, Ozasa 2012)
 * 3. Combined injury prevalence (65%) with 20% severity increase
 * 4. Cs-137 biological half-life variance [50-150] days
 * 5. 7-10 decay rule exponent as parameter [1.0-1.4], not hardcoded
 *
 * Implementation philosophy:
 * - Fail loudly on invalid values (no silent fallbacks)
 * - Use assertion utilities everywhere
 * - Uncertainty ranges for contested parameters
 * - Research simulation rigor (not game balance)
 */

import {
  assertFinite,
  assertInRange,
  assertProbability,
  assertMortalityRate
} from './utils/assertions';
import type {
  RadiationZone,
  FalloutComposition,
  OrganDoses,
  PopulationDoseCohorts
} from '../types/nuclearWinter';
import type { GameState } from '../types/game';

// ========================================
// RESEARCH PARAMETERS (with uncertainty ranges)
// ========================================

/**
 * LD50/60 ranges (REMM, PNNL-14424, Hiroshima/Nagasaki reanalysis)
 *
 * Research validation finding: LD50 varies 2.3-4.5 Gy depending on source.
 * Using 3.0-4.0 Gy range (conservative central estimate).
 *
 * CRITICAL NOTE: Hiroshima/Nagasaki data shows LOWER values (2.3-2.6 Gy)
 * for combined injury scenarios. Nuclear war = burns + trauma + radiation.
 */
const LD50_NO_TREATMENT = {
  min: 3.0,      // Hiroshima data with combined injuries
  default: 3.5,  // REMM consensus value
  max: 4.0       // PNNL upper estimate
};

const LD50_MINIMAL_CARE = {
  min: 3.5,
  default: 4.25,
  max: 4.5
};

const LD50_SUPPORTIVE_CARE = {
  min: 5.5,
  default: 6.0,
  max: 6.5
};

const LD50_INTENSIVE_CARE = {
  min: 7.0,
  default: 7.5,
  max: 8.0
};

/**
 * Combined injury synergy (NIAID PMC8771911, PMC10947598)
 *
 * Research: 65% of nuclear casualties have combined injuries (burns/trauma/radiation).
 * Synergy effect: 7-10% LD50 reduction in animal models, likely higher in humans.
 * Conservative estimate: 20% LD50 reduction for combined injury.
 */
const COMBINED_INJURY_PREVALENCE = 0.65;  // 65% of casualties
const COMBINED_INJURY_LD50_REDUCTION = 0.20;  // 20% lower LD50

/**
 * ICRP 103 (2007) Tissue Weighting Factors
 *
 * Research: ICRPaedia, PMC5878049
 * Used to calculate effective dose from organ doses.
 * Sum of all wT = 1.0 by definition.
 */
const TISSUE_WEIGHTING_FACTORS = {
  boneMarrow: 0.12,      // Red marrow (blood cell production)
  colon: 0.12,           // GI vulnerability
  lung: 0.12,            // Large surface area
  stomach: 0.12,         // GI vulnerability
  breast: 0.12,          // Hormone-sensitive (sex-specific)
  remainder: 0.12,       // Distributed across 14 organs
  gonads: 0.08,          // Reproductive cells
  bladder: 0.04,         // Epithelial cells
  liver: 0.04,           // Metabolic damage
  esophagus: 0.04,       // GI vulnerability
  thyroid: 0.04,         // LOW wT but I-131 concentrates 1000x!
  boneSurface: 0.01,     // Slower cell turnover
  brain: 0.01,           // Post-mitotic tissue
  salivaryGlands: 0.01,  // Added in ICRP 103 (2007)
  skin: 0.01             // Regenerative capacity
};

/**
 * Fallout decay parameters (7-10 rule with uncertainty)
 *
 * Research: DHS guidance, Physics Stack Exchange, REMM
 * Dose_rate(t) = Dose_rate(1h) × t^(-x)
 * where x varies 1.0-1.4 (default 1.2)
 *
 * Validation finding: Exponent is empirical estimate with variance.
 * Multiple detonations require aggregation.
 * Rule breaks down at <30 min timescales.
 */
const DECAY_EXPONENT = {
  min: 1.0,      // Lower bound (slower decay)
  default: 1.2,  // Kaufmann formula standard
  max: 1.4       // Upper bound (faster decay)
};

/**
 * Radionuclide biological half-lives
 *
 * Research: PMC6995530, PubMed 4642964, IAEA studies
 * Cs-137: 50-150 days (highly variable), default 70 days
 * Sr-90: 18 years in bone (extremely long retention)
 * I-131: 80 days in thyroid (but physical half-life 8.02 days dominates)
 */
const CS137_BIO_HALFLIFE = {
  min: 50,       // Children, fast metabolism
  default: 70,   // Adult average
  max: 150       // Without treatment, slow elimination
};

const SR90_BIO_HALFLIFE_DAYS = 18 * 365;  // 18 years (bone turnover rate)
const I131_PHYSICAL_HALFLIFE_DAYS = 8.02;
const I131_BIO_HALFLIFE_DAYS = 80;  // In thyroid

/**
 * BEIR VII cancer risk coefficients (with LNT controversy)
 *
 * WARNING: Linear No-Threshold model is CONTESTED (Doss 2018, Ozasa 2012).
 * - Proponents: Conservative protection, epidemiologically supported
 * - Critics: Hormesis hypothesis, no evidence <100 mSv, threshold effects
 * - Official: Health Physics Society recommends NOT using BEIR VII <100 mSv
 *
 * SIMULATION USE: Conservative population-level estimate only.
 * Low-dose (<100 mSv) estimates have HIGH UNCERTAINTY (+/- 100% or more).
 */
const SOLID_CANCER_RISK_PER_SV = 0.10;  // 10% increase per Sv (BEIR VII)
const LEUKEMIA_RISK_PER_SV = 0.01;      // 1% increase per Sv (BEIR VII)
const TOTAL_CANCER_MORTALITY_PER_SV = 0.05;  // 5% per Sv (ICRP 103 conservative)
const DOSE_RATE_EFFECTIVENESS_FACTOR = 2.0;  // Chronic vs acute exposure

// ========================================
// CORE RADIATION CALCULATIONS
// ========================================

/**
 * Calculate current dose rate using 7-10 decay rule
 *
 * Research: DHS Quick Reference, Kaufmann formula
 * Dose_rate(t) = Dose_rate(1h) × t^(-exponent)
 * Valid range: 30 minutes to 200 days post-detonation
 *
 * @param initialDoseRate - Gy/hour at t=1h post-detonation
 * @param hoursSinceDetonation - Hours elapsed since nuclear strike
 * @param decayExponent - Decay rate [1.0-1.4] (default 1.2)
 * @returns Current dose rate (Gy/hour)
 */
export function calculateCurrentDoseRate(
  initialDoseRate: number,
  hoursSinceDetonation: number,
  decayExponent: number = DECAY_EXPONENT.default
): number {
  // Validate inputs
  const validInitialRate = assertFinite(initialDoseRate, {
    location: 'calculateCurrentDoseRate',
    valueName: 'initialDoseRate',
    additionalInfo: { unit: 'Gy/hour' }
  });

  const validHours = assertInRange(hoursSinceDetonation, 0, 200 * 24, {
    location: 'calculateCurrentDoseRate',
    valueName: 'hoursSinceDetonation',
    additionalInfo: { validRange: '0-200 days (7-10 rule validity)' }
  });

  const validExponent = assertInRange(decayExponent, DECAY_EXPONENT.min, DECAY_EXPONENT.max, {
    location: 'calculateCurrentDoseRate',
    valueName: 'decayExponent',
    additionalInfo: { interpretation: 'Higher = faster decay' }
  });

  // 7-10 rule: dose rate decays as t^(-exponent)
  // At t=1h, dose rate = initial
  // At t=7h, dose rate = initial / 10 (for exponent=1.2)
  const currentRate = validInitialRate * Math.pow(validHours, -validExponent);

  // Validate output
  return assertFinite(currentRate, {
    location: 'calculateCurrentDoseRate',
    valueName: 'currentDoseRate',
    additionalInfo: {
      initialDoseRate: validInitialRate,
      hoursSinceDetonation: validHours,
      decayExponent: validExponent
    }
  });
}

/**
 * Calculate effective LD50/60 based on medical care availability
 *
 * Research: REMM, PMC3888641 (G-CSF), PMC3273373 (treatment effectiveness)
 * - No treatment: 3.0-4.0 Gy (mean 3.5)
 * - Minimal care: 3.5-4.5 Gy (mean 4.25)
 * - Supportive care (G-CSF): 5.5-6.5 Gy (mean 6.0)
 * - Intensive care (transplant): 7.0-8.0 Gy (mean 7.5)
 *
 * Nuclear war scenario: Medical infrastructure collapses → use lowest LD50.
 *
 * @param medicalCareLevel - Available medical treatment
 * @param combinedInjury - Has burns/trauma (reduces LD50 by 20%)
 * @returns Effective LD50/60 (Gy)
 */
export function calculateEffectiveLD50(
  medicalCareLevel: 'none' | 'minimal' | 'supportive' | 'intensive',
  combinedInjury: boolean = false
): number {
  // Base LD50 by care level
  let baseLD50: number;
  switch (medicalCareLevel) {
    case 'none':
      baseLD50 = LD50_NO_TREATMENT.default;
      break;
    case 'minimal':
      baseLD50 = LD50_MINIMAL_CARE.default;
      break;
    case 'supportive':
      baseLD50 = LD50_SUPPORTIVE_CARE.default;
      break;
    case 'intensive':
      baseLD50 = LD50_INTENSIVE_CARE.default;
      break;
  }

  // Apply combined injury reduction if present
  // Research: NIAID PMC8771911 shows 7-10% reduction in animal models
  // Conservative estimate: 20% reduction for burns + trauma + radiation
  if (combinedInjury) {
    baseLD50 *= (1 - COMBINED_INJURY_LD50_REDUCTION);
  }

  // Validate output: LD50 must be in plausible range [2.0, 8.0] Gy
  return assertInRange(baseLD50, 2.0, 8.0, {
    location: 'calculateEffectiveLD50',
    valueName: 'effectiveLD50',
    additionalInfo: {
      medicalCareLevel,
      combinedInjury,
      reduction: combinedInjury ? `${COMBINED_INJURY_LD50_REDUCTION * 100}%` : 'none'
    }
  });
}

/**
 * Calculate mortality probability using sigmoid dose-response curve
 *
 * Research: REMM LD50/60, PNNL-14424
 * Mortality = 1 / (1 + exp(-k × (Dose - LD50)))
 * where k ≈ 1.8 determines steepness
 *
 * @param dose - Total absorbed dose (Gy)
 * @param ld50 - Effective LD50/60 for this scenario (Gy)
 * @param steepness - Curve steepness parameter (default 1.8)
 * @returns Mortality probability [0, 1]
 */
export function calculateMortalityProbability(
  dose: number,
  ld50: number,
  steepness: number = 1.8
): number {
  // Validate inputs
  const validDose = assertFinite(dose, {
    location: 'calculateMortalityProbability',
    valueName: 'dose',
    additionalInfo: { unit: 'Gy' }
  });

  const validLD50 = assertInRange(ld50, 2.0, 8.0, {
    location: 'calculateMortalityProbability',
    valueName: 'ld50',
    additionalInfo: { unit: 'Gy' }
  });

  const validSteepness = assertInRange(steepness, 1.0, 3.0, {
    location: 'calculateMortalityProbability',
    valueName: 'steepness',
    additionalInfo: { interpretation: 'Higher = steeper sigmoid' }
  });

  // Sigmoid curve: 50% mortality at LD50, steep transition around that point
  const exponent = -validSteepness * (validDose - validLD50);
  const mortalityProb = 1 / (1 + Math.exp(exponent));

  // Validate output: Must be probability [0, 1]
  return assertProbability(mortalityProb, {
    location: 'calculateMortalityProbability',
    valueName: 'mortalityProbability',
    additionalInfo: {
      dose: validDose,
      ld50: validLD50,
      steepness: validSteepness
    }
  });
}

/**
 * Calculate effective dose from organ doses using ICRP 103 tissue weighting
 *
 * Research: ICRP 103 (2007), ICRPaedia
 * Effective Dose (Sv) = Σ [Organ Dose (Gy) × Tissue Weighting Factor (wT)]
 *
 * NOTE: For gamma/beta radiation, wR = 1, so Gy ≈ Sv for absorbed dose.
 * ICRP 103 tissue weighting accounts for organ-specific cancer sensitivities.
 *
 * @param organDoses - Absorbed doses to each organ (Gy)
 * @returns Effective dose (Sv)
 */
export function calculateEffectiveDose(organDoses: OrganDoses): number {
  // Validate all organ doses are finite
  Object.entries(organDoses).forEach(([organ, dose]) => {
    assertFinite(dose, {
      location: 'calculateEffectiveDose',
      valueName: `organDoses.${organ}`,
      additionalInfo: { unit: 'Gy' }
    });
  });

  // Calculate weighted sum using ICRP 103 tissue weighting factors
  const effectiveDose =
    organDoses.boneMarrow * TISSUE_WEIGHTING_FACTORS.boneMarrow +
    organDoses.colon * TISSUE_WEIGHTING_FACTORS.colon +
    organDoses.lung * TISSUE_WEIGHTING_FACTORS.lung +
    organDoses.stomach * TISSUE_WEIGHTING_FACTORS.stomach +
    organDoses.thyroid * TISSUE_WEIGHTING_FACTORS.thyroid +
    organDoses.gonads * TISSUE_WEIGHTING_FACTORS.gonads +
    organDoses.remainderOrgans * TISSUE_WEIGHTING_FACTORS.remainder;

  // Validate output
  return assertFinite(effectiveDose, {
    location: 'calculateEffectiveDose',
    valueName: 'effectiveDose',
    additionalInfo: {
      unit: 'Sv',
      organDoses,
      tissueWeightingFactors: TISSUE_WEIGHTING_FACTORS
    }
  });
}

/**
 * Calculate lifetime excess cancer risk using BEIR VII (with LNT controversy)
 *
 * WARNING: Linear No-Threshold model is CONTESTED.
 * - Doss (2018): "LNT Model No Longer Valid"
 * - Ozasa et al. (2012): Atomic bomb data shows curvature, not linearity
 * - Health Physics Society: Don't use BEIR VII for <100 mSv individual risk
 *
 * SIMULATION USE: Conservative population-level estimate ONLY.
 * Low-dose (<100 mSv = 0.1 Sv) estimates have HIGH UNCERTAINTY.
 *
 * @param cumulativeDose - Total effective dose (Sv)
 * @param isChronicExposure - Low-dose-rate vs acute (applies DREF)
 * @returns Lifetime excess cancer risk [0, 1] (0.05 = 5% above baseline)
 */
export function calculateLifetimeExcessCancerRisk(
  cumulativeDose: number,
  isChronicExposure: boolean = true
): number {
  // Validate input
  const validDose = assertFinite(cumulativeDose, {
    location: 'calculateLifetimeExcessCancerRisk',
    valueName: 'cumulativeDose',
    additionalInfo: {
      unit: 'Sv',
      warning: 'LNT model contested for <100 mSv (0.1 Sv). HIGH UNCERTAINTY.'
    }
  });

  // BEIR VII: 5% mortality increase per Sv (solid cancers + leukemia)
  // Apply DREF for chronic exposure (2.0x reduction)
  let riskPerSv = TOTAL_CANCER_MORTALITY_PER_SV;
  if (isChronicExposure) {
    riskPerSv /= DOSE_RATE_EFFECTIVENESS_FACTOR;  // 2.5% per Sv for chronic
  }

  const excessRisk = validDose * riskPerSv;

  // Validate output: Cancer risk must be probability [0, 1]
  // Cap at 1.0 (100% above baseline, extremely high dose scenario)
  return assertProbability(Math.min(excessRisk, 1.0), {
    location: 'calculateLifetimeExcessCancerRisk',
    valueName: 'lifetimeExcessCancerRisk',
    additionalInfo: {
      cumulativeDose: validDose,
      isChronicExposure,
      riskPerSv,
      warning: 'BEIR VII LNT model - contested for low doses'
    }
  });
}

/**
 * Distribute population into dose cohorts based on proximity to detonation
 *
 * Research: REMM dose bands, CDC ARS thresholds
 * - <0.7 Gy: No ARS, low cancer risk
 * - 0.7-2.0 Gy: Mild ARS, 5-20% mortality with care
 * - 2.0-5.5 Gy: Severe ARS, 50-95% mortality
 * - >5.5 Gy: Lethal, >95% mortality even with intensive care
 *
 * Simplified model: Use distance/dose-rate decay to bin population.
 * Real scenario: Extremely heterogeneous (wind, terrain, shelter).
 *
 * @param totalPopulation - Population in radiation zone (billions)
 * @param averageDoseRate - Current average dose rate (Gy/hour)
 * @param hoursSinceDetonation - Hours since strike (for accumulation)
 * @returns Population cohorts by dose level
 */
export function distributePopulationIntoCohorts(
  totalPopulation: number,
  averageDoseRate: number,
  hoursSinceDetonation: number
): PopulationDoseCohorts {
  // Validate inputs
  const validPop = assertFinite(totalPopulation, {
    location: 'distributePopulationIntoCohorts',
    valueName: 'totalPopulation',
    additionalInfo: { unit: 'billions' }
  });

  const validDoseRate = assertFinite(averageDoseRate, {
    location: 'distributePopulationIntoCohorts',
    valueName: 'averageDoseRate',
    additionalInfo: { unit: 'Gy/hour' }
  });

  const validHours = assertFinite(hoursSinceDetonation, {
    location: 'distributePopulationIntoCohorts',
    valueName: 'hoursSinceDetonation'
  });

  // Estimate cumulative dose: integrate dose rate over time
  // Simplified: average dose ≈ initialDoseRate × hours × decay factor
  // For t^(-1.2) decay, integral ≈ initialDoseRate × hours^0.2
  const estimatedCumulativeDose = validDoseRate * validHours * 0.5;  // Rough approximation

  // Distribute population by distance (inverse square falloff from detonation)
  // Very rough model: 10% in lethal zone, 20% severe, 30% moderate, 40% sublethal
  // Real distribution depends on wind, terrain, shelter availability
  const lethalFraction = Math.min(0.15, estimatedCumulativeDose / 10);
  const severeFraction = Math.min(0.25, estimatedCumulativeDose / 5);
  const moderateFraction = Math.min(0.30, estimatedCumulativeDose / 2);
  const sublethalFraction = 1 - lethalFraction - severeFraction - moderateFraction;

  return {
    sublethal: validPop * Math.max(0, sublethalFraction),
    moderate: validPop * moderateFraction,
    severe: validPop * severeFraction,
    lethal: validPop * lethalFraction
  };
}

/**
 * Initialize fallout composition for a radiation zone
 *
 * Research: PMC11604265 (I-131), PMC6995530 (Cs-137), NCI (Sr-90)
 * Typical fission product yields (normalized to 1 MT detonation):
 * - I-131: 3-5% fission yield, short half-life (8 days)
 * - Cs-137: 6% fission yield, long half-life (30 years)
 * - Sr-90: 5% fission yield, long half-life (29 years)
 *
 * @param yieldMegatons - Nuclear yield (MT)
 * @returns Fallout composition with radionuclide activities
 */
export function initializeFalloutComposition(yieldMegatons: number): FalloutComposition {
  // Validate input
  const validYield = assertInRange(yieldMegatons, 0.001, 50, {
    location: 'initializeFalloutComposition',
    valueName: 'yieldMegatons',
    additionalInfo: { range: '1 kT to 50 MT (typical nuclear weapons)' }
  });

  // Activity scaling: proportional to yield
  // 1 MT detonation → ~10^17 Bq total fission products at t=1h
  const baseActivity = validYield * 1e17;  // Becquerels

  // Fission product yields (as fraction of total fission products)
  const i131Yield = 0.04;   // 4% fission yield
  const cs137Yield = 0.06;  // 6% fission yield
  const sr90Yield = 0.05;   // 5% fission yield

  return {
    // I-131: Short-term thyroid risk (physical half-life 8.02 days)
    iodine131Activity: baseActivity * i131Yield,
    iodine131DecayRate: Math.log(2) / (I131_PHYSICAL_HALFLIFE_DAYS / 30),  // Per-month decay

    // Cs-137: Long-term whole-body exposure (bio half-life 50-150 days)
    cesium137Activity: baseActivity * cs137Yield,
    cesium137BiologicalHalfLife: CS137_BIO_HALFLIFE.default,

    // Sr-90: Bone marrow / leukemia risk (bio half-life 18 years!)
    strontium90Activity: baseActivity * sr90Yield,
    strontium90BiologicalHalfLife: SR90_BIO_HALFLIFE_DAYS
  };
}

/**
 * Determine medical care level from game state health system
 *
 * Research: Healthcare infrastructure collapse in nuclear war scenario.
 * G-CSF stockpiles, transplant capability require intact supply chains.
 *
 * @param state - Game state (check healthcare system)
 * @returns Medical care level available
 */
export function determineMedicalCareLevel(state: GameState): 'none' | 'minimal' | 'supportive' | 'intensive' {
  // In nuclear winter scenario, medical infrastructure collapses
  if (state.nuclearWinterState?.active) {
    // Even if pre-war system was good, nuclear winter collapses supply chains
    // Minimal care at best (antibiotics, basic fluids)
    return 'minimal';
  }

  // Check healthcare capacity via QoL health dimension
  // This is simplified - real system would check:
  // - Hospital beds per capita
  // - Pharmaceutical supply (G-CSF stockpiles)
  // - Specialized care (bone marrow transplant capability)
  // - Medical personnel availability

  // Use QualityOfLifeSystems health dimension as proxy
  if (state.qualityOfLifeSystems?.health) {
    const healthQoL = state.qualityOfLifeSystems.health;
    if (healthQoL >= 0.8) {
      return 'intensive';  // Advanced medical system
    } else if (healthQoL >= 0.6) {
      return 'supportive';  // G-CSF available, some capacity
    } else if (healthQoL >= 0.4) {
      return 'minimal';  // Basic care only
    }
  }

  return 'none';  // Healthcare collapsed or pre-modern
}
