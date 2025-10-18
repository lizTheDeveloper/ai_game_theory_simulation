/**
 * Antimicrobial Resistance (AMR) Crisis System (TIER 1.8)
 *
 * Models progressive loss of antibiotic effectiveness over time.
 * Baseline mortality increases exponentially from 1.27M (2019) to 10M (2050).
 *
 * Research foundation:
 * - WHO (2024): 10M annual deaths by 2050, empirical surveillance data (TRL 9)
 * - O'Neill Review (2016): $100T cumulative economic damage by 2050
 * - Antimicrobial Resistance Collaborators (2022, Lancet): 1.27M deaths in 2019
 * - Growth rate: 10% annual increase (exponential, baseline scenario)
 *
 * Key mechanisms:
 * 1. Exponential AMR mortality growth (2-5% baseline, accelerated by overuse)
 * 2. Medical effectiveness decline (100% → 70% floor by 2050)
 * 3. Regional variation (low-income 1.8x, high-income 0.7x)
 * 4. Technology mitigation (phage therapy, new antibiotics reduce growth 15% each)
 *
 * @see plans/antimicrobial-resistance-plan.md
 * @see src/types/antimicrobialResistance.ts
 */

import type { GameState, RNGFunction } from '../types/game';
import type {
  AntimicrobialResistanceSystem,
  AntibioticResistance,
  InfectionTracking,
  RegionalAMRData,
} from '../types/antimicrobialResistance';
import { AMR_MITIGATION_TECHNOLOGIES } from '../types/antimicrobialResistance';

/**
 * Initialize AMR system with 2025 baseline values
 *
 * Baseline calibration:
 * - 2019: 1.27M deaths (Lancet 2022) = 16 per 100K (for 8B population)
 * - 2025: ~2M deaths (10% annual growth from 2019) = 25 per 100K
 * - 2050: 10M deaths (WHO projection) = 125 per 100K
 *
 * Growth rate: 10% annual baseline (can be accelerated by overuse)
 */
export function initializeAMRSystem(): AntimicrobialResistanceSystem {
  // Calculate 2025 baseline from 2019 empirical data
  // 1.27M deaths in 2019, growing 10%/year for 6 years
  const years2019To2025 = 6;
  const deaths2019 = 1.27e6;
  const deaths2025 = deaths2019 * Math.pow(1.10, years2019To2025); // ~2.25M deaths

  // Convert to deaths per 100K (assuming 8B population)
  const baselinePopulation = 8e9;
  const baselineDeathRate = (deaths2025 / baselinePopulation) * 100000; // ~28 per 100K

  // 2050 WHO projection: 10M deaths
  const deaths2050 = 10e6;
  const targetDeathRate = (deaths2050 / baselinePopulation) * 100000; // 125 per 100K

  return {
    // Core mortality metrics
    currentDeathRate: baselineDeathRate,
    baselineDeathRate: baselineDeathRate,
    targetDeathRate: targetDeathRate,
    growthRate: 0.10, // 10% annual increase (WHO baseline scenario)

    // Total deaths tracking
    monthlyDeaths: 0,
    cumulativeDeaths: 0,
    annualDeaths: deaths2025,

    // Medical effectiveness (starts at 100%, declines to 70% floor)
    baselineMedicalEffectiveness: 1.0,
    currentMedicalEffectiveness: 1.0,
    effectivenessDeclineCap: 0.30, // Maximum 30% decline

    // Resistance tracking (initialized per antibiotic class)
    antibioticResistance: initializeAntibioticResistance(),

    // Infection tracking (initialized per category)
    infectionTracking: initializeInfectionTracking(),

    // Regional variation (simplified 3 income levels)
    regionalData: initializeRegionalData(),

    // Acceleration factors (baseline values)
    antibioticOveruseGlobal: 0.5, // Moderate global overuse
    livestockFarmingIntensity: 0.6, // Significant agricultural use
    sanitationQuality: 0.7, // Global average sanitation

    // Mitigation (no technologies deployed initially)
    mitigationTechnologies: [],
    mitigationFactor: 0.0,

    // Healthcare system impacts (baseline = 1.0, no increased risk)
    surgeryRiskMultiplier: 1.0,
    maternalMortalityMultiplier: 1.0,
    cancerSurvivalMultiplier: 1.0,

    // Economic impacts (will accumulate over time)
    healthcareSystemCost: 0,
    cumulativeEconomicDamage: 0,
    icuCapacityStrain: 0,

    // Historical calibration (for validation)
    calibrationYear2019Deaths: deaths2019, // 1.27M
    calibrationYear2025Deaths: deaths2025, // ~2.25M
  };
}

