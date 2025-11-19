/**
 * Novel Entities Crisis System (TIER 1.5)
 * 
 * Models synthetic chemical pollution - 5th planetary boundary breached in 2022.
 * 
 * Key Mechanisms:
 * - Microplastics (everywhere - in blood, placenta, organs)
 * - PFAS "forever chemicals" (99% of human blood, never breaks down)
 * - Endocrine disruptors (hormone system interference)
 * - Reproductive failure (50% sperm count decline in 50 years)
 * - Bioaccumulation (concentrates up food chain)
 * - Slow timeline: 100-200 years of gradual poisoning
 * 
 * Research Sources:
 * - Kate Raworth Planetary Boundaries: 5th boundary breached 2022
 * - Stockholm Resilience: "Novel entities present everywhere"
 * - 50% sperm count decline in 50 years (peer-reviewed studies)
 * - PFAS in 99% of human blood samples
 */

export interface NovelEntitiesSystem {
  // === STATE TRACKING ===
  
  /** Overall synthetic chemical load [0,1] - Microplastics, PFAS, pesticides, pharmaceuticals */
  syntheticChemicalLoad: number;
  
  /** Microplastic concentration [0,1] - In water, air, soil, organisms */
  microplasticConcentration: number;
  
  /** PFAS prevalence [0,1] - "Forever chemicals" contamination */
  pfasPrevalence: number;
  
  /** Endocrine disruption level [0,1] - Hormone system damage */
  endocrineDisruption: number;
  
  /** Reproductive health decline [0,1] - Fertility/sperm count */
  reproductiveHealthDecline: number;
  
  /** Bioaccumulation factor [0,1] - Concentration up food chain */
  bioaccumulationFactor: number;
  
  /** Chronic disease prevalence [0,1] - Cancer, autoimmune, developmental */
  chronicDiseasePrevalence: number;
  
  // === CRISIS FLAGS ===
  
  /** Boundary breached (2022 in reality) */
  boundaryBreached: boolean;
  
  /** Reproductive crisis active (fertility < 0.50) */
  reproductiveCrisisActive: boolean;
  
  /** Chronic disease epidemic (prevalence > 0.40) */
  chronicDiseaseEpidemicActive: boolean;
  
  /** Bioaccumulation collapse (apex predators failing) */
  bioaccumulationCollapseActive: boolean;
  
  // === TIMELINE TRACKING ===
  
  /** Months of exposure accumulation */
  exposureMonths: number;
  
  // === TECHNOLOGY DEPLOYMENT ===

  /** Green chemistry adoption (non-toxic alternatives) */
  greenChemistryDeployment: number; // [0,1]

  /** Circular economy (reduce new chemical production) */
  circularEconomyDeployment: number; // [0,1]

  /** Chemical bans (worst offenders removed) */
  chemicalBansDeployment: number; // [0,1]

  /** Bioremediation (microbes break down chemicals) */
  bioremediationDeployment: number; // [0,1]

  // === CRITICAL FIX (Nov 11, 2025): Stock vs Flow Tracking (Ling 2024, Cousins 2022) ===

  /** Annual emissions rate (Mt/year) - NEW pollution entering environment */
  annualEmissions?: number;

  /** Accumulated stock (Mt) - Legacy contamination from decades of production */
  accumulatedStock?: number;

  /** Atmospheric distribution flag - If true, local cleanup is futile (Cousins 2022) */
  atmosphericDistribution?: boolean;

  /** Natural decay half-life (years) - Time for 50% degradation (500+ for PFAS) */
  naturalDecayHalfLife?: number;

  // === CRITICAL FIX (Nov 12, 2025): Energy Trap Constraints (Ling 2024, Fennell 2024, Cousins 2022) ===

  /** Industrial point source contamination [0,1] - High concentration (mg/L), treatable */
  industrialContamination?: number;

  /** Environmental diffuse contamination [0,1] - Low concentration (ng/L-pg/L), energy trap */
  environmentalContamination?: number;

  /** Monthly atmospheric redeposition rate [0,1] - PFAS re-rains globally (Cousins 2022) */
  atmosphericRedepositionRate?: number;

  /** Biological degradation rate per month [0,1] - Pseudomonas, fungal pathways (2024 research) */
  biologicalDegradationRate?: number;

  /** Legacy stock subject to redeposition (Mt) - Atmospheric reservoir */
  atmosphericReservoirStock?: number;

  // === CRITICAL FIX (Nov 16, 2025): Prevention Technology Tracking ===

  /** Baseline annual emissions (Mt/year) - 2025 starting value (60,000 Mt/yr) */
  baselineAnnualEmissions?: number;

  /** Prevention multiplier [0, 1] - Fraction of baseline emissions still produced */
  /** 1.0 = no prevention, 0.01 = 99% prevented (PFAS ban), 0.0 = 100% prevented */
  preventionMultiplier?: number;
}

