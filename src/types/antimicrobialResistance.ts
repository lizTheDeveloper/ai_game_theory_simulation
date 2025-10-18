/**
 * Antimicrobial Resistance (AMR) Crisis Types (TIER 1.8)
 *
 * Models progressive loss of antibiotic effectiveness over time.
 * Baseline mortality increases as routine infections become untreatable,
 * surgeries become risky, and healthcare effectiveness declines.
 *
 * Research backing:
 * - WHO (2024): 10M annual deaths by 2050 from AMR (baseline scenario)
 * - O'Neill Review (2016): $100T cumulative economic damage by 2050
 * - Lancet (2022): 1.27M deaths in 2019, increasing 10%/year
 * - TRL 9: Empirical surveillance data, ongoing monitoring
 *
 * @see plans/antimicrobial-resistance-plan.md
 * @see research/antimicrobial-resistance-validation_20251017.md
 */

/**
 * Antibiotic Classes (8 major categories)
 *
 * Different antibiotic classes lose effectiveness at different rates.
 * Cross-resistance mechanisms mean resistance in one class affects others.
 */
export type AntibioticClass =
  | 'penicillins'           // β-lactams (most common, highest resistance)
  | 'cephalosporins'        // β-lactams (broad spectrum)
  | 'fluoroquinolones'      // DNA synthesis inhibitors
  | 'macrolides'            // Protein synthesis inhibitors
  | 'tetracyclines'         // Protein synthesis inhibitors
  | 'aminoglycosides'       // Protein synthesis inhibitors
  | 'carbapenems'           // Last-resort β-lactams
  | 'glycopeptides';        // Last-resort (vancomycin)

/**
 * Infection Categories
 *
 * Different infection types have different AMR impacts.
 * Research shows surgical and bloodstream infections most affected.
 */
export type InfectionCategory =
  | 'surgical'              // Surgical site infections (highest risk from AMR)
  | 'pneumonia'             // Respiratory infections
  | 'bloodstream'           // Sepsis, bacteremia
  | 'urinary'               // UTIs (high resistance, usually less fatal)
  | 'skin';                 // Skin and soft tissue infections

/**
 * AMR Resistance Tracking by Antibiotic Class
 *
 * Tracks resistance prevalence and treatment effectiveness for each class.
 */
export interface AntibioticResistance {
  class: AntibioticClass;
  resistancePrevalence: number;      // [0, 1] % of infections resistant to this class
  treatmentEffectiveness: number;    // [0, 1] Effectiveness of this class (1 - resistance)
  crossResistanceLinks: AntibioticClass[]; // Classes with cross-resistance
}

/**
 * Infection Category Tracking
 *
 * Tracks mortality and healthcare burden for each infection type.
 */
export interface InfectionTracking {
  category: InfectionCategory;
  annualIncidence: number;           // Cases per 100K population per year
  baselineMortality: number;         // Baseline case fatality rate [0, 1]
  amrAdjustedMortality: number;      // Current mortality with AMR [0, 1]
  healthcareBurden: number;          // ICU days per case (economic impact)
}

/**
 * Regional AMR Variation
 *
 * Low/middle-income countries have faster AMR spread.
 * High-income countries have better access to new antibiotics.
 *
 * Research: WHO surveillance shows 1.8x higher mortality in low-income countries.
 */
export interface RegionalAMRData {
  regionName: string;
  incomeLevel: 'low' | 'middle' | 'high';
  mortalityMultiplier: number;       // Regional multiplier (0.7-1.8)
  antibioticOveruse: number;         // [0, 1] Overuse rate (accelerates resistance)
  livestockUse: number;              // [0, 1] Agricultural antibiotic use
  sanitationQuality: number;         // [0, 1] Sanitation infrastructure
  accessToNewDrugs: number;          // [0, 1] Access to novel antibiotics
}

/**
 * Antimicrobial Resistance System (TIER 1.8)
 *
 * Tracks progressive loss of antibiotic effectiveness.
 * Baseline mortality increases exponentially from 1.27M (2019) to 10M (2050).
 */