/**
 * Initialize antibiotic resistance tracking
 *
 * Research: Different antibiotic classes have different resistance rates
 * - Penicillins: 40-60% resistance (highest, oldest class)
 * - Cephalosporins: 30-40% resistance
 * - Fluoroquinolones: 25-35% resistance
 * - Carbapenems: 5-15% resistance (last-resort, lowest)
 */
function initializeAntibioticResistance(): AntibioticResistance[] {
  return [
    {
      class: 'penicillins',
      resistancePrevalence: 0.50, // 50% resistant (very high)
      treatmentEffectiveness: 0.50,
      crossResistanceLinks: ['cephalosporins'], // β-lactam cross-resistance
    },
    {
      class: 'cephalosporins',
      resistancePrevalence: 0.35, // 35% resistant
      treatmentEffectiveness: 0.65,
      crossResistanceLinks: ['penicillins'], // β-lactam cross-resistance
    },
    {
      class: 'fluoroquinolones',
      resistancePrevalence: 0.30, // 30% resistant
      treatmentEffectiveness: 0.70,
      crossResistanceLinks: [],
    },
    {
      class: 'macrolides',
      resistancePrevalence: 0.25, // 25% resistant
      treatmentEffectiveness: 0.75,
      crossResistanceLinks: [],
    },
    {
      class: 'tetracyclines',
      resistancePrevalence: 0.20, // 20% resistant
      treatmentEffectiveness: 0.80,
      crossResistanceLinks: [],
    },
    {
      class: 'aminoglycosides',
      resistancePrevalence: 0.15, // 15% resistant
      treatmentEffectiveness: 0.85,
      crossResistanceLinks: [],
    },
    {
      class: 'carbapenems',
      resistancePrevalence: 0.10, // 10% resistant (last-resort)
      treatmentEffectiveness: 0.90,
      crossResistanceLinks: [],
    },
    {
      class: 'glycopeptides',
      resistancePrevalence: 0.05, // 5% resistant (lowest, vancomycin)
      treatmentEffectiveness: 0.95,
      crossResistanceLinks: [],
    },
  ];
}

/**
 * Initialize infection category tracking
 *
 * Research: Different infections have different AMR impacts
 * - Surgical infections: High mortality if resistant (5-10% fatality)
 * - Bloodstream: Very high mortality if resistant (15-25% fatality)
 * - Pneumonia: Moderate-high mortality (10-15% fatality)
 * - UTI: Low mortality even if resistant (1-2% fatality)
 */
function initializeInfectionTracking(): InfectionTracking[] {
  return [
    {
      category: 'surgical',
      annualIncidence: 200, // 200 per 100K (common)
      baselineMortality: 0.02, // 2% fatality without resistance
      amrAdjustedMortality: 0.02,
      healthcareBurden: 5, // 5 ICU days per case
    },
    {
      category: 'pneumonia',
      annualIncidence: 300, // 300 per 100K (very common)
      baselineMortality: 0.05, // 5% fatality without resistance
      amrAdjustedMortality: 0.05,
      healthcareBurden: 7, // 7 ICU days per case
    },
    {
      category: 'bloodstream',
      annualIncidence: 100, // 100 per 100K (less common but deadly)
      baselineMortality: 0.15, // 15% fatality without resistance
      amrAdjustedMortality: 0.15,
      healthcareBurden: 10, // 10 ICU days per case
    },
    {
      category: 'urinary',
      annualIncidence: 500, // 500 per 100K (most common)
      baselineMortality: 0.01, // 1% fatality without resistance
      amrAdjustedMortality: 0.01,
      healthcareBurden: 2, // 2 ICU days per case
    },
    {
      category: 'skin',
      annualIncidence: 150, // 150 per 100K
      baselineMortality: 0.01, // 1% fatality without resistance
      amrAdjustedMortality: 0.01,
      healthcareBurden: 3, // 3 ICU days per case
    },
  ];
}

/**
 * Initialize regional AMR variation
 *
 * Research: WHO surveillance shows stark regional differences
 * - Low-income: 1.8x higher mortality (poor sanitation, overuse, no access to new drugs)
 * - Middle-income: 1.3x higher mortality
 * - High-income: 0.7x lower mortality (better sanitation, stewardship, access to new drugs)
 */
function initializeRegionalData(): RegionalAMRData[] {
  return [
    {
      regionName: 'Low-income countries',
      incomeLevel: 'low',
      mortalityMultiplier: 1.8,
      antibioticOveruse: 0.8, // High overuse (no regulation)
      livestockUse: 0.7, // High agricultural use
      sanitationQuality: 0.3, // Poor sanitation
      accessToNewDrugs: 0.1, // Very limited access
    },
    {
      regionName: 'Middle-income countries',
      incomeLevel: 'middle',
      mortalityMultiplier: 1.3,
      antibioticOveruse: 0.6, // Moderate overuse
      livestockUse: 0.7, // High agricultural use
      sanitationQuality: 0.6, // Moderate sanitation
      accessToNewDrugs: 0.4, // Moderate access
    },
    {
      regionName: 'High-income countries',
      incomeLevel: 'high',
      mortalityMultiplier: 0.7,
      antibioticOveruse: 0.3, // Lower overuse (stewardship programs)
      livestockUse: 0.4, // Moderate agricultural use
      sanitationQuality: 0.9, // Good sanitation
      accessToNewDrugs: 0.8, // Good access to novel antibiotics
    },
  ];
}

/**
 * Calculate current AMR mortality rate (deaths per 100K per year)
 *
 * Exponential growth model: Deaths(t) = Baseline × (1 + growthRate)^years
 *
 * Research: WHO baseline scenario shows 10% annual increase
 * Can be accelerated by overuse or slowed by mitigation technologies
 */
export function calculateAMRMortalityRate(
  state: GameState,
  rng: RNGFunction
): number {
  const amr = state.antimicrobialResistanceSystem;
  const yearsSince2025 = state.currentMonth / 12;

  // Apply acceleration factors (overuse increases growth rate)
  const overuseAcceleration = 1.0 + (amr.antibioticOveruseGlobal * 0.2); // Up to +20% growth
  const livestockAcceleration = 1.0 + (amr.livestockFarmingIntensity * 0.1); // Up to +10% growth
  const sanitationBenefit = 1.0 - ((1.0 - amr.sanitationQuality) * 0.15); // Up to -15% growth if poor

  // Apply mitigation from technologies (reduces growth rate)
  const mitigationReduction = 1.0 - amr.mitigationFactor;

  // Effective growth rate
  const effectiveGrowthRate =
    amr.growthRate *
    overuseAcceleration *
    livestockAcceleration *
    sanitationBenefit *
    mitigationReduction;

  // Exponential growth: Deaths(t) = Baseline × (1 + growthRate)^years
  const currentDeathRate =
    amr.baselineDeathRate * Math.pow(1 + effectiveGrowthRate, yearsSince2025);

  // Cap at 2050 WHO projection (125 per 100K for 10M annual deaths)
  return Math.min(currentDeathRate, amr.targetDeathRate);
}

/**
 * Calculate medical effectiveness decline from AMR
 *
 * Research: O'Neill Review projects 30% decline in medical effectiveness by 2050
 * - Routine surgeries become risky (2x risk)
 * - Cancer chemotherapy less effective (requires antibiotics)
 * - Maternal mortality increases (2x risk)
 *
 * Linear decline proportional to AMR increase:
 * - 2025: 100% effective
 * - 2050: 70% effective (30% decline)
 */
export function calculateMedicalEffectiveness(
  state: GameState
): number {
  const amr = state.antimicrobialResistanceSystem;
  const currentDeathRate = amr.currentDeathRate;
  const baselineDeathRate = amr.baselineDeathRate;
  const targetDeathRate = amr.targetDeathRate;

  // Calculate how far along we are from baseline (2025) to target (2050)
  const progressToTarget =
    (currentDeathRate - baselineDeathRate) /
    (targetDeathRate - baselineDeathRate);

  // Medical effectiveness declines linearly from 100% to 70% (30% cap)
  const effectivenessDecline = progressToTarget * amr.effectivenessDeclineCap;
  const effectiveness = 1.0 - effectivenessDecline;

  // Floor at 70% (some treatments still work)
  return Math.max(effectiveness, 0.7);
}

/**
 * Apply AMR mortality to population
 *
 * Converts annual death rate per 100K to monthly deaths.
 * Adds deaths to population system.
 */