export interface AntimicrobialResistanceSystem {
  // Core mortality metrics
  currentDeathRate: number;          // Annual deaths per 100K population
  baselineDeathRate: number;         // 2025 baseline (16 per 100K = 1.27M/8B)
  targetDeathRate: number;           // 2050 WHO projection (125 per 100K = 10M/8B)
  growthRate: number;                // Annual % increase (default: 0.10 = 10%/year)

  // Total deaths tracking
  monthlyDeaths: number;             // Deaths this month from AMR
  cumulativeDeaths: number;          // Total AMR deaths since start
  annualDeaths: number;              // Rolling 12-month deaths

  // Medical effectiveness
  baselineMedicalEffectiveness: number; // 2025 baseline (1.0 = 100%)
  currentMedicalEffectiveness: number;  // Current effectiveness [0.7, 1.0]
  effectivenessDeclineCap: number;      // Maximum decline (0.30 = 30% decline to 70% floor)

  // Resistance tracking by antibiotic class
  antibioticResistance: AntibioticResistance[];

  // Infection category tracking
  infectionTracking: InfectionTracking[];

  // Regional variation
  regionalData: RegionalAMRData[];

  // Acceleration factors
  antibioticOveruseGlobal: number;   // [0, 1] Global overuse rate
  livestockFarmingIntensity: number; // [0, 1] Industrial farming with antibiotics
  sanitationQuality: number;         // [0, 1] Global sanitation average

  // Mitigation from breakthrough technologies
  mitigationTechnologies: string[];  // Deployed AMR mitigation techs
  mitigationFactor: number;          // [0, 1] Reduction in growth rate (0 = no mitigation, 1 = full stop)

  // Healthcare system impacts
  surgeryRiskMultiplier: number;     // [1, 2] Increased surgical risk
  maternalMortalityMultiplier: number; // [1, 2] Increased maternal deaths
  cancerSurvivalMultiplier: number;  // [0.7, 1] Reduced cancer survival (chemo needs antibiotics)

  // Economic impacts
  healthcareSystemCost: number;      // Annual cost ($B) from AMR
  cumulativeEconomicDamage: number;  // Total economic damage ($T)
  icuCapacityStrain: number;         // [0, 1] ICU burden from resistant infections

  // Historical calibration (validation)
  calibrationYear2019Deaths: number; // Should be ~1.27M for validation
  calibrationYear2025Deaths: number; // Projected ~2M
}

/**
 * AMR Mitigation Technologies
 *
 * Breakthrough technologies that can slow/reverse AMR growth.
 * Each technology reduces growth rate by ~15%.
 */
export interface AMRMitigationTech {
  id: string;
  name: string;
  trl: number;                       // Technology Readiness Level [1-9]
  growthRateReduction: number;       // [0, 0.20] % reduction in AMR growth rate
  deploymentCost: number;            // Cost to deploy ($B)
  deployed: boolean;                 // Is this tech currently deployed?
  researchProgress: number;          // [0, 1] Progress toward deployment
}

/**
 * AMR Mitigation Technologies Library
 *
 * Pre-defined technologies from research (TRL 3-8).
 */
export const AMR_MITIGATION_TECHNOLOGIES: AMRMitigationTech[] = [
  {
    id: 'phage-therapy',
    name: 'Bacteriophage Therapy',
    trl: 7,  // Clinical trials ongoing
    growthRateReduction: 0.15,
    deploymentCost: 50,
    deployed: false,
    researchProgress: 0.0,
  },
  {
    id: 'narrow-spectrum-antibiotics',
    name: 'Narrow-Spectrum Precision Antibiotics',
    trl: 8,  // Some approved, limited deployment
    growthRateReduction: 0.15,
    deploymentCost: 30,
    deployed: false,
    researchProgress: 0.0,
  },
  {
    id: 'antibiotic-stewardship-ai',
    name: 'AI-Optimized Antibiotic Prescribing',
    trl: 6,  // Early deployment in hospitals
    growthRateReduction: 0.10,
    deploymentCost: 10,
    deployed: false,
    researchProgress: 0.0,
  },
  {
    id: 'novel-antibiotics',
    name: 'Novel Antibiotic Classes',
    trl: 4,  // Early research, slow pipeline
    growthRateReduction: 0.20,
    deploymentCost: 100,
    deployed: false,
    researchProgress: 0.0,
  },
];