export function applyAMRMortality(
  state: GameState,
  rng: RNGFunction
): void {
  const amr = state.antimicrobialResistanceSystem;
  const population = state.humanPopulationSystem.population * 1e9; // Convert billions to raw number

  // Annual death rate per 100K → monthly death rate
  const annualDeathRatePer100K = amr.currentDeathRate;
  const monthlyDeathRate = annualDeathRatePer100K / 12 / 100000; // Convert to monthly fraction

  // Calculate monthly deaths
  const monthlyDeaths = population * monthlyDeathRate;

  // Add to population system (disease category, convert raw count to billions)
  state.humanPopulationSystem.deathsByCategory.disease += monthlyDeaths / 1e9;

  // Track in AMR system
  amr.monthlyDeaths = monthlyDeaths;
  amr.cumulativeDeaths += monthlyDeaths;

  // Update rolling 12-month total
  // (Simplified: just multiply monthly by 12 for now)
  amr.annualDeaths = monthlyDeaths * 12;

  // Log if deaths are significant
  if (monthlyDeaths > 100000) {
    // >100K deaths/month = >1.2M/year
    console.log(
      `  ⚠️ AMR: ${(monthlyDeaths / 1000).toFixed(0)}K deaths this month (${(amr.annualDeaths / 1e6).toFixed(2)}M annual)`
    );
  }
}

/**
 * Update medical effectiveness impacts
 *
 * AMR reduces healthcare quality and increases risks:
 * - Surgery risk increases (1.0x → 2.0x by 2050)
 * - Maternal mortality increases (1.0x → 2.0x by 2050)
 * - Cancer survival decreases (1.0x → 0.7x by 2050)
 * - Healthcare quality in QoL system reduced
 */
export function updateMedicalEffectivenessImpacts(
  state: GameState
): void {
  const amr = state.antimicrobialResistanceSystem;
  const effectiveness = amr.currentMedicalEffectiveness;

  // Update healthcare system multipliers
  // Surgery risk: 1.0x at 100% effective → 2.0x at 70% effective
  amr.surgeryRiskMultiplier = 2.0 - effectiveness;

  // Maternal mortality: 1.0x at 100% effective → 2.0x at 70% effective
  amr.maternalMortalityMultiplier = 2.0 - effectiveness;

  // Cancer survival: 1.0x at 100% effective → 0.7x at 70% effective
  amr.cancerSurvivalMultiplier = effectiveness;

  // Reduce healthcare quality in QoL system
  // Multiply existing healthcare quality by effectiveness
  state.qualityOfLifeSystems.healthcareQuality *= effectiveness;

  // Log if effectiveness has dropped significantly
  if (effectiveness < 0.85) {
    console.log(
      `  ⚠️ AMR: Medical effectiveness ${(effectiveness * 100).toFixed(0)}% (surgery risk ${amr.surgeryRiskMultiplier.toFixed(2)}x)`
    );
  }
}

/**
 * Update antibiotic resistance prevalence
 *
 * Resistance increases over time based on:
 * - Antibiotic overuse (accelerates resistance)
 * - Livestock farming (agricultural antibiotic use)
 * - Poor sanitation (spreads resistant bacteria)
 *
 * Cross-resistance: Resistance in one class affects linked classes
 */
export function updateAntibioticResistance(
  state: GameState,
  rng: RNGFunction
): void {
  const amr = state.antimicrobialResistanceSystem;

  // Monthly resistance increase (baseline: 0.1% per month = 1.2% per year)
  const baselineMonthlyIncrease = 0.001;

  // Acceleration from overuse and livestock
  const overuseAcceleration = 1.0 + amr.antibioticOveruseGlobal;
  const livestockAcceleration = 1.0 + amr.livestockFarmingIntensity * 0.5;

  // Reduction from sanitation and mitigation
  const sanitationBenefit = amr.sanitationQuality;
  const mitigationReduction = 1.0 - amr.mitigationFactor;

  const effectiveMonthlyIncrease =
    baselineMonthlyIncrease *
    overuseAcceleration *
    livestockAcceleration *
    (1.0 - sanitationBenefit * 0.3) *
    mitigationReduction;

  // Update each antibiotic class
  for (const resistance of amr.antibioticResistance) {
    // Increase resistance prevalence (cap at 95%)
    resistance.resistancePrevalence = Math.min(
      0.95,
      resistance.resistancePrevalence + effectiveMonthlyIncrease
    );

    // Update treatment effectiveness (inverse of resistance)
    resistance.treatmentEffectiveness = 1.0 - resistance.resistancePrevalence;

    // Cross-resistance: If this class has high resistance, increase linked classes
    if (resistance.resistancePrevalence > 0.7) {
      for (const linkedClass of resistance.crossResistanceLinks) {
        const linkedResistance = amr.antibioticResistance.find(
          (r) => r.class === linkedClass
        );
        if (linkedResistance) {
          // Increase linked class by 50% of this class's increase
          linkedResistance.resistancePrevalence = Math.min(
            0.95,
            linkedResistance.resistancePrevalence +
              effectiveMonthlyIncrease * 0.5
          );
          linkedResistance.treatmentEffectiveness =
            1.0 - linkedResistance.resistancePrevalence;
        }
      }
    }
  }
}

/**
 * Apply mitigation from breakthrough technologies
 *
 * Technologies that reduce AMR growth rate:
 * - Phage therapy: 15% reduction (TRL 7)
 * - Narrow-spectrum antibiotics: 15% reduction (TRL 8)
 * - AI antibiotic stewardship: 10% reduction (TRL 6)
 * - Novel antibiotic classes: 20% reduction (TRL 4)
 *
 * Each technology provides cumulative reduction.
 * Full mitigation (4 technologies): 10% growth → ~5% growth (halving)
 */
export function applyAMRMitigation(
  state: GameState
): void {
  const amr = state.antimicrobialResistanceSystem;
  let totalMitigation = 0.0;

  // Check which mitigation technologies are deployed
  const deployedMitigationTechs: string[] = [];

  // Safety check: ensure breakthroughTech.deployed exists
  if (state.breakthroughTech?.deployed) {
    for (const tech of AMR_MITIGATION_TECHNOLOGIES) {
      // Check if technology is deployed in breakthrough tech system
      const isDeployed = state.breakthroughTech.deployed.some(
        (t) => t.id === tech.id
      );

      if (isDeployed) {
        deployedMitigationTechs.push(tech.id);
        totalMitigation += tech.growthRateReduction;
      }
    }
  }

  // Update AMR system
  amr.mitigationTechnologies = deployedMitigationTechs;
  amr.mitigationFactor = Math.min(1.0, totalMitigation); // Cap at 100% mitigation

  // Log if mitigation is active
  if (amr.mitigationFactor > 0) {
    console.log(
      `  AMR Mitigation: ${(amr.mitigationFactor * 100).toFixed(0)}% growth reduction (${deployedMitigationTechs.length} technologies)`
    );
  }
}

/**
 * Calculate economic impact from AMR
 *
 * Research: O'Neill Review projects $100T cumulative damage by 2050
 * - Healthcare costs increase (ICU strain, longer hospital stays)
 * - Productivity losses (morbidity, premature death)
 * - R&D costs for new antibiotics
 *
 * Annual cost scales with death rate (linear approximation)
 */
export function calculateEconomicImpact(
  state: GameState
): void {
  const amr = state.antimicrobialResistanceSystem;

  // O'Neill Review: $100T by 2050 = $4T per year average
  // Scale linearly with death rate
  const targetAnnualCost2050 = 4000; // $4T in billions
  const costPerDeath = targetAnnualCost2050 / amr.targetDeathRate;

  // Current annual cost
  const annualCost = amr.currentDeathRate * costPerDeath;

  // Monthly cost
  const monthlyCost = annualCost / 12;

  // Update state
  amr.healthcareSystemCost = annualCost;
  amr.cumulativeEconomicDamage += monthlyCost / 1000; // Convert to trillions

  // ICU capacity strain (% of ICU beds occupied by AMR cases)
  // Simplified: Assume each death requires 7 days ICU, total ICU beds ~3M globally
  const totalICUBeds = 3e6;
  const amrICUDaysPerMonth = (amr.monthlyDeaths * 7) / 30; // Deaths × 7 days / 30 days
  amr.icuCapacityStrain = Math.min(1.0, amrICUDaysPerMonth / totalICUBeds);
}

/**
 * Update AMR system (called each simulation step)
 *
 * Order of operations:
 * 1. Apply mitigation from technologies
 * 2. Update antibiotic resistance prevalence
 * 3. Calculate current mortality rate
 * 4. Calculate medical effectiveness
 * 5. Apply mortality to population
 * 6. Update medical effectiveness impacts
 * 7. Calculate economic impact
 */
export function updateAMRSystem(
  state: GameState,
  rng: RNGFunction
): void {
  const amr = state.antimicrobialResistanceSystem;

  // 1. Apply mitigation from breakthrough technologies
  applyAMRMitigation(state);

  // 2. Update antibiotic resistance prevalence
  updateAntibioticResistance(state, rng);

  // 3. Calculate current mortality rate
  amr.currentDeathRate = calculateAMRMortalityRate(state, rng);

  // 4. Calculate medical effectiveness
  amr.currentMedicalEffectiveness = calculateMedicalEffectiveness(state);

  // 5. Apply mortality to population
  applyAMRMortality(state, rng);

  // 6. Update medical effectiveness impacts (surgery risk, etc.)
  updateMedicalEffectivenessImpacts(state);

  // 7. Calculate economic impact
  calculateEconomicImpact(state);
}
